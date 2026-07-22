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
  "당신은 사용자가 고른 사회 조건을 세계사의 사건, 제도, 생활상, 사상, 예술, 종교, 관습, 물질문화와 연결해 설명하는 역사 해석 편집자입니다.",
  "사용자 입력 사이에 명백한 연결이 없어도 실패로 판정하지 말고, 어떤 분류 기준, 통치 수단, 정당화 언어, 실제 변화, 생활 전략, 문화 표현, 저항과 균열의 패턴이 보이는지 찾으세요.",
  "특정 사건이나 문화 현상과 같다고 단정하지 말고, 닮은 역사적 조건과 다른 점을 함께 설명하세요.",
  "식민지배, 학살, 노예제, 강제 이주, 우생학처럼 해악이 큰 사례는 선정적으로 소비하지 말고 권력 구조와 피해의 현실을 존중해 다루세요.",
  "근거가 있는 사실만 역사 사례나 문화 사례로 제시하고, 확실하지 않은 사건명·연도·제도명·작품명·사조명·인물명은 만들지 마세요.",
  "불확실한 내용은 특정 사례명 대신 넓은 역사적 패턴으로 낮춰 말하고, 검증할 키워드나 확인 질문으로 남기세요.",
  "확인하지 않은 참고문헌 번호, URL, 책 제목, 논문 제목, 기사 제목, 저자명, 쪽수, 직접 인용문을 만들지 마세요.",
  "응답 끝에 [1], [2] 같은 가짜 각주나 참고문헌 목록을 붙이지 말고, 필요한 경우 검증 키워드만 남기세요.",
  "구체 사례를 쓸 때는 사용자가 검색해 확인할 수 있도록 시대, 지역, 행위자 또는 제도명 중 최소 2가지를 함께 제시하세요.",
  "세계사를 통해 인간의 행동양식과 권력의 반복 패턴을 이해하고, 이를 앞으로의 사회를 읽는 통찰로 연결하세요.",
  "사용자가 입력한 내용과 AI가 제안한 해석을 구분하세요.",
  "점수, 등급, 정답/오답 판정, 창의성 평가는 절대 쓰지 마세요.",
  "한국어로 간결하게 작성하고, 기본 화면에 역사적 유사성/반복되는 긴장/세계사 렌즈 설명이 바로 드러나게 하세요.",
].join("\n");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function trimText(value, max = 700) {
  const text = toDisplayText(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function trimMultilineText(value, max = 1400) {
  const text = toDisplayText(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
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
    selectedOptions: Array.isArray(option.selectedOptions)
      ? option.selectedOptions.map((item) => trimText(item.label || item.value || item, 120)).filter(Boolean)
      : [],
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

export const buildHistoryLensInput = buildAiInput;

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
    status: "ready",
    issues: [],
  };
}

export function buildAiRequestPayload(aiInput) {
  return {
    version: "1.0",
    task: "world-history-lens-interpretation",
    mode: "interpret",
    input: aiInput,
    responseFormat: {
      type: "json",
      schemaName: "futureSatireEditorResponse",
    },
  };
}

export const HISTORY_LENS_RESPONSE_JSON_SCHEMA = AI_RESPONSE_JSON_SCHEMA;

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
  return getSelectionOption(aiInput.selections, key)?.label || "";
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
    pressure && `사회 압력 '${pressure}'`,
    target && `영향을 받는 집단 '${target}'`,
    technology && `외부 조건 '${technology}'`,
    transformation && `실제 변화 '${transformation}'`,
    ideology && `정당화 언어 '${ideology}'`,
  ].filter(Boolean);
  const bridgeStatement = bridgeParts.length >= 2
    ? `${bridgeParts.join(", ")}을 직접 인과가 아니라 제도적 책임 이전과 행정 분류의 과정으로 이어보는 가능한 해석입니다.`
    : "작성된 항목을 중심으로 가능한 연결 방식을 더 탐색할 수 있습니다.";
  const centralStatement = target && transformation
    ? `${target}이 ${transformation}의 조건 안으로 들어가는 과정에서, 공적 명분과 실제 부담 사이의 긴장이 생깁니다.`
    : "작성된 항목 사이에서 공적 명분과 실제 부담이 어긋나는 지점을 더 정할 수 있습니다.";
  return {
    version: "1.0",
    status: validation.status === "partial" ? "incomplete" : "success",
    interpretationMode: "editor",
    headline: validation.status === "partial"
      ? "작성된 항목을 중심으로 가능한 역사 비교 쟁점을 미리 살펴봅니다."
      : "이 조합은 익숙한 사건명보다 조건과 책임이 이동하는 방식을 중심으로 읽을 수 있습니다.",
    connectionReading: bridgeStatement,
    centralContradiction: {
      statement: centralStatement,
      explanation: ideology
        ? `${ideology}이라는 명분이 실제로 누가 비용, 의무, 권리 제한을 부담하게 되는지 살피는 비교 기준이 될 수 있습니다.`
        : "명분을 더 정하면, 제도가 자신을 설명하는 언어와 실제 부담의 배분이 어떻게 어긋나는지 더 선명해집니다.",
    },
    settingDraft: selected.length > 0
      ? `${selected.join(", ")}을 바탕으로, 사회가 어떤 압력에 대응한다는 이유로 특정 집단의 권리와 의무를 새롭게 분류했던 역사적 패턴을 비교해볼 수 있습니다.`
      : "",
    possibleBridge: {
      statement: bridgeStatement,
      assumptions: [
        "어떤 시대와 지역의 사례를 우선 비교할지 정해야 합니다.",
        "사건명과 연도는 별도로 검증해야 합니다.",
      ],
    },
    questions: [
      "영향을 받는 집단에게 의무가 부과되는 기준은 무엇인가?",
      "누가 이 의무에서 예외가 될 수 있는가?",
      "사회는 이를 어떤 공적 언어로 정당화하는가?",
      "역사 사례와 현재 조건 사이에서 결정적으로 다른 점은 무엇인가?",
    ],
    alternativeReadings: [
      "이 조합은 행정 분류가 새로운 사회적 지위로 굳어지는 역사 렌즈로도 읽을 수 있습니다.",
      "또는 공적 언어가 특정 집단의 의무를 자발성으로 설명하는 역사 렌즈로 볼 수 있습니다.",
    ],
    cautions: ["새로 제시한 연결은 가능한 비교 가설이며, 확정된 역사 설명이 아닙니다."],
    preservedUserElements: getSelectedInputSummary(aiInput),
    generatedSuggestions: [
      { type: "possibleComparisonKeyword", text: "배급, 인구 등록, 시민권 재정의, 검역, 조세 저항" },
      { type: "possibleDifference", text: "시대, 지역, 국가 역량, 폭력 수준에 따라 같은 제도 논리도 다른 결과를 낳습니다." },
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
    settingDraft: trimMultilineText(source.settingDraft, 1400),
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
