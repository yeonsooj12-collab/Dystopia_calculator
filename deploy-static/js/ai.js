import { toDisplayText } from "./interpretation.js";

const CORE_KEYS = ["pressure", "target", "technology", "transformation", "ideology"];
const DETAIL_KEYS = ["actor", "mechanism", "metric", "benefit", "careNarrative"];
const AMPLIFIER_KEYS = ["classDistortion", "feedbackLoop", "victimInternalization", "irreversibility"];
const ALL_KEYS = [...CORE_KEYS, ...DETAIL_KEYS, ...AMPLIFIER_KEYS];
const AI_RESPONSE_STATUS = new Set(["success", "incomplete", "fallback", "error"]);
const FORBIDDEN_RESPONSE_FIELDS = [
  "creativityScore",
  "qualityScore",
  "compatibilityScore",
  "realismScore",
  "grade",
  "ranking",
  "correct",
  "incorrect",
];
const FORBIDDEN_WORDS = [
  "틀린 조합",
  "연결성이 낮다",
  "창의성이 부족하다",
  "현실성이 없다",
  "좋은 아이디어가 아니다",
  "정답",
  "오답",
];

export const AI_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "version",
    "status",
    "interpretationMode",
    "headline",
    "connectionReading",
    "centralContradiction",
    "settingDraft",
    "possibleBridge",
    "questions",
    "alternativeReadings",
    "cautions",
    "preservedUserElements",
    "generatedSuggestions",
  ],
  properties: {
    version: { type: "string" },
    status: { type: "string", enum: ["success", "incomplete", "fallback", "error"] },
    interpretationMode: { type: "string", enum: ["editor"] },
    headline: { type: "string" },
    connectionReading: { type: "string" },
    centralContradiction: {
      type: "object",
      additionalProperties: false,
      required: ["statement", "explanation"],
      properties: {
        statement: { type: "string" },
        explanation: { type: "string" },
      },
    },
    settingDraft: { type: "string" },
    possibleBridge: {
      type: "object",
      additionalProperties: false,
      required: ["statement", "assumptions"],
      properties: {
        statement: { type: "string" },
        assumptions: {
          type: "array",
          maxItems: 4,
          items: { type: "string" },
        },
      },
    },
    questions: {
      type: "array",
      maxItems: 4,
      items: { type: "string" },
    },
    alternativeReadings: {
      type: "array",
      maxItems: 2,
      items: { type: "string" },
    },
    cautions: {
      type: "array",
      maxItems: 4,
      items: { type: "string" },
    },
    preservedUserElements: {
      type: "array",
      maxItems: 14,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "label", "rawText", "source"],
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          rawText: { type: "string" },
          source: { type: "string", enum: ["preset", "custom"] },
        },
      },
    },
    generatedSuggestions: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "text"],
        properties: {
          type: { type: "string" },
          text: { type: "string" },
        },
      },
    },
  },
};

export const AI_SYSTEM_PROMPT = [
  "당신은 미래사회 풍자 설정을 평가하는 심사위원이 아니라 해석자이자 편집자입니다.",
  "사용자 입력 사이에 명백한 연결이 없어도 실패로 판정하지 말고, 가능한 매개 논리를 찾으세요.",
  "낯선 조합이 만드는 풍자 가능성을 우선 살피고, 사용자가 결정해야 할 조건은 질문으로 남기세요.",
  "사용자가 입력한 내용과 AI가 제안한 해석을 구분하세요.",
  "점수, 등급, 정답/오답 판정, 창의성 평가는 절대 쓰지 마세요.",
  "한국어로 간결하게 작성하고, 기본 화면에 핵심 해석/중심 모순/설정 초안이 바로 드러나게 하세요.",
].join("\n");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function trimText(value, max = 700) {
  const text = toDisplayText(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function normalizeArray(value, max, itemMax = 180) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => trimText(item, itemMax)).filter(Boolean).slice(0, max);
}

function getSelectionOption(selection = {}, key) {
  return selection.core?.[key] || selection.detail?.[key] || selection.amplifier?.[key] || null;
}

function mapSelectionItem(selection = {}, key) {
  const option = getSelectionOption(selection, key);
  if (!option) return null;
  return {
    key,
    label: trimText(option.label || option.rawText || ""),
    rawText: trimText(option.rawText || option.label || ""),
    source: option.source === "custom" ? "custom" : "preset",
    description: trimText(option.description || ""),
    tags: {
      domains: Array.isArray(option.domains) ? [...option.domains] : [],
      functions: Array.isArray(option.functions) ? [...option.functions] : [],
      rights: Array.isArray(option.rights) ? [...option.rights] : [],
      tones: Array.isArray(option.tones) ? [...option.tones] : [],
      needs: Array.isArray(option.needs) ? [...option.needs] : [],
      enables: Array.isArray(option.enables) ? [...option.enables] : [],
      mechanisms: Array.isArray(option.mechanisms) ? [...option.mechanisms] : [],
    },
  };
}

function mapGroup(selection, keys) {
  return Object.fromEntries(keys.map((key) => [key, mapSelectionItem(selection, key)]));
}

export function getSelectedInputSummary(aiInput = {}) {
  const groups = [aiInput.selections?.core, aiInput.selections?.details, aiInput.selections?.amplifiers];
  return groups
    .flatMap((group) => Object.values(group || {}))
    .filter(Boolean)
    .map((item) => ({
      key: item.key,
      label: item.label,
      rawText: item.rawText,
      source: item.source,
    }));
}

export function extractRuleBasedContext({ evaluation = {}, interpretation = {} } = {}) {
  return {
    confidence: evaluation.confidence || interpretation.metadata?.confidence || "low",
    evidenceCoverage: typeof evaluation.evidenceCoverage === "number"
      ? evaluation.evidenceCoverage
      : interpretation.metadata?.evidenceCoverage || 0,
    missingCoreCategories: Array.isArray(interpretation.missingCoreCategories)
      ? clone(interpretation.missingCoreCategories)
      : [],
    strengths: Array.isArray(interpretation.strengths) ? clone(interpretation.strengths) : [],
    uncertainPairs: Array.isArray(interpretation.uncertain) ? clone(interpretation.uncertain) : [],
    reflectionQuestions: Array.isArray(interpretation.reflectionQuestions)
      ? interpretation.reflectionQuestions.slice(0, 4)
      : [],
  };
}

export function buildAiInput({ formState = {}, resolvedInputs = {}, evaluation = {}, interpretation = {} } = {}) {
  const before = clone({ formState, resolvedInputs, evaluation, interpretation });
  const selection = resolvedInputs.selection ? resolvedInputs.selection : resolvedInputs;
  const selections = {
    core: mapGroup(selection, CORE_KEYS),
    details: mapGroup(selection, DETAIL_KEYS),
    amplifiers: mapGroup(selection, AMPLIFIER_KEYS),
  };
  const sources = Object.fromEntries(
    ALL_KEYS.map((key) => {
      const item = getSelectionOption(selection, key);
      return [key, item ? (item.source === "custom" ? "custom" : "preset") : null];
    }),
  );
  const aiInput = {
    version: "1.0",
    selections,
    sources,
    ruleContext: extractRuleBasedContext({ evaluation, interpretation }),
    userIntent: {
      mode: "interpret",
      language: "ko",
      preserveUserText: true,
      doNotScoreCreativity: true,
      exploreUnusualConnections: true,
    },
  };
  if (JSON.stringify(before) !== JSON.stringify({ formState, resolvedInputs, evaluation, interpretation })) {
    throw new Error("buildAiInput must not mutate input.");
  }
  return aiInput;
}

export function validateAiInput(aiInput) {
  if (!aiInput || typeof aiInput !== "object") {
    return { ok: false, status: "empty", issues: ["AI 입력이 비어 있습니다."] };
  }
  const selected = getSelectedInputSummary(aiInput);
  if (selected.length === 0) {
    return { ok: false, status: "empty", issues: ["작성된 항목이 없습니다."] };
  }
  return {
    ok: true,
    status: aiInput.ruleContext?.missingCoreCategories?.length > 0 ? "partial" : "ready",
    issues: [],
  };
}

export function buildAiRequestPayload(aiInput) {
  return {
    version: "1.0",
    task: "future-satire-editor-interpretation",
    mode: "interpret",
    input: aiInput,
    responseFormat: {
      type: "json",
      schemaName: "futureSatireEditorResponse",
    },
  };
}

export function buildOpenAiStructuredRequest(aiInput, { model = "gpt-4.1-mini" } = {}) {
  return {
    model,
    store: false,
    input: [
      {
        role: "system",
        content: AI_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify(buildAiRequestPayload(aiInput)),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "future_satire_editor_response",
        strict: true,
        schema: AI_RESPONSE_JSON_SCHEMA,
      },
    },
  };
}

export function createEmptyAiResponse(status = "incomplete") {
  return {
    version: "1.0",
    status,
    interpretationMode: "editor",
    headline: "",
    connectionReading: "",
    centralContradiction: {
      statement: "",
      explanation: "",
    },
    settingDraft: "",
    possibleBridge: {
      statement: "",
      assumptions: [],
    },
    questions: [],
    alternativeReadings: [],
    cautions: [],
    preservedUserElements: [],
    generatedSuggestions: [],
  };
}

function selectedLabel(aiInput, key) {
  return aiInput.selections?.core?.[key]?.label || "";
}

function selectedDescriptions(aiInput) {
  return getSelectedInputSummary(aiInput).map((item) => item.label).filter(Boolean);
}

export function createMockAiResponse(aiInput = {}) {
  const validation = validateAiInput(aiInput);
  if (validation.status === "empty") return createEmptyAiResponse("incomplete");

  const pressure = selectedLabel(aiInput, "pressure");
  const target = selectedLabel(aiInput, "target");
  const technology = selectedLabel(aiInput, "technology");
  const transformation = selectedLabel(aiInput, "transformation");
  const ideology = selectedLabel(aiInput, "ideology");
  const selected = selectedDescriptions(aiInput);
  const bridgeParts = [
    pressure && `사회문제 '${pressure}'`,
    target && `대상 '${target}'`,
    technology && `기술 '${technology}'`,
    transformation && `제도 변화 '${transformation}'`,
    ideology && `명분 '${ideology}'`,
  ].filter(Boolean);
  const bridgeStatement = bridgeParts.length >= 2
    ? `${bridgeParts.join(", ")}을 직접 인과가 아니라 제도적 책임 이전과 행정 분류의 과정으로 이어보는 가능한 해석입니다.`
    : "작성된 항목을 중심으로 가능한 연결 방식을 더 탐색할 수 있습니다.";
  const centralStatement = target && transformation
    ? `${target}이 ${transformation}의 조건 안으로 들어가면서, 보호나 효율의 언어가 새로운 부담으로 뒤집힙니다.`
    : "작성된 항목 사이에서 좋은 명분과 실제 부담이 어긋나는 지점을 더 정할 수 있습니다.";
  return {
    version: "1.0",
    status: validation.status === "partial" ? "incomplete" : "success",
    interpretationMode: "editor",
    headline: validation.status === "partial"
      ? "작성된 항목을 중심으로 가능한 미친 소리 방향을 미리 살펴봅니다."
      : "이 조합은 익숙한 인과관계보다 책임이 이동하는 방식의 미친 소리로 읽을 수 있습니다.",
    connectionReading: bridgeStatement,
    centralContradiction: {
      statement: centralStatement,
      explanation: ideology
        ? `${ideology}이라는 명분이 실제로는 누군가에게 비용, 의무, 권리 제한을 먼저 배정하는 구조로 바뀔 수 있습니다.`
        : "명분을 더 정하면, 제도가 스스로를 좋은 일처럼 설명하면서 실제로는 부담을 옮기는 지점이 선명해집니다.",
    },
    settingDraft: selected.length > 0
      ? `${selected.join(", ")}을 바탕으로, 사회가 어떤 문제를 해결한다는 이유로 특정 집단의 권리와 의무를 새롭게 배정하는 미래사회 설정으로 발전시킬 수 있습니다.`
      : "",
    possibleBridge: {
      statement: bridgeStatement,
      assumptions: [
        "이 제도가 실제로 누구에게 어떤 의무를 먼저 부과하는지 정해야 합니다.",
        "예외를 살 수 있는 집단이 있는지 정해야 합니다.",
      ],
    },
    questions: [
      "대상에게 의무가 부과되는 기준은 무엇인가?",
      "누가 이 의무에서 예외가 될 수 있는가?",
      "사회는 이를 어떤 공정성의 언어로 정당화하는가?",
      "이 선택을 되돌리기 어렵게 만드는 장치는 무엇인가?",
    ],
    alternativeReadings: [
      "이 조합은 권리의 점수화가 새로운 신분이 되는 이야기로도 읽을 수 있습니다.",
      "또는 복지 언어가 특정 집단의 의무를 자발성으로 포장하는 이야기로 볼 수 있습니다.",
    ],
    cautions: ["새로 제시한 연결은 가능한 해석이며, 확정된 설정이 아닙니다."],
    preservedUserElements: getSelectedInputSummary(aiInput),
    generatedSuggestions: [
      { type: "possible-bridge", text: bridgeStatement },
      { type: "central-contradiction", text: centralStatement },
    ],
  };
}

export function createFallbackAiResponse({ interpretation = {}, aiInput = {} } = {}) {
  const overview = Array.isArray(interpretation.overview) ? interpretation.overview.join(" / ") : "";
  const response = createEmptyAiResponse("fallback");
  response.headline = trimText(interpretation.headline || "규칙 기반 구조 안내를 표시합니다.");
  response.connectionReading = trimText(toDisplayText(interpretation.priorityInsight) || overview);
  response.centralContradiction = {
    statement: trimText(interpretation.coreThesisDiagnosis?.message || ""),
    explanation: trimText(interpretation.coreThesisDiagnosis?.suggestion || ""),
  };
  response.settingDraft = overview;
  response.questions = Array.isArray(interpretation.reflectionQuestions)
    ? interpretation.reflectionQuestions.slice(0, 4)
    : [];
  response.cautions = ["AI 해석을 불러오지 못해 규칙 기반 구조 안내를 표시합니다."];
  response.preservedUserElements = getSelectedInputSummary(aiInput);
  return response;
}

export function validateAiResponse(response) {
  const issues = [];
  if (!response || typeof response !== "object" || Array.isArray(response)) issues.push("응답은 객체여야 합니다.");
  if (!AI_RESPONSE_STATUS.has(response?.status)) issues.push("허용되지 않는 status입니다.");
  if (typeof response?.headline !== "string") issues.push("headline은 문자열이어야 합니다.");
  if (!response?.centralContradiction || typeof response.centralContradiction !== "object" || Array.isArray(response.centralContradiction)) {
    issues.push("centralContradiction은 객체여야 합니다.");
  }
  if (!Array.isArray(response?.questions)) issues.push("questions는 배열이어야 합니다.");
  if (!Array.isArray(response?.alternativeReadings)) issues.push("alternativeReadings는 배열이어야 합니다.");
  if (!Array.isArray(response?.generatedSuggestions)) issues.push("generatedSuggestions는 배열이어야 합니다.");
  for (const field of FORBIDDEN_RESPONSE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(response || {}, field)) issues.push(`${field} 필드는 사용할 수 없습니다.`);
  }
  return { ok: issues.length === 0, issues };
}

export function normalizeAiResponse(response) {
  const before = clone(response ?? null);
  const source = response && typeof response === "object" && !Array.isArray(response) ? response : {};
  const normalized = {
    ...createEmptyAiResponse(AI_RESPONSE_STATUS.has(source.status) ? source.status : "error"),
    version: trimText(source.version) || "1.0",
    interpretationMode: "editor",
    headline: trimText(source.headline, 160),
    connectionReading: trimText(source.connectionReading, 700),
    centralContradiction: {
      statement: trimText(source.centralContradiction?.statement, 260),
      explanation: trimText(source.centralContradiction?.explanation, 420),
    },
    settingDraft: trimText(source.settingDraft, 900),
    possibleBridge: {
      statement: trimText(source.possibleBridge?.statement, 420),
      assumptions: normalizeArray(source.possibleBridge?.assumptions, 4),
    },
    questions: normalizeArray(source.questions, 4),
    alternativeReadings: normalizeArray(source.alternativeReadings, 2, 260),
    cautions: normalizeArray(source.cautions, 4),
    preservedUserElements: Array.isArray(source.preservedUserElements) ? clone(source.preservedUserElements).slice(0, 14) : [],
    generatedSuggestions: Array.isArray(source.generatedSuggestions) ? clone(source.generatedSuggestions).slice(0, 8) : [],
  };
  for (const field of FORBIDDEN_RESPONSE_FIELDS) delete normalized[field];
  const text = JSON.stringify(normalized);
  if (text.includes("[object Object]")) normalized.cautions.push("일부 표시값을 안전하게 정리했습니다.");
  if (FORBIDDEN_WORDS.some((word) => text.includes(word))) {
    normalized.cautions.push("일부 단정적인 표현을 피하도록 응답을 검토해야 합니다.");
  }
  if (JSON.stringify(before) !== JSON.stringify(response ?? null)) {
    throw new Error("normalizeAiResponse must not mutate input.");
  }
  return normalized;
}

export function getAiResultStatus(response = {}) {
  return AI_RESPONSE_STATUS.has(response.status) ? response.status : "error";
}

export function getAiResultHeadline(response = {}) {
  return trimText(response.headline) || "작성된 항목을 중심으로 가능한 해석을 준비합니다.";
}
