import { AI_RESPONSE_JSON_SCHEMA, normalizeAiResponse, validateAiResponse } from "./ai.js";

const GROUP_KEYS = {
  core: ["pressure", "target", "technology", "transformation", "ideology"],
  details: ["actor", "mechanism", "metric", "benefit", "careNarrative"],
  amplifiers: ["classDistortion", "feedbackLoop", "victimInternalization", "irreversibility"],
};

const CATEGORY_LABELS = {
  pressure: "사회문제",
  target: "대상",
  technology: "기술",
  transformation: "권리·제도 변화",
  ideology: "정당화 이념",
  actor: "운영자",
  mechanism: "운영 방식",
  metric: "측정 기준",
  benefit: "보상",
  careNarrative: "돌봄 언어",
  classDistortion: "계층 왜곡",
  feedbackLoop: "악순환",
  victimInternalization: "제도 논리의 자기내면화",
  irreversibility: "비가역성",
};

const FORBIDDEN_RESPONSE_FIELDS = new Set([
  "creativityScore",
  "qualityScore",
  "compatibilityScore",
  "realismScore",
  "grade",
  "ranking",
  "correct",
  "incorrect",
]);

const BAD_PROMPT_PATTERNS = [
  "틀린 조합",
  "연결성이 낮다",
  "창의성이 부족하다",
  "현실성이 없다",
  "좋은 아이디어가 아니다",
  "정답",
  "오답",
];

export const AXIS_FINDER_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["version", "status", "interpretationMode", "overview", "axes", "unresolvedElements", "editorNote"],
  properties: {
    version: { type: "string" },
    status: { type: "string", enum: ["success", "incomplete", "fallback", "error"] },
    interpretationMode: { type: "string", enum: ["axis-finder"] },
    overview: { type: "string" },
    axes: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "title",
          "coreInsight",
          "centralContradiction",
          "usedElements",
          "deferredElements",
          "bridge",
          "assumptions",
          "whyThisAxisMatters",
          "specificQuestion",
        ],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          coreInsight: { type: "string" },
          centralContradiction: { type: "string" },
          usedElements: { type: "array", items: { type: "string" } },
          deferredElements: { type: "array", items: { type: "string" } },
          bridge: { type: "string" },
          assumptions: { type: "array", maxItems: 2, items: { type: "string" } },
          whyThisAxisMatters: { type: "string" },
          specificQuestion: { type: "string" },
        },
      },
    },
    unresolvedElements: { type: "array", items: { type: "string" } },
    editorNote: { type: "string" },
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export function sanitizePromptText(value, max = 700) {
  if (value === null || value === undefined) return "";
  const text = typeof value === "string" ? value : String(value);
  return text.replace(/\s+/g, " ").trim().slice(0, max);
}

function sanitizeList(items, max = 8) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => sanitizePromptText(item?.message || item?.label || item, 260)).filter(Boolean).slice(0, max);
}

function normalizeAxisItem(axis = {}, index = 0) {
  return {
    id: sanitizePromptText(axis.id || `axis-${index + 1}`, 40),
    title: sanitizePromptText(axis.title, 120),
    coreInsight: sanitizePromptText(axis.coreInsight, 500),
    centralContradiction: sanitizePromptText(axis.centralContradiction, 320),
    usedElements: sanitizeList(axis.usedElements, 7),
    deferredElements: sanitizeList(axis.deferredElements, 10),
    bridge: sanitizePromptText(axis.bridge, 360),
    assumptions: sanitizeList(axis.assumptions, 2),
    whyThisAxisMatters: sanitizePromptText(axis.whyThisAxisMatters, 420),
    specificQuestion: sanitizePromptText(axis.specificQuestion, 260),
  };
}

export function normalizeAxisFinderResponse(response = {}) {
  const source = response && typeof response === "object" && !Array.isArray(response) ? response : {};
  return {
    version: sanitizePromptText(source.version) || "1.0",
    status: ["success", "incomplete", "fallback", "error"].includes(source.status) ? source.status : "error",
    interpretationMode: "axis-finder",
    overview: sanitizePromptText(source.overview, 700),
    axes: Array.isArray(source.axes) ? source.axes.slice(0, 3).map(normalizeAxisItem) : [],
    unresolvedElements: sanitizeList(source.unresolvedElements, 14),
    editorNote: sanitizePromptText(source.editorNote, 500),
  };
}

export function validateAxisFinderResponse(response) {
  const issues = [];
  if (!response || typeof response !== "object" || Array.isArray(response)) issues.push("axis response must be an object.");
  if (response?.interpretationMode !== "axis-finder") issues.push("interpretationMode must be axis-finder.");
  if (!["success", "incomplete", "fallback", "error"].includes(response?.status)) issues.push("status is invalid.");
  if (!Array.isArray(response?.axes)) issues.push("axes must be an array.");
  if (Array.isArray(response?.axes) && (response.axes.length < 2 || response.axes.length > 3)) issues.push("axes must contain 2 to 3 items.");
  for (const [index, axis] of (response?.axes || []).entries()) {
    if (!axis || typeof axis !== "object" || Array.isArray(axis)) issues.push(`axis ${index + 1} must be an object.`);
    for (const key of ["id", "title", "coreInsight", "centralContradiction", "bridge", "whyThisAxisMatters", "specificQuestion"]) {
      if (typeof axis?.[key] !== "string") issues.push(`axis ${index + 1} ${key} must be a string.`);
    }
    for (const key of ["usedElements", "deferredElements", "assumptions"]) {
      if (!Array.isArray(axis?.[key])) issues.push(`axis ${index + 1} ${key} must be an array.`);
    }
    if (Array.isArray(axis?.assumptions) && axis.assumptions.length > 2) issues.push(`axis ${index + 1} assumptions must be 2 or fewer.`);
  }
  if (!Array.isArray(response?.unresolvedElements)) issues.push("unresolvedElements must be an array.");
  return { ok: issues.length === 0, issues };
}

function getSelectionFromInputs({ resolvedInputs = {}, aiInput = {} } = {}) {
  if (resolvedInputs.selection) return resolvedInputs.selection;
  if (resolvedInputs.core || resolvedInputs.detail || resolvedInputs.amplifier) return resolvedInputs;
  if (aiInput.selections) {
    return {
      core: aiInput.selections.core || {},
      detail: aiInput.selections.details || {},
      amplifier: aiInput.selections.amplifiers || {},
    };
  }
  return {};
}

function normalizeFact(key, item) {
  if (!item) return null;
  const value = sanitizePromptText(item.rawText || item.label || item.value);
  if (!value) return null;
  return {
    field: key,
    categoryLabel: CATEGORY_LABELS[key] || key,
    value,
    source: item.source === "custom" ? "custom" : "preset",
    description: sanitizePromptText(item.description || "", 500),
    tags: clone(item.tags || {
      domains: item.domains || [],
      functions: item.functions || [],
      rights: item.rights || [],
      tones: item.tones || [],
      needs: item.needs || [],
      enables: item.enables || [],
      mechanisms: item.mechanisms || [],
    }),
  };
}

export function buildInputFacts({ resolvedInputs = {}, aiInput = {} } = {}) {
  const selection = getSelectionFromInputs({ resolvedInputs, aiInput });
  return {
    core: GROUP_KEYS.core.map((key) => normalizeFact(key, selection.core?.[key])).filter(Boolean),
    details: GROUP_KEYS.details.map((key) => normalizeFact(key, selection.detail?.[key] || selection.details?.[key])).filter(Boolean),
    amplifiers: GROUP_KEYS.amplifiers.map((key) => normalizeFact(key, selection.amplifier?.[key] || selection.amplifiers?.[key])).filter(Boolean),
  };
}

export function buildRuleBasedClues({ evaluation = {}, interpretation = {}, aiInput = {} } = {}) {
  const context = aiInput.ruleContext || {};
  const strengths = Array.isArray(interpretation.strengths) ? interpretation.strengths : context.strengths || [];
  return sanitizeList(strengths.map((item) => item.message || item.label || item), 6);
}

export function buildOpenQuestions({ interpretation = {}, aiInput = {} } = {}) {
  const questions = interpretation.reflectionQuestions || aiInput.ruleContext?.reflectionQuestions || [];
  return sanitizeList(questions, 4);
}

export function buildUnresolvedConnections({ interpretation = {}, aiInput = {} } = {}) {
  const context = aiInput.ruleContext || {};
  const uncertain = interpretation.uncertain || context.uncertainPairs || [];
  const unresolved = sanitizeList(uncertain, 8);
  if ((context.evidenceCoverage || 0) < 0.45) {
    unresolved.push("현재 입력만으로는 일부 요소 사이의 중간 과정이 아직 확정되지 않았습니다.");
  }
  return [...new Set(unresolved)].slice(0, 8);
}

function buildMissingDecisions(inputFacts, aiInput = {}) {
  const selected = new Set(Object.values(inputFacts).flat().map((item) => item.field));
  const missing = [];
  for (const key of [...GROUP_KEYS.core, ...GROUP_KEYS.details, ...GROUP_KEYS.amplifiers]) {
    if (!selected.has(key)) missing.push({ field: key, categoryLabel: CATEGORY_LABELS[key] || key });
  }
  for (const item of aiInput.ruleContext?.missingCoreCategories || []) {
    if (item?.key && !missing.some((entry) => entry.field === item.key)) {
      missing.push({ field: item.key, categoryLabel: item.label || CATEGORY_LABELS[item.key] || item.key });
    }
  }
  return missing;
}

function buildUserOriginalText(inputFacts) {
  return Object.values(inputFacts)
    .flat()
    .filter((item) => item.source === "custom")
    .map((item) => ({
      field: item.field,
      categoryLabel: item.categoryLabel,
      value: item.value,
    }));
}

export function buildEditorialBrief({ formState = {}, resolvedInputs = {}, aiInput = {}, evaluation = {}, interpretation = {} } = {}) {
  const before = clone({ formState, resolvedInputs, aiInput, evaluation, interpretation });
  const inputFacts = buildInputFacts({ resolvedInputs, aiInput });
  const confirmedClues = buildRuleBasedClues({ evaluation, interpretation, aiInput });
  const unresolvedConnections = buildUnresolvedConnections({ interpretation, aiInput });
  const brief = {
    version: "1.0",
    status: Object.values(inputFacts).flat().length > 0 ? "ready" : "empty",
    inputFacts,
    userOriginalText: buildUserOriginalText(inputFacts),
    confirmedClues,
    unusualConnections: unresolvedConnections.length
      ? ["이 항목들은 오류가 아니라 AI가 가능한 매개 논리를 찾아야 하는 부분입니다."]
      : [],
    unresolvedConnections,
    missingDecisions: buildMissingDecisions(inputFacts, aiInput),
    ruleQuestions: buildOpenQuestions({ interpretation, aiInput }),
    instructionFlags: {
      doNotScore: true,
      preserveUnusualConnections: true,
      distinguishFactsFromSuggestions: true,
      treatRuleContextAsReferenceOnly: true,
    },
  };
  if (JSON.stringify(before) !== JSON.stringify({ formState, resolvedInputs, aiInput, evaluation, interpretation })) {
    throw new Error("buildEditorialBrief must not mutate input.");
  }
  return brief;
}

export function validateEditorialBrief(brief) {
  const issues = [];
  if (!brief || typeof brief !== "object" || Array.isArray(brief)) issues.push("brief must be an object.");
  if (!["ready", "empty"].includes(brief?.status)) issues.push("brief status is invalid.");
  if (!brief?.inputFacts || typeof brief.inputFacts !== "object") issues.push("inputFacts is required.");
  for (const group of ["core", "details", "amplifiers"]) {
    if (!Array.isArray(brief?.inputFacts?.[group])) issues.push(`${group} inputFacts must be an array.`);
  }
  for (const key of ["confirmedClues", "unusualConnections", "unresolvedConnections", "missingDecisions", "ruleQuestions"]) {
    if (!Array.isArray(brief?.[key])) issues.push(`${key} must be an array.`);
  }
  return { ok: issues.length === 0, issues };
}

export function getEditorialBriefStatus(brief) {
  return validateEditorialBrief(brief).ok ? brief.status : "error";
}

function formatFacts(inputFacts = {}) {
  return ["core", "details", "amplifiers"]
    .map((group) => {
      const items = inputFacts[group] || [];
      if (!items.length) return `${group}: 없음`;
      return `${group}:\n${items.map((item) => `- ${item.categoryLabel}: ${item.value} (${item.source})${item.description ? ` / ${item.description}` : ""}`).join("\n")}`;
    })
    .join("\n\n");
}

export function buildFullChatGptPrompt(editorialBrief) {
  const brief = clone(editorialBrief);
  const validation = validateEditorialBrief(brief);
  if (!validation.ok) throw new Error(validation.issues.join(", "));
  return [
    "역할",
    "당신은 여러 재료를 한 번에 하나의 설정으로 묶는 생성기가 아니다. 사용자의 입력에서 서로 다른 미친소리 방향을 분리해 보여주는 사회·기술·제도 분석 편집자다.",
    "여기서 미친소리는 무작위 헛소리가 아니라 현실의 제도, 시장 논리, 행정 절차, 기술 가능성, 정당화 언어와 권력 구조를 끝까지 밀어붙여 만든 기괴하지만 설명 가능한 미래사회 제도 풍자다.",
    "피해자나 취약계층을 조롱하지 말고, 제도와 권력 구조를 대상으로 삼는다.",
    "새로운 디스토피아 설정을 즉시 발명하는 소설가처럼 쓰지 않는다. 먼저 현실의 제도, 시장, 행정, 법적 권한, 기업과 기관의 이해관계, 기술이 바꾸는 비용과 책임 구조를 분석한 뒤 마지막에만 짧게 미친소리 방향으로 번역한다.",
    "분석 85%는 모델이 결론을 만들기 위해 수행해야 하는 사고와 검토의 비중이다. 사용자에게 내부 검토 과정을 장황하게 모두 출력하라는 뜻이 아니다.",
    "현실 구조, 행위자의 이해관계, 기술의 역할, 권한 경로, 비용 이전과 책임 공백을 충분히 검토한 뒤 그 결론만 밀도 있게 압축해서 작성한다. 긴 보고서보다 짧지만 인과관계가 살아 있는 문장을 우선한다.",
    "",
    "작업",
    "- 완성된 설정 초안을 쓰지 않는다.",
    "- 먼저 서로 다른 미친소리 방향을 2~3개 제안한다.",
    "- 입력 요소를 모두 보존하되, 모든 요소를 같은 방향에서 사용하지 않는다.",
    "- 각 방향은 독립적으로 읽혀야 하며, 중심 모순 하나만 선명하게 보여준다.",
    "- 연결되지 않는 요소를 억지로 설명하지 말고 보류 요소로 남긴다.",
    "- 보류는 결함이나 실패가 아니라 다른 방향이나 후속 바텀업에서 사용할 수 있는 재료다.",
    "- 각 방향에서 실제로 사용하는 요소와 보류하는 요소를 명시한다.",
    "- 한 방향에 새 제도나 가정을 최대 2개까지만 추가한다.",
    "- 질문은 방향에 특화된 바텀업 질문 하나만 쓴다.",
    "- 규칙 기반 질문 문장을 그대로 반복하지 않는다.",
    "- 모든 신규 axis-finder 응답의 version은 정확히 문자열 \"1.0\"으로 고정한다.",
    "- 요소 사용률보다 논리의 선명함을 우선한다.",
    "- 가장 충격적인 결론을 선택하지 마라. 현재 입력에서 가장 적은 비약으로 도출되면서도, 끝까지 밀어붙였을 때 강한 모순을 만드는 방향을 선택하라.",
    "",
    "절대 우선순위",
    "1. 중심 인과관계의 명확성",
    "2. 현실적인 권한·비용·기술 경로",
    "3. 사회문제와 대상의 충실한 사용",
    "4. 나머지 입력 요소의 사용률",
    "- 하위 기준을 만족하기 위해 상위 기준을 훼손하지 않는다.",
    "- 사회문제를 반드시 사용하려고 약한 중간 제도를 만들지 않는다.",
    "- 사용 요소 수를 늘리려고 인과관계를 복잡하게 만들지 않는다.",
    "- 이전 응답에서 잘 나왔던 모순을 보존하려고 입력을 재해석하지 않는다.",
    "- 강렬한 결론을 먼저 정한 뒤 그 결론에 맞는 정책 경로를 사후 발명하지 않는다.",
    "",
    "1차 분석 순서",
    "1. 현실의 출발점: 현재 어떤 제도, 시장, 행정 관행, 법적 권한, 사회적 갈등에서 시작하는지 먼저 찾는다.",
    "2. 대상과 사회문제: 모든 axis는 입력된 대상을 중심에 둔다. 사회문제는 실제 중심 인과관계에 참여할 때만 usedElements에 넣는다. 2~3개 방향 중 최소 1개는 입력 사회문제를 직접 사용하는 현실적 방향을 우선 탐색하되, 현실적인 방향이 없다면 사회문제를 억지로 사용하는 axis를 만들지 않는다.",
    "3. 행위자의 이해관계: 운영자나 기업, 기관은 비용 절감, 수익, 책임 회피, 권한 확대, 위험 관리 중 무엇을 얻는지 밝힌다.",
    "4. 실제 권한 경로: 누가 법적 권한을 갖고, 누가 데이터·계약·보험·인증·접근권 같은 실행 수단을 쥐는지 구분한다.",
    "5. 기술의 실제 역할: 기술이 무엇을 더 싸게, 빠르게, 대규모로, 자동으로, 측정 가능하게 만드는지 쓴다. 기술을 제거해도 방향이 거의 같다면 technology는 usedElements가 아니라 deferredElements로 보류한다.",
    "6. 제도 변환 경로: 현실 제도에서 미친소리 제도로 이동하는 과정을 2~4단계로 생각한다. 갑자기 새 국가나 새 기관을 선언하지 않는다.",
    "7. 비용 이전: 원래 국가, 기업, 보험, 가족, 사회가 부담하던 비용과 위험이 누구에게 넘어가는지 쓴다.",
    "8. 비대칭: 누가 이익을 얻고 누가 실수, 불확실성, 행정 오류의 비용을 부담하는지 쓴다.",
    "9. 중심 모순: 앞의 분석에서 발생하는 하나의 논리만 고른다.",
    "10. 미친소리 번역: 분석 바깥으로 2~3문장 이상 나가지 않는다. 완성된 세계관이나 장면을 만들지 않는다.",
    "",
    "기존 axis-finder 필드 사용 방식",
    "- title: 세계관 이름이 아니라 제도의 모순이 드러나는 문장으로 쓴다.",
    "- coreInsight: 단순 설정 요약이 아니라 현실 사회에 대한 핵심 통찰로 쓴다.",
    "- centralContradiction: 중심 모순 하나만 쓴다.",
    "- bridge: 현실 제도 출발점, 행위자의 실제 권한 또는 통제 수단, 기술의 구체적 역할, 미래 제도로 이동하는 과정을 포함한다.",
    "- assumptions: 현실 분석만으로 설명되지 않아 AI가 새로 붙인 가정을 최대 2개만 쓴다.",
    "- whyThisAxisMatters: 행위자의 이해관계, 비용 이전 대상, 판단 오류의 비용 부담자, 이 설정이 현실에서 확장될 수 있는 이유를 포함한다.",
    "- specificQuestion: 세계관 취향 질문이 아니라 권력, 책임, 기술의 오류, 비용 이전을 검증하는 질문 하나만 쓴다.",
    "- usedElements: 문제의 원인, 행위자의 이해관계, 권력 행사 방식, 측정 기준, 권리 변환, 피해 발생 경로, 통찰 정당화 논리, 계층적 비대칭 중 하나를 실제로 바꾼 요소만 넣는다.",
    "- deferredElements: 언급만 되고 방향의 인과관계를 바꾸지 않는 요소, 장식처럼 쓰인 기술·이념·보상, 사회문제와 대상을 제거해도 방향이 그대로인 요소를 넣는다.",
    "",
    "axis-finder 출력 분량 제한",
    "- overview: 최대 4문장. 세 방향의 현실 출발점과 차이만 요약하고 각 axis 내용을 장황하게 반복하지 않는다.",
    "- title: 한 문장.",
    "- coreInsight: 최대 3문장. 설정 줄거리가 아니라 현실 통찰 중심으로 쓴다.",
    "- centralContradiction: 한 문장.",
    "- bridge: 최대 5문장. 현실의 출발점, 운영자의 이해관계와 실제 권한 경로, 기술의 구체적 역할, 제도 변화 과정, 비용 또는 책임 이전을 압축해서 포함한다.",
    "- assumptions: 최대 2개.",
    "- assumptions에는 방향을 보조하는 경미한 가정만 허용한다. 중대한 정책 전환이 중심 인과관계에 필수라면 assumptions에 넣고 계속 진행하지 말고 방향을 다시 작성하거나 반환하지 않는다.",
    "- whyThisAxisMatters: 최대 5문장. 운영자의 이익, 피해와 오류 비용 부담자, 현실에서 확장될 수 있는 이유, 마지막 미친소리 번역 한 문장을 포함하되 bridge를 그대로 반복하지 않는다.",
    "- specificQuestion: 한 문장.",
    "- unresolvedElements: 최대 5개. 같은 의미를 세분화해서 늘리지 않는다.",
    "- editorNote: 최대 3문장.",
    "",
    "방향별 반복 공식 통제",
    "- 모든 방향을 점수, 조건부 권리, 자동 배정 공식으로 만들지 않는다.",
    "- 각 방향은 서로 다른 권력 작동 방식을 사용한다. 예: 가격과 보험, 계약과 구독, 허가와 면허, 기반시설 접근권, 소유권과 상속권, 노동과 돌봄 의무, 공간 배치와 이주, 인증과 시험, 공적 의무의 민간 위상, 국제 책임의 외주화, 대기기간과 순번, 평판과 공개 기록, 법적 책임 분산, 서비스 호환성과 데이터 이동성.",
    "- 같은 중심 모순을 소재만 바꿔 반복하지 않는다.",
    "- 입력에 없는 클리셰를 기본 양식처럼 추가하지 않는다. 특히 AI 위험지수, 부자 면제권, 지방 축소의 악순환, 통합 계정의 권리 박탈, 인간 전문가 고가 서비스, 세금 체납자 권리 축소, 알고리즘 자동 배정은 입력이나 결과상 필수일 때만 쓴다.",
    "",
    "사회문제와 대상 보존",
    "- 각 axis는 대상을 반드시 중심에 둔다.",
    "- 왜 하필 이 대상이 영향을 받는지, 대상의 기존 권리·취약성·역할이 인과관계에 어떻게 참여하는지 보여준다.",
    "- 대상을 다른 아무 집단으로 바꿔도 설정이 거의 같다면 해당 방향을 다시 작성한다.",
    "- 가능하면 여러 방향에서 사회문제를 사용하되, 인과관계가 약해질 경우 한 방향에서만 정확하게 사용하는 편이 낫다.",
    "- 사회문제를 사용하지 못한 이유는 unresolvedElements 또는 editorNote에 한 문장으로 기록할 수 있다.",
    "- 사회문제를 쓰지 않은 방향도 대상과 다른 핵심 요소들이 강하게 연결된다면 정식 방향이 될 수 있다.",
    "- 사회문제와 대상을 일반 디스토피아로 희석하지 않는다.",
    "- 입력된 사회문제를 유사하거나 인접한 다른 문제로 조용히 교체하지 않는다.",
    "- 인접 문제가 논리 연결에 꼭 필요하다면 assumptions에 명시한다.",
    "- 사회문제가 선택한 방향에 직접 기여하지 않으면 usedElements에 억지로 넣지 말고 deferredElements로 이동한다.",
    "- 사회문제를 제거해도 같은 방향이 그대로 성립하면 deferredElements로 이동한다.",
    "- 사회문제를 배경에서 한 번 언급한 것만으로 사용했다고 판정하지 않는다.",
    "- 사용한 사회문제가 중심 인과관계에서 어떤 역할을 하는지 보여준다.",
    "",
    "약한 브리지 판정",
    "- 각 방향을 반환하기 전에 내부적으로 묻는다: 입력 요소 A가 결과 B를 실제로 일으키는가, 아니면 B를 살리기 위해 새로운 중간 제도 C를 발명했는가?",
    "- 약한 브리지: 입력에 없는 대규모 정책 전환이 필요함, 서로 다른 재정·보험·법률 체계를 설명 없이 통합함, 한 사회문제에서 인접한 다른 사회문제로 조용히 이동함, 운영자의 기존 이해관계만으로는 변화가 설명되지 않음, 새로운 기관·기금·면허·급여체계를 만들어야 함, 정부가 그렇게 재편할 유인을 가진다는 문장 외에 실제 경로가 없음, 인과관계를 설명할수록 새로운 가정이 계속 늘어남.",
    "- 약한 브리지로 판정되면 더 단순하고 현실적인 연결 경로를 다시 찾고, 없으면 해당 입력 요소를 deferredElements로 이동한다.",
    "- 해당 요소 없이는 방향의 정체성이 사라진다면 그 방향을 폐기한다.",
    "- 강렬하다는 이유만으로 억지 연결을 유지하지 않는다.",
    "",
    "중대한 가정 금지",
    "- 경미한 가정 예: 기존 데이터가 급여 심사의 보조자료로 사용됨, 기존 계약권을 분할할 수 있도록 법이 일부 개정됨, 기존 기관 간 자료 연계가 확대됨.",
    "- 중대한 가정 예: 연금 현금급여를 장기요양 서비스로 대체함, 기업이 사실상 국가의 허가권을 갖게 됨, 국제기구가 독립 국가의 주권을 획득함, 건강보험과 연금 재정을 하나의 제도로 통합함, 새로운 보편 의무노동 체계를 창설함, 기존 권리체계를 전면적으로 다른 계약체계로 교체함.",
    "- 큰 가정을 명시했으니 괜찮다는 식으로 처리하지 않는다.",
    "",
    "한 문장 인과사슬 검사",
    "- 각 axis는 내부적으로 다음 문장이 새 제도 이름 없이 성립해야 한다: 현실의 압력 때문에 행위자 A가 자신의 이해관계에 따라 수단 B를 사용하고, 그 결과 대상 C에게 변화 D가 발생하며, 그 논리를 과잉 적용하면 모순 E가 생긴다.",
    "- 이 인과사슬이 한 문장으로 명확하게 성립하지 않으면 bridge를 더 길게 써서 덮지 말고 방향을 다시 작성하거나 보류한다.",
    "",
    "연속된 왜 검사",
    "- 각 방향에 대해 내부적으로 최대 4번 왜?를 묻는다.",
    "- 각 답은 앞서 제시한 현실 구조만으로 답할 수 있어야 한다.",
    "- 답변할 때마다 새로운 정책, 기관, 기금, 입력 사회문제의 대체, 미래에는 가능할 수 있다는 말이 필요하면 실패다.",
    "- 자체검사 과정은 출력하지 않는다.",
    "",
    "강한 미친소리와 입력 적합성 구분",
    "- 독립적으로 강한 미친소리와 현재 입력에서 논리적으로 도출되는 미친소리를 혼동하지 않는다.",
    "- 강렬한 설정이라도 현재 입력과 연결이 약하면 좋은 axis가 아니다.",
    "- 방향의 강도는 새로운 제도 수, 피해의 크기, 통제 수준, 디스토피아적 표현이 아니라 현실 논리의 선명함, 예상하지 못한 귀결, 공익 명분과 실제 결과의 충돌, 책임과 비용의 정교한 이전에서 만든다.",
    "",
    "bridge 필드 강화",
    "- bridge는 연결의 약점을 감추는 설명문이 아니다.",
    "- 현재 존재하거나 입력에서 직접 파생되는 장치만 사용한다.",
    "- 하나의 주요 제도 경로만 사용하고 서로 다른 제도를 연쇄적으로 새로 만들지 않는다.",
    "- 새로운 중대한 가정이 필요하면 방향을 재검토한다.",
    "- 행위자의 이해관계와 실제 수단이 바로 연결되어야 한다.",
    "- 마지막 문장은 대상에게 이전되는 비용·위험·책임을 설명한다.",
    "- bridge 작성 후 내부적으로 묻는다: 이 bridge를 절반으로 줄여도 인과관계가 남는가? 아니오라면 지나치게 많은 중간 가정으로 연결한 방향이다.",
    "",
    "usedElements 최종 판정",
    "- usedElements에 포함하려면 해당 요소가 인과사슬의 필수 노드여야 한다.",
    "- 판정 질문: 이 요소를 제거하면 행위자의 행동, 제도의 작동, 대상의 피해 또는 중심 모순이 달라지는가?",
    "- 달라지면 usedElements, 거의 같으면 deferredElements다.",
    "- 사회문제는 이 사회문제가 없으면 운영자가 같은 행동을 할 핵심 유인이 유지되는지 반사실로 검사한다. 유지되면 사회문제는 사용하지 않은 것이다.",
    "- 사용 요소 개수를 성과로 취급하지 않는다.",
    "",
    "운영자 권한 점프 금지",
    "- 기업, 보험사, 플랫폼, 국제기구가 입력에 없는데 갑자기 국가 권한을 직접 갖는 것으로 쓰지 않는다.",
    "- 먼저 국가의 법적 허가, 필수 인프라 독점, 계약·보험 조건, 인증·표준, 데이터 독점, 서비스 접근권, 책임 외주화 같은 현실적인 경로를 찾는다.",
    "",
    "금지",
    "- 모든 요소가 하나의 이야기로 연결된다는 식의 종합 문체를 쓰지 않는다.",
    "- 여러 행정 체계와 제도를 한 번에 발명해 빈틈을 메우지 않는다.",
    "- 사용자 입력을 다른 대상으로 바꾸지 않는다.",
    "- 점수나 등급을 매기지 않는다.",
    "- 맞고 틀림을 판정하는 표현이나 아이디어 폄하 표현을 쓰지 않는다.",
    "- Markdown 코드블록을 쓰지 않는다.",
    "",
    "메타 문장 금지",
    "- 어떤 문자열 필드에도 생성 과정 설명이나 정렬 보고를 쓰지 않는다.",
    "- 금지 문구: 제공된 편집 브리프에 근거한다, 선택된 방향의 범위를 따른다, 업로드된 자료에 맞추었다, 원본 브리프와 정렬했다, source alignment, 사용자 입력에 충실하게 작성했다, 요청된 JSON 구조를 따랐다, 이 응답은 앞 단계 결과를 기반으로 한다.",
    "",
    "사용자 입력 사실",
    formatFacts(brief.inputFacts),
    "",
    "규칙 기반 단서",
    JSON.stringify(brief.confirmedClues, null, 2),
    "",
    "AI가 해석해야 할 낯선 연결",
    JSON.stringify([...brief.unusualConnections, ...brief.unresolvedConnections], null, 2),
    "",
    "아직 정하지 않은 조건",
    JSON.stringify(brief.missingDecisions, null, 2),
    "",
    "참고 질문",
    JSON.stringify(brief.ruleQuestions, null, 2),
    "",
    "출력 JSON Schema",
    JSON.stringify(AXIS_FINDER_RESPONSE_JSON_SCHEMA, null, 2),
    "",
    "출력 지시",
    "- JSON 출력 전 확인하되 자체검사 결과는 출력하지 않는다.",
    "- 분석은 충분히 했지만 표현은 압축했는가?",
    "- 같은 설명을 여러 필드에서 반복하지 않았는가?",
    "- 메타 문장이 들어가지 않았는가?",
    "- 입력 사회문제를 인접 문제로 교체하지 않았는가?",
    "- usedElements는 실제 인과관계에 참여하는가?",
    "- 중심 인과관계의 명확성이 요소 사용률보다 앞서는가?",
    "- bridge가 하나의 현실적인 주요 제도 경로만 쓰는가?",
    "- 중대한 가정을 assumptions로 통과시키지 않았는가?",
    "- 모든 axis가 입력 대상을 중심에 두는가?",
    "- generatedSuggestions는 3개 이하이며 type이 서로 다른가?",
    "- possibleAdministrativeLanguage는 최대 1개인가?",
    "- version은 정확히 \"1.0\"인가?",
    "- 기존 JSON 필드 외의 새 필드를 만들지 않았는가?",
    "유효한 axis-finder JSON 객체 하나만 출력한다. JSON 앞뒤에 설명을 붙이지 않는다.",
  ].join("\n");
}


export function buildAxisDetailPrompt({ editorialBrief, axis } = {}) {
  const brief = clone(editorialBrief);
  const selectedAxis = normalizeAxisItem(axis || {}, 0);
  const validation = validateEditorialBrief(brief);
  if (!validation.ok) throw new Error(validation.issues.join(", "));
  const axisValidation = validateAxisFinderResponse({
    version: "1.0",
    status: "success",
    interpretationMode: "axis-finder",
    overview: "",
    axes: [selectedAxis, selectedAxis],
    unresolvedElements: [],
    editorNote: "",
  });
  if (!selectedAxis.title || !selectedAxis.centralContradiction || axisValidation.issues.some((issue) => issue.includes("axis 1"))) {
    throw new Error("selected axis is invalid.");
  }
  return [
    "역할",
    "당신은 선택된 미친소리 방향 하나만 바텀업하는 사회·기술·제도 분석 편집자다.",
    "여기서 미친소리는 무작위 헛소리가 아니라 현실의 제도, 시장 논리, 행정 절차, 기술 가능성, 정당화 언어와 권력 구조를 끝까지 밀어붙여 만든 기괴하지만 설명 가능한 미래사회 제도 풍자다.",
    "피해자나 취약계층을 조롱하지 말고, 제도와 권력 구조를 대상으로 삼는다.",
    "분석 85%는 모델이 결론을 만들기 위해 수행해야 하는 사고와 검토의 비중이다. 사용자에게 내부 검토 과정을 장황하게 모두 출력하라는 뜻이 아니다.",
    "현실 구조, 행위자의 이해관계, 기술의 역할, 권한 경로, 비용 이전과 책임 공백을 충분히 검토한 뒤 그 결론만 밀도 있게 압축해서 작성한다. 긴 보고서보다 짧지만 인과관계가 살아 있는 문장을 우선한다.",
    "",
    "선택된 방향",
    JSON.stringify(selectedAxis, null, 2),
    "",
    "원래 편집 브리프",
    JSON.stringify(brief, null, 2),
    "",
    "작성 원칙",
    "- 선택된 방향만 바텀업한다.",
    "- usedElements를 중심으로 작성한다.",
    "- deferredElements를 자동으로 다시 넣지 않는다.",
    "- deferredElements는 꼭 필요할 때만 1~2개까지 추가 제안할 수 있다.",
    "- 추가하는 경우 왜 필요한지 명시한다.",
    "- 중심 모순 하나를 유지한다.",
    "- 미친소리 초안은 최대 2문단으로 쓴다.",
    "- 질문은 최대 3개만 쓴다.",
    "- 다른 방향은 최대 1개만 쓴다.",
    "- 사용자 입력과 AI 추가 가정을 분리한다.",
    "- generatedSuggestions는 최대 3개만 쓴다.",
    "- generatedSuggestions의 type은 서로 달라야 하며 같은 type을 반복하지 않는다.",
    "- generatedSuggestions는 본문 내용을 반복하지 않고 실제로 설정을 한 단계 깊게 만드는 제안만 쓴다.",
    "- possibleAdministrativeLanguage는 최대 1개만 쓴다.",
    "- cautions는 최대 2개만 쓴다.",
    "- sourceAlignment 같은 새 필드를 만들지 않는다.",
    "- deferredElement suggestion 같은 새 유형을 만들지 않는다.",
    "- 모든 신규 editor 응답의 version은 정확히 문자열 \"1.0\"으로 고정한다.",
    "- 선택된 axis의 약한 연결을 더 그럴듯한 문장으로 덮지 않는다.",
    "- 새로운 중대한 가정을 추가해야만 settingDraft가 성립한다면 그 가정을 추가하지 말고 해당 요소를 중심 인과관계에서 제외한다.",
    "",
    "2차 분석 순서",
    "1. connectionReading은 최대 7문장 또는 한국어 기준 약 900자 이내로 쓴다. 현재 현실의 제도적 출발점, 운영자의 이해관계, 법적 결정권과 실질 통제의 구분, 기술이 실제로 바꾸는 것, 제도 변화 경로, 비용과 책임 이전을 압축해서 포함한다.",
    "2. centralContradiction은 앞선 분석에서 추출한 중심 모순 하나만 쓴다.",
    "3. centralContradiction.statement는 한 문장, centralContradiction.explanation은 최대 3문장으로 쓴다.",
    "4. settingDraft는 분석에서 직접 나온 결과만 최대 2문단·전체 최대 6문장으로 쓴다. 사건이나 등장인물의 서사보다 제도 작동 방식 중심으로 쓰고 소설적 사건이나 감정 과잉 묘사는 쓰지 않는다.",
    "5. possibleBridge.statement는 현실 제도에서 설정으로 이동하는 구체적인 중간 장치를 최대 2문장으로 쓴다.",
    "6. possibleBridge.assumptions는 최대 2개만 쓴다.",
    "7. questions는 권한, 오류, 책임, 예외를 검증하는 질문만 최대 3개 쓴다.",
    "8. alternativeReadings는 꼭 필요할 때 최대 1개만 쓰고 최대 3문장으로 제한한다.",
    "9. cautions는 최대 2개만 쓰고 각각 최대 2문장으로 제한한다.",
    "10. generatedSuggestions에는 실제 기관 안내문, 보도자료, 행정 문서에 있을 법한 건조한 언어를 포함할 수 있지만 전체 최대 3개만 쓴다. 과장된 디스토피아 문구나 선동 문구는 금지한다.",
    "",
    "generatedSuggestions type 규칙",
    "- 가능한 type 예: possibleClassDistortion, possibleVictimInternalization, possibleIrreversibility, possibleFeedbackLoop, possibleResponsibilityGap, possibleTechnologyFailure, possibleAdministrativeLanguage.",
    "- possibleAdministrativeLanguage는 행정 안내문 또는 공식 홍보문 한 개만 작성할 때만 사용한다.",
    "- 금지 type: sourceAlignment, deferredElement, addedAssumption, administrativeLanguage.",
    "- 정확한 행정 문구 type 이름은 possibleAdministrativeLanguage다.",
    "",
    "입력 사회문제 대체 금지",
    "- 입력된 사회문제를 유사하거나 인접한 다른 문제로 조용히 교체하지 않는다.",
    "- 인접 문제가 논리 연결에 꼭 필요하다면 possibleBridge.assumptions 또는 cautions에 명시한다.",
    "- 사회문제가 선택한 방향에 직접 기여하지 않으면 preservedUserElements에는 보존하되 인과관계상 사용한 것처럼 쓰지 않는다.",
    "- 사회문제를 배경에서 한 번 언급한 것만으로 중심 인과관계에 사용했다고 처리하지 않는다.",
    "- 사용한 사회문제가 중심 인과관계에서 어떤 역할을 하는지 connectionReading 또는 centralContradiction.explanation에 보여준다.",
    "",
    "2차 충실성 검사",
    "- 선택된 axis의 사회문제 연결이 실제 인과관계인지 확인한다.",
    "- 1차에서 보류했어야 할 요소를 다시 끌어오지 않는다.",
    "- connectionReading이 bridge의 비약을 장문 분석으로 숨기고 있지 않은지 확인한다.",
    "- 약한 연결이 발견되면 해당 요소를 중심 인과관계에서 제외한다.",
    "- 제외한 요소는 preservedUserElements에는 원본 입력으로 남길 수 있지만 settingDraft에는 억지로 사용하지 않는다.",
    "- cautions에는 내용상의 한계 설명을 짧게 쓸 수 있다. 예: 연금 재정과 장기요양 배분은 별도의 제도이므로, 이 설정에서는 연금 고갈을 직접 원인으로 사용하지 않는다.",
    "- 금지: 편집 브리프의 범위에 따라 연금 요소를 보류했다.",
    "",
    "2차 인과 우선순위",
    "1. 중심 인과관계의 명확성",
    "2. 현실적인 권한·비용·기술 경로",
    "3. 사회문제와 대상의 충실한 사용",
    "4. 나머지 입력 요소의 사용률",
    "- 하위 기준을 만족하기 위해 상위 기준을 훼손하지 않는다.",
    "- 강한 결론을 보존하려고 정책 경로를 사후 발명하지 않는다.",
    "- 대상은 계속 중심에 둔다. 왜 하필 이 대상이 영향을 받는지 보여준다.",
    "- usedElements는 인과사슬의 필수 노드일 때만 중심 서술에 사용한다.",
    "",
    "2차 금지",
    "- 새 JSON 필드를 추가하지 않는다.",
    "- 분석보다 설정 초안이 길어지지 않게 한다.",
    "- 새 기관 이름을 만드는 것으로 논리의 빈틈을 메우지 않는다.",
    "- 기술, 이념, 보상을 장식처럼 쓰지 않는다.",
    "- 모든 입력 요소를 강제로 통합하지 않는다.",
    "- 서로 다른 재정·보험·법률 체계를 설명 없이 통합하지 않는다.",
    "- 새로운 기관·기금·면허·급여체계로 bridge를 보강하지 않는다.",
    "- 어떤 문자열 필드에도 생성 과정 설명이나 정렬 보고를 쓰지 않는다.",
    "- 금지 문구: 제공된 편집 브리프에 근거한다, 선택된 방향의 범위를 따른다, 업로드된 자료에 맞추었다, 원본 브리프와 정렬했다, source alignment, 사용자 입력에 충실하게 작성했다, 요청된 JSON 구조를 따랐다, 이 응답은 앞 단계 결과를 기반으로 한다.",
    "",
    "출력 JSON Schema",
    JSON.stringify(AI_RESPONSE_JSON_SCHEMA, null, 2),
    "",
    "출력 지시",
    "- JSON 출력 전 확인하되 자체검사 결과는 출력하지 않는다.",
    "- 분석은 충분히 했지만 표현은 압축했는가?",
    "- 같은 설명을 여러 필드에서 반복하지 않았는가?",
    "- 메타 문장이 들어가지 않았는가?",
    "- 입력 사회문제를 인접 문제로 교체하지 않았는가?",
    "- usedElements는 실제 인과관계에 참여하는가?",
    "- 약한 연결을 장문으로 은폐하지 않았는가?",
    "- 새로운 중대한 가정을 추가하지 않았는가?",
    "- 약한 요소는 settingDraft의 중심에서 제외했는가?",
    "- 대상이 계속 중심에 있는가?",
    "- generatedSuggestions는 3개 이하이며 type이 서로 다른가?",
    "- possibleAdministrativeLanguage는 최대 1개인가?",
    "- version은 정확히 \"1.0\"인가?",
    "- 기존 JSON 필드 외의 새 필드를 만들지 않았는가?",
    "유효한 editor JSON 객체 하나만 출력한다. JSON 앞뒤에 설명을 붙이지 않는다.",
  ].join("\n");
}


export function getPromptMode({ search = "" } = {}) {
  const params = new URLSearchParams(search);
  if (params.get("apiAi") === "1") return "api";
  if (params.get("mockAi") === "1") return "mock";
  return "manual";
}

export function stripMarkdownCodeFence(text) {
  const trimmed = typeof text === "string" ? text.trim() : "";
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

function hasForbiddenField(value) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasForbiddenField);
  return Object.keys(value).some((key) => FORBIDDEN_RESPONSE_FIELDS.has(key) || hasForbiddenField(value[key]));
}

export function parsePastedAiResponse(text) {
  const cleaned = stripMarkdownCodeFence(text);
  if (!cleaned) return { ok: false, errorType: "empty", message: "ChatGPT 응답을 먼저 붙여 넣어주세요." };
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { ok: false, errorType: "parse", message: "JSON 형식으로 읽을 수 없습니다. ChatGPT가 반환한 JSON 전체를 복사했는지 확인해주세요." };
  }
  if (hasForbiddenField(parsed)) {
    return { ok: false, errorType: "forbidden-fields", message: "점수형 응답이 포함되어 있어 적용하지 않았습니다." };
  }
  if (parsed?.interpretationMode === "axis-finder") {
    const rawAxisValidation = validateAxisFinderResponse(parsed);
    if (!rawAxisValidation.ok) {
      return { ok: false, errorType: "schema", message: "미친소리 방향 응답 구조에 필요한 항목이 없습니다. 전체 요청문을 다시 사용해 해석해주세요.", issues: rawAxisValidation.issues };
    }
    const normalizedAxis = normalizeAxisFinderResponse(parsed);
    const normalizedAxisValidation = validateAxisFinderResponse(normalizedAxis);
    if (!normalizedAxisValidation.ok) {
      return { ok: false, errorType: "schema", message: "미친소리 방향 응답 구조에 필요한 항목이 없습니다. 전체 요청문을 다시 사용해 해석해주세요.", issues: normalizedAxisValidation.issues };
    }
    return { ok: true, value: normalizedAxis };
  }
  const rawValidation = validateAiResponse(parsed);
  if (!rawValidation.ok) {
    return { ok: false, errorType: "schema", message: "응답 구조에 필요한 항목이 없습니다. 전체 요청문을 다시 사용해 해석해주세요.", issues: rawValidation.issues };
  }
  const normalized = normalizeAiResponse(parsed);
  const validation = validateAiResponse(normalized);
  if (!validation.ok) {
    return { ok: false, errorType: "schema", message: "응답 구조에 필요한 항목이 없습니다. 전체 요청문을 다시 사용해 해석해주세요.", issues: validation.issues };
  }
  return { ok: true, value: normalized };
}

export const PROMPT_FORBIDDEN_PATTERNS = BAD_PROMPT_PATTERNS;
