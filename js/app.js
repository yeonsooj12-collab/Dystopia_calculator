import "./engine.js";
import {
  buildAiInput,
  buildHistoryLensInput,
  createEmptyAiResponse,
  createFallbackAiResponse,
  createMockAiResponse,
  getAiResultStatus,
  normalizeAiResponse,
  validateAiResponse,
  validateAiInput,
  getSelectedInputSummary,
  buildAiRequestPayload,
  extractRuleBasedContext,
  getAiResultHeadline,
} from "./ai.js";
import {
  CATEGORY_KEY_MAP,
  getCategoryOptions,
  normalizeText,
  inferCustomMetadata,
  evaluateResolvedInputs,
  getInputValidation,
} from "./input.js";
import { buildCompactInterpretationView, buildInterpretation, toDisplayText } from "./interpretation.js";
import {
  buildAxisDetailPrompt,
  buildEditorialBrief,
  buildFullChatGptPrompt,
  getPromptMode,
  parsePastedAiResponse,
} from "./prompt.js";

export {
  buildAiInput,
  buildHistoryLensInput,
  buildAiRequestPayload,
  buildAxisDetailPrompt,
  buildCompactInterpretationView,
  buildEditorialBrief,
  buildFullChatGptPrompt,
  createMockAiResponse,
  extractRuleBasedContext,
  getAiResultHeadline,
  getPromptMode,
  getSelectedInputSummary,
  parsePastedAiResponse,
  toDisplayText,
  validateAiInput,
};

export const CATEGORY_META = [
  {
    key: "pressure",
    group: "core",
    number: 1,
    title: "어떤 사회 압력이 커졌는가?",
    description: "세계사 비교를 시작하게 만드는 내부 압력입니다.",
    placeholder: "예: 전쟁 이후 재정 부족과 노동력 부족이 겹친다",
  },
  {
    key: "technology",
    group: "core",
    number: 2,
    title: "어떤 외부 조건이 작용하는가?",
    description: "전쟁, 무역, 이주, 제국 압박처럼 사회 바깥에서 들어오는 조건입니다.",
    placeholder: "예: 강대국의 무역 압박과 국경 변화",
  },
  {
    key: "periodScope",
    group: "scope",
    number: 0,
    title: "어떤 시대 범위를 우선 볼 것인가?",
    description: "특정 시대를 단정하지 않고, 비교를 시작할 시간 범위를 좁히는 힌트입니다.",
    placeholder: "예: 근대 전환기, 19세기 후반~20세기 초, 전쟁 직후",
    optional: true,
    supplemental: true,
  },
  {
    key: "regionScope",
    group: "scope",
    number: 0,
    title: "어떤 지역 범위를 우선 볼 것인가?",
    description: "특정 국가 하나로 고정하지 않고, 비교할 지역과 문명권의 범위를 좁히는 힌트입니다.",
    placeholder: "예: 동아시아와 유럽 비교, 제국 주변부, 식민지 경험 지역",
    optional: true,
    supplemental: true,
  },
  {
    key: "actor",
    group: "detail",
    number: 3,
    title: "누가 주도적으로 대응하는가?",
    description: "국가, 관료제, 군부, 기업, 종교 권위, 사회운동처럼 변화를 밀거나 막는 행위자입니다.",
    placeholder: "예: 중앙정부와 지방 엘리트가 함께 세금 제도를 바꾼다",
  },
  {
    key: "target",
    group: "detail",
    number: 4,
    title: "어떤 집단이 영향을 받는가?",
    description: "삶, 권리, 의무, 이동, 노동, 소속이 달라지는 사회 집단입니다.",
    placeholder: "예: 도시 노동자와 이주민",
  },
  {
    key: "metric",
    group: "detail",
    number: 5,
    title: "어떤 기준으로 분류되는가?",
    description: "신분, 계급, 재산, 납세 능력, 거주지, 시민권처럼 사람과 집단을 나누는 기준입니다.",
    placeholder: "예: 거주지와 납세 능력",
  },
  {
    key: "mechanism",
    group: "amplifier",
    number: 6,
    title: "어떤 통치 수단이 쓰이는가?",
    description: "세금, 등록, 검역, 배급, 교육, 감시, 부채처럼 조건을 실제 제도로 바꾸는 수단입니다.",
    placeholder: "예: 호적 등록과 토지 조사를 결합한다",
  },
  {
    key: "ideology",
    group: "amplifier",
    number: 7,
    title: "어떤 말로 정당화되는가?",
    description: "질서, 안보, 공익, 문명화, 효율, 위생, 자유, 평등 같은 명분 언어입니다.",
    placeholder: "예: 공익과 국가 생존을 위해 필요하다고 말한다",
  },
  {
    key: "transformation",
    group: "amplifier",
    number: 8,
    title: "실제로 무엇이 바뀌는가?",
    description: "권리 확대·제한, 노동 동원, 강제 이동, 시장화, 시민권 재정의처럼 나타난 변화입니다.",
    placeholder: "예: 시민권 자격이 납세 기록과 거주지로 다시 정해진다",
  },
  {
    key: "careNarrative",
    group: "amplifier",
    number: 9,
    title: "어떤 저항·균열이 나타나는가?",
    description: "반란, 파업, 소송, 도피, 암시장, 청원, 개혁 운동, 제도 실패처럼 역사가 한 방향으로만 흐르지 않게 만드는 반응입니다.",
    placeholder: "예: 파업과 암시장이 동시에 나타난다",
  },
];

const GROUPS = {
  scope: {
    title: "탐색 범위",
    description: "시대와 지역을 좁히고 싶을 때만 씁니다.\n비워도 됩니다.",
  },
  core: {
    title: "조건",
    description: "하나만 골라도 시작할 수 있습니다.",
  },
  detail: {
    title: "구조",
    description: "누가 대응하는지 봅니다.\n어떤 집단이 어떤 기준으로 분류되는지도 보충합니다. 비워도 됩니다.",
  },
  amplifier: {
    title: "작동과 결과",
    description: "제도가 무엇을 바꾸는지 봅니다.\n어디서 흔들리는지도 보충합니다. 비워도 됩니다.",
  },
};

const STARTER_TEMPLATES = [
  {
    id: "crisis-rationing",
    title: "위기와 배급",
    icon: "▦",
    description: "부족, 배급, 가격 통제",
    values: {
      pressure: "food-energy-shortage",
      technology: "war-aftermath",
      actor: "central-state",
      target: "consumers-households",
      metric: "residence",
      mechanism: "rationing",
      ideology: "public-good",
      transformation: "rights-restriction",
      careNarrative: "black-market",
    },
  },
  {
    id: "counting-people",
    title: "국가가 사람을 세는 순간",
    icon: "◎",
    description: "등록, 통계, 시민권",
    values: {
      pressure: "state-centralization",
      technology: "writing-archive",
      actor: "bureaucracy",
      target: "noncitizens",
      metric: "citizenship",
      mechanism: "census-statistics",
      ideology: "order",
      transformation: "citizenship-redefinition",
      careNarrative: "petition",
    },
  },
  {
    id: "movement-border",
    title: "이동과 국경",
    icon: "↔",
    description: "이주, 문서, 접경지",
    values: {
      pressure: "regional-inequality",
      technology: "border-change",
      actor: "local-elites",
      target: "borderland-communities",
      metric: "residence",
      mechanism: "passport-documents",
      ideology: "security",
      transformation: "border-reorganization",
      careNarrative: "flight-migration",
    },
  },
  {
    id: "education-citizen",
    title: "교육과 시민 만들기",
    icon: "◇",
    description: "학교, 언어, 시민 규범",
    values: {
      pressure: "legitimacy-crisis",
      technology: "printing-public-sphere",
      actor: "press-intellectuals",
      target: "students-youth",
      metric: "literacy-education",
      mechanism: "school-curriculum",
      ideology: "progress",
      transformation: "public-education-expansion",
      careNarrative: "cultural-revival",
    },
  },
  {
    id: "culture-everyday",
    title: "생활상과 문화 변화",
    icon: "✦",
    description: "음식, 의례, 대중문화",
    values: {
      pressure: "technology-change",
      technology: "transport-infrastructure",
      actor: "household-family",
      target: "artists-performers",
      metric: "language-cultural-practice",
      mechanism: "ritual-calendar",
      ideology: "tradition",
      transformation: "administrative-standardization",
      careNarrative: "material-culture",
    },
  },
];

export const AXIS_FINDER_RETRY_PROMPT = [
  "방금 응답은 최신 axis-finder JSON 구조가 아닙니다.",
  "아래 필드를 빠짐없이 포함해 유효한 JSON 객체 하나만 다시 출력해주세요.",
  "",
  "필수 조건:",
  "- 표준 JSON 큰따옴표(\")만 사용",
  "- JSON 앞뒤 설명, 코드펜스, 참고문헌, 각주 금지",
  "- version은 정확히 \"1.0\"",
  "- interpretationMode는 정확히 \"axis-finder\"",
  "- axes는 정확히 3개",
  "- 1차는 빠른 색인 단계이므로 장문 해설 금지",
  "- 각 axis의 historicalCases는 1~2개",
  "- bridge, whyThisAxisMatters, context, insight는 짧게 작성",
  "- 각 axis에는 historicalCases, similarities, differences, humanBehaviorPattern, futureInsight, verificationKeywords를 반드시 포함",
  "- 각 historicalCases 항목에는 title, period, region, context, insight, verificationKeywords를 반드시 포함",
].join("\n");

const state = {
  formState: createInitialFormState(),
  collapsed: { scope: true, detail: true, amplifier: true },
  ui: { structureInfoExpanded: false },
  aiState: createInitialAiState(),
  manualChatGpt: { responseText: "", copyStatus: "", error: "", selectedAxisId: "" },
  axisDetail: createInitialAxisDetailState(),
  result: null,
  validation: null,
  isResultStale: false,
};

let appRoot = null;

function byGroup(group) {
  return CATEGORY_META.filter((item) => item.group === group);
}

function createEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = toDisplayText(text);
  return element;
}

/**
 * 14개 카테고리를 포함한 초기 formState를 만든다.
 * @returns {object}
 */
export function createInitialFormState() {
  return Object.fromEntries(
    CATEGORY_META.map((category) => [
      category.key,
      { mode: category.supplemental ? "custom" : "preset", optionId: "", optionIds: [], customText: "", metadata: {} },
    ]),
  );
}

export function createInitialAiState() {
  return {
    status: "idle",
    input: null,
    response: null,
    error: null,
    source: null,
    isMock: false,
    isStale: false,
  };
}

export function createInitialAxisDetailState() {
  return {
    selectedAxisId: "",
    copyStatus: "",
    promptCopied: false,
  };
}

export function markAiStateStale(aiState) {
  if (!aiState?.response) return aiState || createInitialAiState();
  return { ...aiState, isStale: true };
}

export function resetAiState() {
  return createInitialAiState();
}

/**
 * 입력 완료 개수를 센다.
 * @param {object} formState
 * @param {string[]=} keys
 * @returns {number}
 */
export function countCompletedInputs(formState, keys = CATEGORY_META.map((item) => item.key)) {
  return keys.filter((key) => {
    const item = formState[key] || {};
    if (item.mode === "custom") return normalizeText(item.customText) !== "";
    return getSelectedOptionIds(formState, key).length > 0;
  }).length;
}

/**
 * confidence를 한국어 라벨로 바꾼다.
 * @param {string} confidence
 * @returns {string}
 */
export function getConfidenceLabel(confidence) {
  if (confidence === "high") return "높음";
  if (confidence === "medium") return "중간";
  return "낮음";
}

/**
 * scatterRisk를 한국어 라벨로 바꾼다.
 * @param {number} value
 * @returns {string}
 */
export function getScatterRiskLabel(value) {
  if (value >= 60) return "높음";
  if (value >= 30) return "보통";
  return "낮음";
}

export function createEvaluationResult(formState) {
  const result = evaluateResolvedInputs(formState);
  const interpretation = buildInterpretation({
    formState,
    resolvedInputs: result.selection,
    evaluation: result.evaluation,
  });
  const aiInput = buildHistoryLensInput({
    formState,
    resolvedInputs: result.selection,
    evaluation: result.evaluation,
    interpretation,
  });
  const editorialBrief = buildEditorialBrief({
    formState,
    resolvedInputs: result.selection,
    aiInput,
    evaluation: result.evaluation,
    interpretation,
  });
  return {
    ...result,
    interpretation,
    compactInterpretation: buildCompactInterpretationView(interpretation),
    aiInput,
    editorialBrief,
    fullChatGptPrompt: buildFullChatGptPrompt(editorialBrief),
    aiResponse: null,
    aiStatus: "ready",
  };
}

export function createAiStateFromResult(result) {
  return {
    status: result?.aiResponse ? (result.aiStatus === "incomplete" ? "success" : result.aiStatus) : "ready",
    input: result?.aiInput || null,
    response: result?.aiResponse || null,
    error: null,
    source: result?.aiResponse ? "api" : null,
    isMock: false,
    isStale: false,
  };
}

export function shouldUseMockAi() {
  if (typeof window === "undefined") return false;
  return getPromptMode({ search: window.location.search }) === "mock";
}

export function shouldUseApiAi() {
  if (typeof window === "undefined") return false;
  return getPromptMode({ search: window.location.search }) === "api";
}

export async function requestAiInterpretation(aiInput, { useMock = false } = {}) {
  if (useMock) {
    const mockResponse = normalizeAiResponse(createMockAiResponse(aiInput));
    const validation = validateAiResponse(mockResponse);
    if (!validation.ok) throw new Error(validation.issues.join(", "));
    return mockResponse;
  }
  if (typeof fetch !== "function") throw new Error("fetch_unavailable");
  const apiResponse = await fetch("/api/interpret", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(buildAiRequestPayload(aiInput)),
  });
  const payload = await apiResponse.json().catch(() => ({}));
  if (!apiResponse.ok) throw new Error(payload.error || "ai_request_failed");
  const normalized = normalizeAiResponse(payload.response || payload);
  const validation = validateAiResponse(normalized);
  if (!validation.ok) throw new Error(validation.issues.join(", "));
  return normalized;
}

export function createFallbackResult(result, error) {
  const aiResponse = normalizeAiResponse(
    createFallbackAiResponse({
      interpretation: result?.interpretation,
      aiInput: result?.aiInput,
    }),
  );
  return {
    ...result,
    aiResponse,
    aiStatus: getAiResultStatus(aiResponse),
    aiError: error?.message || String(error || ""),
  };
}

/**
 * 결과 최상단에 보여줄 상태 문구를 만든다.
 * @param {object} evaluation
 * @returns {string}
 */
export function getResultHeadline(evaluation) {
  if (!evaluation || evaluation.confidence === "low") {
    return "아직 연결을 판단할 정보가 충분하지 않습니다.";
  }
  if (evaluation.compatibility >= 65) {
    return "핵심 요소들이 비교적 선명하게 연결됩니다.";
  }
  if (evaluation.compatibility >= 40) {
    return "기본 연결은 보이지만 몇 가지 설명이 더 필요합니다.";
  }
  return "일부 요소 사이의 연결을 더 설명해보세요.";
}

/**
 * 결과 요약에 사용할 선택 데이터만 추린다.
 * @param {object} selection
 * @returns {object}
 */
export function buildSelectionSummaryData(selection) {
  const output = {};
  for (const group of ["core", "detail", "amplifier"]) {
    output[group] = Object.entries(selection[group] || {})
      .filter(([, option]) => option)
      .map(([key, option]) => ({
        key,
        title: CATEGORY_META.find((item) => item.key === key)?.title || key,
        label: option.label || "",
        source: option.source === "custom" ? "custom" : "preset",
      }));
  }
  return output;
}

export function updateFormField(formState, key, field, value) {
  if (field === "optionId") {
    const optionId = typeof value === "string" ? value : "";
    return {
      ...formState,
      [key]: {
        ...formState[key],
        optionId,
        optionIds: optionId ? [optionId] : [],
      },
    };
  }
  return {
    ...formState,
    [key]: {
      ...formState[key],
      [field]: value,
    },
  };
}

export function setInputMode(formState, key, mode) {
  return updateFormField(formState, key, "mode", mode);
}

export function updateFormStateField(formState, key, field, value) {
  return updateFormField(formState, key, field, value);
}

export function getSelectedOptionIds(formState, key) {
  const item = formState?.[key] || {};
  const optionIds = Array.isArray(item.optionIds) ? item.optionIds.filter((id) => typeof id === "string" && id !== "") : [];
  if (optionIds.length > 0) return [...new Set(optionIds)];
  return typeof item.optionId === "string" && item.optionId !== "" ? [item.optionId] : [];
}

export function addPresetOptionToFormState(formState, key, optionId) {
  if (typeof optionId !== "string" || optionId === "") return formState;
  const optionIds = [...new Set([...getSelectedOptionIds(formState, key), optionId])];
  return {
    ...formState,
    [key]: {
      ...formState[key],
      mode: "preset",
      optionId: optionIds[0] || "",
      optionIds,
    },
  };
}

export function removePresetOptionFromFormState(formState, key, optionId) {
  const optionIds = getSelectedOptionIds(formState, key).filter((id) => id !== optionId);
  return {
    ...formState,
    [key]: {
      ...formState[key],
      optionId: optionIds[0] || "",
      optionIds,
    },
  };
}

export function applyStarterTemplateToFormState(formState, templateId) {
  const template = STARTER_TEMPLATES.find((item) => item.id === templateId);
  if (!template) return formState;
  const next = { ...formState };
  for (const [key, optionId] of Object.entries(template.values)) {
    if (!findCategory(key)) continue;
    next[key] = {
      ...(next[key] || {}),
      mode: "preset",
      optionId,
      optionIds: optionId ? [optionId] : [],
      customText: next[key]?.customText || "",
      metadata: next[key]?.metadata || {},
    };
  }
  return next;
}

export function getSelectedOptionId(formState, key) {
  return getSelectedOptionIds(formState, key)[0] || "";
}

export function shouldHandleAction(element, action) {
  if (!element || element.dataset?.action !== action) return false;
  if (action === "update-field") return ["SELECT", "TEXTAREA"].includes(element.tagName);
  return element.tagName === "BUTTON";
}

export function toggleBooleanState(value) {
  return !Boolean(value);
}

export function getStructureInfoExpandedState(uiState = {}) {
  return Boolean(uiState.structureInfoExpanded || uiState.resultDetailsExpanded);
}

export function getStructureInfoToggleLabel(isExpanded) {
  return isExpanded ? "구조 정보 접기" : "구조 정보 보기";
}

export function getStructureInfoToggleAriaExpanded(isExpanded) {
  return String(Boolean(isExpanded));
}

export const getResultDetailsExpandedState = getStructureInfoExpandedState;
export const getResultDetailsToggleLabel = getStructureInfoToggleLabel;
export const getResultDetailsToggleAriaExpanded = getStructureInfoToggleAriaExpanded;

function getCategoryState(key) {
  return state.formState[key] || { mode: "preset", optionId: "", customText: "", metadata: {} };
}

export function renderApp() {
  if (!appRoot) return;
  appRoot.replaceChildren(
    renderOnboarding(),
    renderSection("scope"),
    renderSection("core"),
    renderSection("detail"),
    renderSection("amplifier"),
    renderActions(),
    renderResultPanel(),
  );
}

function renderFlowArrow() {
  const arrow = createEl("div", "process-arrow", "↓");
  arrow.setAttribute("aria-hidden", "true");
  return arrow;
}

function renderProcessStep(step) {
  const section = createEl("section", `process-step process-step--${step.tone}`);
  section.setAttribute("aria-labelledby", step.headingId);

  const header = createEl("div", "process-step-header");
  header.append(createEl("span", "process-step-number", step.number));
  const titleWrap = createEl("div");
  const heading = createEl("h3", "", step.title);
  heading.id = step.headingId;
  titleWrap.append(heading, createEl("p", "", step.subtitle));
  header.append(titleWrap);

  const grid = createEl("div", "process-card-grid");
  for (const item of step.items) {
    const card = createEl("div", "process-card");
    card.append(createEl("strong", "", item.label), createEl("span", "", item.description));
    grid.append(card);
  }

  section.append(header, grid);
  return section;
}

function renderProcessResult(result) {
  const card = createEl("section", "process-result-card");
  card.setAttribute("aria-labelledby", result.headingId);
  const heading = createEl("h3", "", result.title);
  heading.id = result.headingId;
  card.append(heading, createEl("p", "", result.description));
  return card;
}

function renderProcessFlow(steps, result, label) {
  const flow = createEl("div", "process-flow");
  flow.setAttribute("aria-label", label);
  steps.forEach((step, index) => {
    flow.append(renderProcessStep(step));
    if (index < steps.length - 1) flow.append(renderFlowArrow());
  });
  flow.append(renderFlowArrow(), renderProcessResult(result));
  return flow;
}

function renderFormulaFlow() {
  return renderProcessFlow(
    [
      {
        number: "①",
        tone: "core",
        headingId: "formula-core-heading",
        title: "조건",
        subtitle: "먼저 사회를 밀어붙이는 내부 압력과 외부 조건을 고른다.",
        items: [
          ["사회 압력", "무엇이 내부에서 사회를 압박하는가"],
          ["외부 조건", "전쟁, 무역, 이주, 강대국 압박은 있는가"],
        ].map(([label, description]) => ({ label, description })),
      },
      {
        number: "②",
        tone: "detail",
        headingId: "formula-detail-heading",
        title: "구조",
        subtitle: "누가 대응하고, 어떤 집단이 어떤 기준으로 분류되는지 본다.",
        items: [
          ["주도 행위자", "누가 변화를 밀거나 막는가"],
          ["영향을 받는 집단", "누구의 삶과 권리가 달라지는가"],
          ["분류 기준", "무엇으로 사람과 집단을 나누는가"],
        ].map(([label, description]) => ({ label, description })),
      },
      {
        number: "③",
        tone: "amplifier",
        headingId: "formula-amplifier-heading",
        title: "작동과 결과",
        subtitle: "제도가 실제로 어떤 변화를 만들고 어디서 흔들리는지 확인한다.",
        items: [
          ["통치 수단", "세금, 등록, 검역, 배급, 감시 같은 수단은 무엇인가"],
          ["정당화 언어", "질서, 안보, 공익, 효율 같은 명분은 무엇인가"],
          ["실제 변화", "권리, 노동, 이동, 소속은 어떻게 바뀌는가"],
          ["저항·균열", "반란, 파업, 소송, 도피, 암시장, 실패는 어디서 생기는가"],
        ].map(([label, description]) => ({ label, description })),
      },
    ],
    {
      headingId: "formula-result-heading",
      title: "비교해볼 역사 장면",
      description: "입력한 조건과 닮은 역사 사례를 찾고, 어디까지 비교할 수 있는지 함께 봅니다.",
    },
    "세계사 조건 렌즈의 3단계 사고 공식",
  );
}

function renderStarterTemplates() {
  const section = createEl("section", "starter-template-panel");
  section.setAttribute("aria-labelledby", "starter-template-heading");
  section.append(
    createEl("p", "section-kicker", "빠른 시작"),
    createEl("h3", "", "처음이면 하나만 눌러보세요"),
    createEl("p", "help-text", "누른 뒤 아래에서 마음대로 바꿔보세요."),
  );
  section.querySelector("h3").id = "starter-template-heading";

  const grid = createEl("div", "starter-template-grid");
  for (const template of STARTER_TEMPLATES) {
    const card = createEl("article", "starter-template-card");
    card.append(
      createEl("span", "starter-template-icon", template.icon || "·"),
      createEl("h4", "", template.title),
      createEl("p", "", template.description),
    );
    const button = createEl("button", "secondary-button starter-template-action", "▶ 시작");
    button.type = "button";
    button.dataset.action = "apply-start-template";
    button.dataset.templateId = template.id;
    card.append(button);
    grid.append(card);
  }
  section.append(grid);
  return section;
}

export function renderOnboarding() {
  const panel = createEl("section", "onboarding-panel");
  panel.setAttribute("aria-labelledby", "onboarding-heading");

  const guideDetails = createEl("details", "onboarding-details");
  guideDetails.append(createEl("summary", "", "사용법 보기"));

  const intro = createEl("div", "onboarding-intro");
  const heading = createEl("h2", "", "이 렌즈는 이런 순서로 생각합니다");
  heading.id = "onboarding-heading";
  intro.append(heading);
  guideDetails.append(intro, renderFormulaFlow());

  panel.append(guideDetails);

  panel.append(renderStarterTemplates());

  return panel;
}

export function renderSection(group) {
  const meta = GROUPS[group];
  const section = createEl("section", `section-panel section-panel--${group}`);
  if (group !== "core") section.classList.add("section-panel--optional");
  section.setAttribute("aria-labelledby", `${group}-heading`);

  const header = createEl("div", "section-header");
  const titleWrap = createEl("div");
  const heading = createEl("h2", "", meta.title);
  heading.id = `${group}-heading`;
  titleWrap.append(heading, createEl("p", "section-description", meta.description));

  header.append(titleWrap);
  if (group !== "core") {
    const toggle = createEl("button", "section-toggle", state.collapsed[group] ? "▾" : "▴");
    toggle.type = "button";
    toggle.setAttribute("aria-label", `${meta.title} ${state.collapsed[group] ? "열기" : "접기"}`);
    toggle.title = state.collapsed[group] ? "열기" : "접기";
    toggle.setAttribute("aria-expanded", String(!state.collapsed[group]));
    toggle.dataset.action = "toggle-section";
    toggle.dataset.group = group;
    header.append(toggle);
  }

  const grid = createEl("div", "input-grid");
  grid.hidden = group !== "core" && state.collapsed[group];
  for (const category of byGroup(group)) {
    grid.append(renderInputCard(category));
  }

  section.append(header, grid);
  return section;
}

export function renderInputCard(category) {
  const item = getCategoryState(category.key);
  const options = getCategoryOptions(category.key);
  const selectedOptionIds = getSelectedOptionIds(state.formState, category.key);
  const selectedOptions = selectedOptionIds
    .map((optionId) => options.find((option) => option.id === optionId))
    .filter(Boolean);
  const isMissing = false;
  const card = createEl("article", "input-card");
  card.dataset.cardKey = category.key;

  const heading = createEl("div", `card-heading${category.supplemental ? " card-heading--plain" : ""}`);
  if (!category.supplemental) heading.append(createEl("span", "card-number", String(category.number)));
  const headingText = createEl("div");
  headingText.append(createEl("h3", "", category.title));
  const desc = createEl("p", "card-description", category.description);
  desc.id = `${category.key}-description`;
  headingText.append(desc);
  heading.append(headingText);

  const mode = createEl("div", "input-mode-actions");
  const modeButton = createEl("button", "secondary-button input-mode-action", item.mode === "custom" ? "보기로 고르기" : "직접 입력하기");
  modeButton.type = "button";
  modeButton.dataset.action = "set-mode";
  modeButton.dataset.key = category.key;
  modeButton.dataset.mode = item.mode === "custom" ? "preset" : "custom";
  mode.append(modeButton);

  const presetField = createEl("div", "field-group");
  presetField.hidden = category.supplemental || item.mode !== "preset";
  const selectId = `${category.key}-select`;
  const selectLabel = createEl("label", "", "선택지");
  selectLabel.setAttribute("for", selectId);
  const select = document.createElement("select");
  select.id = selectId;
  select.dataset.action = "update-field";
  select.dataset.key = category.key;
  select.dataset.field = "optionId";
  select.setAttribute("aria-describedby", `${category.key}-description`);
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = selectedOptions.length > 0 ? "보기 더 추가하기" : "비워두기";
  select.append(emptyOption);
  for (const option of options) {
    const optionEl = document.createElement("option");
    optionEl.value = option.id;
    optionEl.textContent = option.label;
    optionEl.disabled = selectedOptionIds.includes(option.id);
    select.append(optionEl);
  }
  select.value = "";
  const optionDescriptionText = getPresetDescriptionText(category.key, selectedOptions);
  const optionDescription = createEl("p", "option-description", optionDescriptionText);
  optionDescription.dataset.role = "option-description";
  optionDescription.hidden = !optionDescriptionText;
  presetField.append(selectLabel, select, renderSelectedOptionChips(category.key, selectedOptions), optionDescription);

  const customField = createEl("div", "field-group");
  customField.hidden = category.supplemental ? false : item.mode !== "custom";
  const textareaId = `${category.key}-custom`;
  const textLabel = createEl("label", "", "직접 입력");
  textLabel.setAttribute("for", textareaId);
  const textarea = document.createElement("textarea");
  textarea.id = textareaId;
  textarea.maxLength = 160;
  textarea.placeholder = category.placeholder;
  textarea.value = item.customText;
  textarea.dataset.action = "update-field";
  textarea.dataset.key = category.key;
  textarea.dataset.field = "customText";
  textarea.setAttribute("aria-describedby", `${category.key}-description ${category.key}-tag-help`);
  customField.append(textLabel, textarea, renderTagPreview(category.key, item.customText));

  if (category.supplemental) {
    card.classList.add("input-card--supplemental");
    card.append(heading, customField);
  } else {
    const inputRow = createEl("div", "input-entry-row");
    inputRow.append(presetField, customField, mode);
    card.append(heading, inputRow);
  }
  return card;
}

function getPresetDescriptionText(categoryKey, selectedOptions = []) {
  if (selectedOptions.length === 0) return "";
  if (selectedOptions.length === 1) return selectedOptions[0].description || "선택한 보기를 기준으로 요청을 만듭니다.";
  return selectedOptions
    .map((option) => `${option.label}: ${option.description || "선택한 보기를 기준으로 요청을 만듭니다."}`)
    .join("\n");
}

function renderSelectedOptionChips(categoryKey, selectedOptions = []) {
  const wrap = createEl("div", "selected-option-list");
  wrap.dataset.role = "selected-option-list";
  if (selectedOptions.length === 0) {
    wrap.append(createEl("p", "selected-option-empty", "아직 고른 보기 없음"));
    return wrap;
  }
  for (const option of selectedOptions) {
    const chip = createEl("span", "selected-option-chip");
    chip.append(createEl("span", "", option.label));
    const remove = createEl("button", "selected-option-remove", "×");
    remove.type = "button";
    remove.dataset.action = "remove-preset-option";
    remove.dataset.key = categoryKey;
    remove.dataset.optionId = option.id;
    remove.setAttribute("aria-label", `${option.label} 선택 해제`);
    chip.append(remove);
    wrap.append(chip);
  }
  return wrap;
}

export function renderTagPreview(key, text) {
  const wrap = createEl("div");
  wrap.dataset.role = "tag-preview";
  const help = createEl("p", "help-text", "직접 입력한 문장은 그대로 보존됩니다.");
  help.id = `${key}-tag-help`;
  const tags = createEl("div", "tag-list");
  const inferred = inferCustomMetadata(key, text);
  const allTags = [
    ...inferred.domains,
    ...inferred.functions,
    ...inferred.rights,
    ...inferred.tones,
  ];
  for (const tag of allTags.slice(0, 10)) tags.append(createEl("span", "tag-pill", tag));
  wrap.append(help, tags);
  return wrap;
}

function renderActions() {
  const wrap = createEl("div", "action-row");
  const evaluate = createEl("button", "primary-button", "1. 요청 만들기");
  evaluate.type = "button";
  evaluate.dataset.action = "evaluate";
  const reset = createEl("button", "secondary-button", "입력 초기화");
  reset.type = "button";
  reset.dataset.action = "reset";
  wrap.append(evaluate, reset);
  return wrap;
}

function renderResultPanel() {
  const panel = createEl("section", "result-panel");
  panel.setAttribute("aria-label", "결과");
  panel.setAttribute("aria-live", "polite");
  if (!state.result) {
    panel.append(createEl("p", "help-text", "조건을 적고 `1. 요청 만들기`를 누르세요."));
    if (state.validation) panel.append(renderValidation(state.validation));
    return panel;
  }
  panel.append(renderAiResult(state.result, state.aiState));
  return panel;
}

export function renderValidation(validation) {
  const wrap = createEl("div", "result-summary");
  if (!validation) return wrap;
  if (!validation.isCoreComplete) wrap.append(createEl("p", "message message--warning", "조건을 하나 이상 입력해주세요."));
  for (const warning of validation.warnings) wrap.append(createEl("p", "message message--warning", warning));
  for (const info of validation.info) wrap.append(createEl("p", "message message--info", info));
  return wrap;
}

export function renderEvaluation(evaluation) {
  const wrap = createEl("div", "result-summary supporting-metrics");
  wrap.append(createEl("h3", "", "보조 진단 수치"));
  wrap.append(createEl("p", "help-text", "아래 수치는 해석 엔진이 참고한 연결도와 판단 근거 범위입니다."));

  const metrics = createEl("div", "metric-grid");
  const metricData = [
    ["연결도", `${evaluation.compatibility}/100`],
    ["판단 신뢰도", getConfidenceLabel(evaluation.confidence)],
    ["근거 범위", `${Math.round(evaluation.evidenceCoverage * 100)}%`],
    ["산만함 위험", `${getScatterRiskLabel(evaluation.scatterRisk)} · ${evaluation.scatterRisk}/100`],
  ];
  for (const [label, value] of metricData) {
    const item = createEl("div", "metric-row");
    item.append(createEl("span", "", label), createEl("strong", "", value));
    metrics.append(item);
  }
  wrap.append(metrics);
  return wrap;
}

export function getDiagnosisStatusLabel(status) {
  const labels = {
    strong: "선명함",
    workable: "작동 가능",
    "needs-detail": "설명 필요",
    uncertain: "판단 보류",
    missing: "비어 있음",
    caution: "주의",
  };
  return labels[status] || "판단 보류";
}

function renderInsightList(title, items, className, emptyText) {
  const wrap = createEl("section", `pair-insight-list ${className}`);
  wrap.append(createEl("h3", "", title));
  const list = document.createElement("ul");
  const content = Array.isArray(items) && items.length > 0 ? items : [emptyText];
  for (const item of content) {
    const text = toDisplayText(item);
    if (text) list.append(createEl("li", "", text));
  }
  wrap.append(list);
  return wrap;
}

function renderLimitedInsightList(title, limited, className, emptyText) {
  const wrap = renderInsightList(title, limited.items, className, emptyText);
  if (limited.remaining > 0) wrap.append(createEl("p", "compact-more", `외 ${limited.remaining}개`));
  return wrap;
}

function renderDiagnosisCard(diagnosis, compact = false) {
  const card = createEl("article", `diagnosis-card${compact ? " diagnosis-card--compact" : ""} diagnosis-card--${diagnosis.status}`);
  card.append(createEl("span", "diagnosis-status", getDiagnosisStatusLabel(diagnosis.status)));
  card.append(createEl("h3", "", toDisplayText(diagnosis.title)));
  card.append(createEl("p", "diagnosis-message", toDisplayText(diagnosis.message)));
  if (!compact && diagnosis.reason) card.append(createEl("p", "diagnosis-reason", toDisplayText(diagnosis.reason)));
  if (diagnosis.suggestion) card.append(createEl("p", "diagnosis-suggestion", toDisplayText(diagnosis.suggestion)));
  if (!compact && diagnosis.questions?.length) {
    const questionWrap = createEl("div", "diagnosis-questions");
    const list = document.createElement("ul");
    for (const question of diagnosis.questions.slice(0, 3)) list.append(createEl("li", "", toDisplayText(question)));
    questionWrap.append(list);
    card.append(questionWrap);
  }
  return card;
}

function renderCompactMetrics(evaluation) {
  const metrics = createEl("div", "compact-metrics");
  const metricData = [
    ["연결도", `${evaluation.compatibility}/100`],
    ["신뢰도", getConfidenceLabel(evaluation.confidence)],
    ["근거", `${Math.round(evaluation.evidenceCoverage * 100)}%`],
    ["산만함", `${getScatterRiskLabel(evaluation.scatterRisk)} · ${evaluation.scatterRisk}/100`],
  ];
  for (const [label, value] of metricData) {
    const item = createEl("div", "metric-row");
    item.append(createEl("span", "", label), createEl("strong", "", value));
    metrics.append(item);
  }
  return metrics;
}

function renderCompactSelectionSummary(selection) {
  const summaryData = buildSelectionSummaryData(selection);
  const wrap = createEl("div", "compact-selection-summary");
  const groupLabels = { core: "조건", detail: "구조", amplifier: "작동과 결과" };
  for (const group of ["core", "detail", "amplifier"]) {
    if (summaryData[group].length === 0) continue;
    const groupWrap = createEl("details", "compact-summary-group");
    if (group === "core") groupWrap.open = true;
    groupWrap.append(createEl("summary", "", groupLabels[group]));
    const dl = createEl("dl", "summary-items");
    for (const item of summaryData[group]) {
      const row = createEl("div", "summary-item");
      row.append(createEl("dt", "", toDisplayText(item.title)), createEl("dd", "", toDisplayText(item.label)));
      dl.append(row);
    }
    groupWrap.append(dl);
    wrap.append(groupWrap);
  }
  return wrap;
}

function renderRuleContext(result) {
  const context = result.aiInput?.ruleContext || {};
  const wrap = createEl("section", "rule-context-summary");
  wrap.append(
    createEl("h3", "", "입력 상태"),
    createEl(
      "p",
      "",
      context.missingCoreCategories?.length
        ? context.missingCoreCategories.map((item) => item.label).join(", ")
        : "선택된 조건을 기준으로 역사 비교 가능성을 살폈습니다.",
    ),
  );
  const metrics = createEl("div", "compact-metrics");
  const metricData = [
    ["규칙 기반 판단 신뢰도", getConfidenceLabel(context.confidence)],
    ["판단 근거 범위", `${Math.round((context.evidenceCoverage || 0) * 100)}%`],
    ["compatibility", `${result.evaluation.compatibility}/100 · 태그 기반 참고 정보이며 아이디어의 품질 점수가 아닙니다.`],
    ["scatterRisk", `${result.evaluation.scatterRisk}/100 · 입력 요소 수와 확인 가능한 약한 연결을 바탕으로 한 내부 참고값입니다.`],
  ];
  for (const [label, value] of metricData) {
    const item = createEl("div", "metric-row");
    item.append(createEl("span", "", label), createEl("strong", "", value));
    metrics.append(item);
  }
  wrap.append(metrics);
  wrap.append(
    createEl(
      "p",
      "help-text",
      "이 수치는 아이디어의 창의성이나 품질을 평가하지 않습니다. 입력된 태그 사이에서 확인 가능한 구조적 연결 정보만 보여줍니다.",
    ),
    createEl(
      "p",
      "help-text",
      "낯선 조합은 오류가 아니라, 어떤 역사적 문맥을 더 확인해야 하는지 알려주는 단서가 될 수 있습니다.",
    ),
  );
  return wrap;
}

function renderStructureInfo(result, compact) {
  const interpretation = result.interpretation;
  const details = createEl("div", "structure-info-panel");
  details.id = "structure-info-panel";
  details.hidden = !getStructureInfoExpandedState(state.ui);

  details.append(renderRuleContext(result));

  const overview = createEl("section", "interpretation-overview");
  overview.append(createEl("h3", "", "연결 태그 정보"));
  if (Array.isArray(interpretation.overview) && interpretation.overview.length > 0) {
    const list = document.createElement("ul");
    for (const item of interpretation.overview) list.append(createEl("li", "", toDisplayText(item)));
    overview.append(list);
  } else {
    overview.append(createEl("p", "", "작성된 조건이 아직 없습니다."));
  }
  details.append(overview);

  details.append(renderLimitedInsightList("규칙 기반 질문", compact.questions, "uncertain-list", "추가 질문이 없습니다."));
  details.append(renderLimitedInsightList("판단 보류 연결", compact.uncertain, "uncertain-list", "판단이 유보된 핵심 연결은 없습니다."));

  const questions = createEl("section", "reflection-questions");
  questions.append(createEl("h3", "", "기존 핵심 연결 진단"));
  const questionList = document.createElement("ol");
  const content = Object.values(interpretation.categoryDiagnoses || {}).map((diagnosis) => `${diagnosis.title}: ${diagnosis.message}`);
  for (const question of content) questionList.append(createEl("li", "", toDisplayText(question)));
  questions.append(questionList);
  details.append(questions);

  const selection = createEl("section", "selection-summary selection-summary--compact");
  selection.append(createEl("h3", "", "입력 내용"), renderCompactSelectionSummary(result.selection));
  details.append(selection);

  return details;
}

function getAiBadgeLabel(response, aiState) {
  if (aiState?.status === "loading") return "역사 렌즈 요청 중";
  if (aiState?.status === "ready") return "역사 렌즈 대기";
  if (aiState?.status === "brief-ready") return "다음 단계";
  if (aiState?.source === "manual-chatgpt-detail") return "AI 채팅 세계사 해설";
  if (aiState?.source === "manual-chatgpt") return "AI 채팅 쟁점 적용";
  if (!aiState?.isMock && response?.status !== "fallback") return "실제 AI 응답";
  if (response?.status === "fallback") return "fallback";
  if (aiState?.isMock) return "API 연결 전 미리보기";
  return "추후 실제 AI 응답";
}

function getAiBadgeTone(response, aiState) {
  if (aiState?.status === "loading") return "loading";
  if (aiState?.status === "brief-ready") return "brief";
  if (response?.status === "fallback") return "fallback";
  if (aiState?.source === "manual-chatgpt-detail") return "manual";
  if (aiState?.source === "manual-chatgpt") return "manual";
  if (aiState?.isMock) return "mock";
  return "success";
}

function renderAiProvenance(response) {
  const wrap = createEl("details", "ai-provenance-details");
  wrap.append(createEl("summary", "", "입력과 제안 구분 보기"));
  const groups = [
    ["내 입력", "user-element-badge", response.preservedUserElements || []],
    ["AI 제안", "ai-suggestion-badge", (response.generatedSuggestions || []).slice(0, 3)],
    ["추가로 정할 조건", "ai-assumption-badge", (response.possibleBridge?.assumptions || []).slice(0, 2)],
  ];
  for (const [title, badgeClass, items] of groups) {
    const section = createEl("div", "ai-provenance-group");
    section.append(createEl("span", badgeClass, title));
    const list = document.createElement("ul");
    const content = Array.isArray(items) ? items : [];
    for (const item of content) {
      const text = toDisplayText(item.text || item.label || item.rawText || item);
      if (text) list.append(createEl("li", "", text));
    }
    if (list.childNodes.length === 0) list.append(createEl("li", "", "표시할 항목이 없습니다."));
    section.append(list);
    wrap.append(section);
  }
  return wrap;
}

function renderManualResponseError(message) {
  const wrap = createEl("div", "manual-response-error");
  wrap.append(createEl("p", "message message--danger", message));
  const copy = createEl("button", "secondary-button", "다시 요청 문구 복사");
  copy.type = "button";
  copy.dataset.action = "copy-axis-finder-retry";
  wrap.append(copy);
  return wrap;
}

export function renderManualChatGptPanel(result) {
  const panel = createEl("div", "manual-chatgpt-panel");
  const brief = result?.editorialBrief;
  if (!brief) {
    panel.append(createEl("p", "help-text", "아직 보낼 요청이 없습니다."));
    return panel;
  }
  if (state.isResultStale) {
    panel.append(createEl("p", "stale-ai-notice", "입력 내용이 변경되었습니다. 다시 요청하면 최신 내용이 반영됩니다."));
  }

  const nextAction = createEl("section", "manual-next-action");
  nextAction.append(
    createEl("span", "ai-status-badge ai-status-badge--brief", "다음 단계"),
    createEl("h3", "", "2. 내 AI에 붙여넣기"),
    createEl("p", "manual-next-action-text", "복사해서 ChatGPT, Claude, Gemini 같은 AI 채팅에 붙여넣으세요. 답변은 다시 여기로 가져옵니다."),
  );
  const copyActions = createEl("div", "manual-copy-actions");
  const fullCopy = createEl("button", "primary-button", "1차 요청 복사하기");
  fullCopy.type = "button";
  fullCopy.dataset.action = "copy-full-prompt";
  copyActions.append(fullCopy);
  if (state.manualChatGpt.copyStatus) copyActions.append(createEl("p", "message message--info", state.manualChatGpt.copyStatus));
  nextAction.append(copyActions);
  panel.append(nextAction);

  const fallback = createEl("textarea", "manual-copy-fallback");
  fallback.readOnly = true;
  fallback.value = result.fullChatGptPrompt || "";
  fallback.hidden = true;
  fallback.dataset.role = "manual-copy-fallback";
  panel.append(fallback);

  const paste = createEl("section", "manual-response-panel");
  paste.append(createEl("h3", "", "3. 답변을 여기로 가져오기"));
  const textareaLabel = createEl("label", "manual-response-label", "AI 채팅 답변");
  const textarea = document.createElement("textarea");
  textarea.placeholder = "AI가 준 답변 전체를 붙여넣으세요.";
  textarea.value = state.manualChatGpt.responseText;
  textarea.dataset.action = "update-manual-response";
  textarea.className = "manual-response-textarea";
  textareaLabel.append(textarea);
  paste.append(textareaLabel);
  const apply = createEl("button", "primary-button", "3. 답변 적용하기");
  apply.type = "button";
  apply.dataset.action = "apply-manual-ai-response";
  paste.append(apply);
  if (state.manualChatGpt.error) paste.append(renderManualResponseError(state.manualChatGpt.error));
  panel.append(paste);
  return panel;
}

function renderElementBadges(items = [], className, emptyText) {
  const wrap = createEl("div", "axis-element-badges");
  const content = Array.isArray(items) && items.length ? items : [emptyText];
  for (const item of content) wrap.append(createEl("span", className, item));
  return wrap;
}

export function collectAxisVerificationKeywords(axis = {}) {
  const fromAxis = Array.isArray(axis.verificationKeywords) ? axis.verificationKeywords : [];
  const fromCases = Array.isArray(axis.historicalCases)
    ? axis.historicalCases.flatMap((item) => (Array.isArray(item.verificationKeywords) ? item.verificationKeywords : []))
    : [];
  return [...new Set([...fromAxis, ...fromCases].map((item) => toDisplayText(item)).filter(Boolean))];
}

export function buildVerificationKeywordCopyText(axis = {}) {
  const keywords = collectAxisVerificationKeywords(axis);
  if (!keywords.length) return "";
  const lines = [`${toDisplayText(axis.title || "선택한 역사 렌즈")} 검증 키워드`, ""];
  for (const keyword of keywords) lines.push(`- ${keyword}`);
  lines.push("", "검색할 때는 한 키워드만 믿지 말고, 지역·시대·사건명을 함께 바꿔 확인하세요.");
  return lines.join("\n");
}

function renderTextParagraphs(text, className = "") {
  const wrap = createEl("div", className);
  const paragraphs = toDisplayText(text)
    .split(/\n{2,}|\n(?=(?:사례|비교|패턴|키워드)\s*\d*[:：])/)
    .map((item) => item.trim())
    .filter(Boolean);
  const content = paragraphs.length ? paragraphs : [toDisplayText(text)];
  for (const paragraph of content) wrap.append(createEl("p", "", paragraph));
  return wrap;
}

function findAxisById(response, axisId) {
  return response?.axes?.find((axis) => axis.id === axisId) || null;
}

export function isAxisDetailPanelVisible(axisDetailState = state.axisDetail) {
  return Boolean(axisDetailState?.selectedAxisId);
}

export function resetAxisDetailState(axisDetailState = state.axisDetail) {
  return {
    ...createInitialAxisDetailState(),
    copyStatus: axisDetailState?.copyStatus || "",
  };
}

function renderAxisDetailPanel(result, response) {
  const selectedAxis = findAxisById(response, state.axisDetail.selectedAxisId);
  if (!selectedAxis) return null;

  const panel = createEl("section", "axis-detail-panel");
  panel.append(
    createEl("span", "ai-status-badge ai-status-badge--loading", "4단계"),
    createEl("h3", "", "4. 더 깊게 탐색하기"),
    createEl("p", "help-text", "복사한 요청문을 ChatGPT, Claude, Gemini 같은 AI 채팅에 붙여 넣으면 바로 읽을 수 있는 세계사 해설을 받을 수 있습니다. 2차 답변은 이 앱에 다시 붙여 넣지 않아도 됩니다."),
  );

  const summary = createEl("div", "axis-detail-summary");
  summary.append(createEl("h4", "", selectedAxis.title));
  summary.append(createEl("p", "axis-contradiction", selectedAxis.centralContradiction));
  const used = createEl("section", "axis-elements");
  used.append(createEl("h5", "", "이번 쟁점에서 사용한 요소"));
  used.append(renderElementBadges(selectedAxis.usedElements, "axis-used-badge", "사용 요소 없음"));
  summary.append(used);
  const deferred = createEl("section", "axis-elements");
  deferred.append(createEl("h5", "", "보류한 요소"));
  deferred.append(renderElementBadges(selectedAxis.deferredElements, "axis-deferred-badge", "보류 요소 없음"));
  summary.append(deferred);
  panel.append(summary);

  panel.append(createEl("p", "axis-next-step-note", "이후의 긴 역사 해설, 참고 키워드, 후속 질문은 사용 중인 AI 채팅창에서 이어서 읽으세요."));
  if (state.axisDetail.copyStatus) panel.append(createEl("p", "message message--info", state.axisDetail.copyStatus));

  const actions = createEl("div", "manual-copy-actions");
  const copyAgain = createEl("button", "primary-button", "2차 학습 프롬프트 다시 복사");
  copyAgain.type = "button";
  copyAgain.dataset.action = "copy-axis-detail-prompt";
  copyAgain.dataset.axisId = selectedAxis.id;
  const cancel = createEl("button", "secondary-button", "쟁점 선택 취소");
  cancel.type = "button";
  cancel.dataset.action = "cancel-axis-detail";
  actions.append(copyAgain, cancel);
  panel.append(actions);

  const fallback = createEl("textarea", "manual-copy-fallback");
  fallback.readOnly = true;
  fallback.hidden = true;
  fallback.dataset.role = "axis-detail-copy-fallback";
  fallback.value = result?.editorialBrief ? buildAxisDetailPrompt({ editorialBrief: result.editorialBrief, axis: selectedAxis }) : "";
  panel.append(fallback);

  return panel;
}

export function renderAxisFinderResult(result, response) {
  const panel = createEl("div", "axis-finder-panel");
  const header = createEl("div", "axis-finder-header");
  const titleWrap = createEl("div", "axis-finder-title");
  titleWrap.append(
    createEl("span", "ai-status-badge ai-status-badge--manual", "AI 쟁점 찾기"),
    createEl("h3", "", "이 조합에서 발견한 역사적 쟁점"),
  );
  header.append(titleWrap);
  panel.append(header);
  if (response.overview) panel.append(createEl("p", "axis-overview", response.overview));

  const grid = createEl("div", "axis-card-grid");
  for (const axis of response.axes || []) {
    const card = createEl("article", "axis-card");
    if (state.manualChatGpt.selectedAxisId === axis.id) card.classList.add("axis-card--selected");
    card.append(
      createEl("h4", "", axis.title),
      createEl("p", "axis-core-insight", axis.coreInsight),
    );
    if (axis.historicalCases?.length) {
      const cases = createEl("section", "axis-history-cases");
      for (const historicalCase of axis.historicalCases) {
        cases.append(renderHistoricalCase(historicalCase));
      }
      card.append(cases);
    }
    const compare = createEl("section", "axis-comparison");
    compare.append(createEl("h5", "", "비교의 한계와 닮은 점"));
    const comparisonGrid = createEl("div", "axis-comparison-grid");
    comparisonGrid.append(renderLabeledList("같다고 보면 안 되는 이유", axis.differences, "axis-difference-badge", "주의할 차이 없음"));
    comparisonGrid.append(renderLabeledList("비슷하다고 볼 이유", axis.similarities, "axis-similarity-badge", "비교할 닮은 점 없음"));
    compare.append(comparisonGrid);
    card.append(compare);
    if (axis.humanBehaviorPattern) {
      const pattern = createEl("section", "axis-learning-note");
      pattern.append(createEl("h5", "", "인간 행동양식"));
      pattern.append(createEl("p", "", axis.humanBehaviorPattern));
      card.append(pattern);
    }
    if (axis.futureInsight) {
      const future = createEl("section", "axis-learning-note axis-learning-note--future");
      future.append(createEl("h5", "", "앞으로의 사회를 읽는 힌트"));
      future.append(createEl("p", "", axis.futureInsight));
      card.append(future);
    }
    if (axis.verificationKeywords?.length) {
      const keywords = createEl("details", "axis-keyword-details");
      keywords.append(createEl("summary", "", "확인 키워드 열기"));
      keywords.append(renderElementBadges(axis.verificationKeywords, "axis-keyword-badge", "확인 키워드 없음"));
      const keywordCopy = createEl("button", "keyword-copy-button", "확인 키워드 복사");
      keywordCopy.type = "button";
      keywordCopy.dataset.action = "copy-axis-keywords";
      keywordCopy.dataset.axisId = axis.id;
      keywords.append(keywordCopy);
      card.append(keywords);
    }
    card.append(createEl("p", "axis-contradiction", axis.centralContradiction));
    const used = createEl("section", "axis-elements");
    used.append(createEl("h5", "", "이번 쟁점에서 사용"));
    used.append(renderElementBadges(axis.usedElements, "axis-used-badge", "사용 요소 없음"));
    card.append(used);
    if (axis.bridge) card.append(createEl("p", "axis-bridge", axis.bridge));
    if (axis.assumptions?.length) {
      const assumptions = createEl("section", "axis-elements");
      assumptions.append(createEl("h5", "", "필요한 가정"));
      assumptions.append(renderElementBadges(axis.assumptions, "axis-assumption-badge", "추가 가정 없음"));
      card.append(assumptions);
    }
    if (axis.whyThisAxisMatters) card.append(createEl("p", "axis-why", axis.whyThisAxisMatters));
    if (axis.specificQuestion) card.append(createEl("p", "axis-question", axis.specificQuestion));
    const button = createEl("button", "secondary-button", "이 쟁점을 AI 채팅에서 더 읽기");
    button.type = "button";
    button.dataset.action = "copy-axis-detail-prompt";
    button.dataset.axisId = axis.id;
    card.append(button);
    grid.append(card);
  }
  panel.append(grid);
  const detailPanel = renderAxisDetailPanel(result, response);
  if (detailPanel) panel.append(detailPanel);

  if (response.unresolvedElements?.length) {
    const unresolved = createEl("details", "axis-unresolved");
    unresolved.append(createEl("summary", "", "아직 어느 쟁점에도 배치하지 않은 요소"));
    unresolved.append(createEl("p", "help-text", "제외된 요소가 아닙니다. 다른 역사 렌즈에서 사용할 수 있는 재료입니다."));
    unresolved.append(renderElementBadges(response.unresolvedElements, "axis-deferred-badge", "미배치 요소 없음"));
    panel.append(unresolved);
  }
  if (response.editorNote) panel.append(createEl("p", "axis-editor-note", response.editorNote));
  if (state.manualChatGpt.copyStatus) panel.append(createEl("p", "message message--info", state.manualChatGpt.copyStatus));
  const fallback = createEl("textarea", "manual-copy-fallback");
  fallback.readOnly = true;
  fallback.hidden = true;
  fallback.dataset.role = "manual-copy-fallback";
  panel.append(fallback);
  return panel;
}

function renderHistoricalCase(historicalCase = {}) {
  const item = createEl("article", "historical-case-card");
  item.append(createEl("h6", "", historicalCase.title || "비교할 역사 장면"));
  const meta = [historicalCase.period, historicalCase.region].filter(Boolean).join(" · ");
  if (meta) item.append(createEl("p", "historical-case-meta", meta));
  if (historicalCase.context) {
    const context = createEl("div", "historical-case-block");
    context.append(createEl("strong", "", "전후 맥락"));
    context.append(createEl("p", "", historicalCase.context));
    item.append(context);
  }
  if (historicalCase.insight) {
    const insight = createEl("div", "historical-case-block");
    insight.append(createEl("strong", "", "읽을 점"));
    insight.append(createEl("p", "", historicalCase.insight));
    item.append(insight);
  }
  if (historicalCase.verificationKeywords?.length) {
    const keywords = createEl("details", "axis-keyword-details axis-keyword-details--case");
    keywords.append(createEl("summary", "", "검증 키워드"));
    keywords.append(renderElementBadges(historicalCase.verificationKeywords, "axis-keyword-badge", "확인 키워드 없음"));
    item.append(keywords);
  }
  return item;
}

function renderLabeledList(title, items, badgeClass, emptyText) {
  const wrap = createEl("div", "axis-comparison-column");
  wrap.append(createEl("strong", "", title));
  wrap.append(renderElementBadges(items, badgeClass, emptyText));
  return wrap;
}

export function renderAiResult(result, aiState = {}) {
  const response = result?.aiResponse || aiState.response || null;
  const compact = result?.compactInterpretation || buildCompactInterpretationView(result?.interpretation || {});
  const panel = createEl("div", `ai-result-panel ai-result-panel--${response ? getAiResultStatus(response) : aiState.status || "idle"}`);
  if (!response) {
    if (result?.editorialBrief && aiState.status === "brief-ready") {
      panel.append(renderManualChatGptPanel(result));
      return panel;
    }
    const status = createEl("div", "ai-result-status");
    status.append(createEl("span", `ai-status-badge ai-status-badge--${getAiBadgeTone(response, aiState)}`, getAiBadgeLabel(response, aiState)));
    panel.append(status);
    panel.append(
      createEl(
        "p",
        "help-text",
        aiState.status === "loading"
          ? "모델이 선택한 요소 사이의 중간 논리를 찾는 중입니다."
          : "조건을 적고 요청을 만들어보세요.",
      ),
    );
    return panel;
  }
  if (response.interpretationMode === "axis-finder") return renderAxisFinderResult(result, response);

  const status = createEl("div", "ai-result-status");
  const badge = createEl("span", `ai-status-badge ai-status-badge--${getAiBadgeTone(response, aiState)}`, getAiBadgeLabel(response, aiState));
  status.append(badge);
  if (aiState?.error) status.append(createEl("span", "ai-error-note", "API 요청 실패로 내부 fallback을 표시합니다."));
  panel.append(status);

  const headline = createEl("section", "ai-headline");
  headline.append(createEl("h3", "", "역사적 유사성"));
  headline.append(createEl("p", "", getAiResultHeadline(response)));
  panel.append(headline);

  if (response.settingDraft) {
    const draft = createEl("section", "ai-setting-draft");
    draft.append(createEl("h3", "", "세계사 렌즈로 읽기"), renderTextParagraphs(response.settingDraft, "ai-setting-draft-body"));
    panel.append(draft);
  }

  const extra = createEl("details", "ai-extra-details");
  extra.append(createEl("summary", "", "비교 논리, 질문, 입력 구분 보기"));

  const reading = createEl("section", "ai-connection-reading");
  reading.classList.add("ai-main-reading");
  reading.append(createEl("h3", "", "무엇이 닮았고 무엇이 다른가"));
  reading.append(createEl("p", "", response.connectionReading || "이 조건과 닮은 역사적 제도 논리, 생활상, 문화 표현을 더 탐색할 수 있습니다."));
  extra.append(reading);

  const contradiction = createEl("section", "ai-central-contradiction");
  contradiction.append(createEl("h3", "", "반복되는 긴장"));
  contradiction.append(createEl("p", "ai-contradiction-statement", response.centralContradiction?.statement || "반복되는 긴장을 더 정할 수 있습니다."));
  if (response.centralContradiction?.explanation) contradiction.append(createEl("p", "", response.centralContradiction.explanation));
  extra.append(contradiction);

  const questions = createEl("section", "ai-questions");
  questions.append(createEl("h3", "", "더 정해야 할 질문"));
  const questionList = document.createElement("ol");
    const questionItems = response.questions?.length ? response.questions.slice(0, 3) : ["이 조건과 역사 장면을 비교할 때 가장 조심해야 할 차이는 무엇인가?"];
  for (const question of questionItems) questionList.append(createEl("li", "", question));
  questions.append(questionList);
  extra.append(questions);

  if (response.alternativeReadings?.length) {
    const alternatives = createEl("section", "ai-alternative-readings");
    alternatives.append(createEl("h3", "", "다른 역사 렌즈"));
    const list = document.createElement("ul");
    for (const item of response.alternativeReadings.slice(0, 1)) list.append(createEl("li", "", item));
    alternatives.append(list);
    extra.append(alternatives);
  }

  extra.append(
    createEl(
      "p",
      "ai-provenance-note",
      "사용자가 입력한 요소는 그대로 유지했습니다. 새롭게 추가된 연결과 조건은 가능한 비교 가설이며, 확정된 역사 설명이 아닙니다.",
    ),
    renderAiProvenance(response),
  );
  panel.append(extra);

  const toggle = createEl("button", "structure-info-toggle", getStructureInfoToggleLabel(getStructureInfoExpandedState(state.ui)));
  toggle.type = "button";
  toggle.dataset.action = "toggle-structure-info";
  toggle.setAttribute("aria-controls", "structure-info-panel");
  toggle.setAttribute("aria-expanded", getStructureInfoToggleAriaExpanded(getStructureInfoExpandedState(state.ui)));
  panel.append(toggle);

  if (result?.interpretation) panel.append(renderStructureInfo(result, compact));

  return panel;
}

export function renderInterpretation(result) {
  return renderAiResult(result, state.aiState);
}

function renderList(title, items, className, emptyText) {
  const wrap = createEl("div", `result-list ${className}`);
  wrap.append(createEl("h3", "", title));
  const list = document.createElement("ul");
  const content = items.length > 0 ? items : [emptyText];
  for (const item of content) list.append(createEl("li", "", toDisplayText(item)));
  wrap.append(list);
  return wrap;
}

export function renderSelectionSummary(selection) {
  const summaryData = buildSelectionSummaryData(selection);
  const wrap = createEl("div", "selection-summary");
  const groupLabels = { core: "조건", detail: "구조", amplifier: "작동과 결과" };
  for (const group of ["core", "detail", "amplifier"]) {
    if (summaryData[group].length === 0) continue;
    const groupWrap = createEl("div", "summary-group");
    groupWrap.append(createEl("h3", "", groupLabels[group]));
    const dl = createEl("dl", "summary-items");
    for (const item of summaryData[group]) {
      const row = createEl("div", "summary-item");
      row.append(createEl("dt", "", item.title), createEl("dd", "", item.label));
      dl.append(row);
    }
    groupWrap.append(dl);
    wrap.append(groupWrap);
  }
  return wrap;
}

export async function copyTextToClipboard(text) {
  if (!text) return { ok: false, message: "복사할 내용이 없습니다." };
  try {
    if (!navigator?.clipboard?.writeText) throw new Error("clipboard_unavailable");
    await navigator.clipboard.writeText(text);
    return { ok: true, message: "복사했습니다. 사용 중인 AI 채팅창에 붙여 넣어주세요." };
  } catch {
    return { ok: false, message: "자동 복사가 차단되었습니다. 아래 내용을 직접 복사해주세요." };
  }
}

export async function handleCopyPrompt() {
  if (!state.result) return;
  const text = state.result.fullChatGptPrompt;
  const outcome = await copyTextToClipboard(text);
  state.manualChatGpt = { ...state.manualChatGpt, copyStatus: outcome.message };
  renderApp();
  if (!outcome.ok) {
    const fallback = document.querySelector("[data-role='manual-copy-fallback']");
    if (fallback) {
      fallback.hidden = false;
      fallback.value = text;
      fallback.focus();
      fallback.select();
    }
  }
}

export async function handleCopyAxisDetailPrompt(axisId) {
  const axis = state.result?.aiResponse?.axes?.find((item) => item.id === axisId);
  if (!axis || !state.result?.editorialBrief) return;
  const text = buildAxisDetailPrompt({ editorialBrief: state.result.editorialBrief, axis });
  const outcome = await copyTextToClipboard(text);
  state.manualChatGpt = { ...state.manualChatGpt, selectedAxisId: axis.id };
  state.axisDetail = {
    selectedAxisId: axis.id,
    copyStatus: outcome.ok
      ? "선택한 쟁점의 2차 학습 프롬프트를 복사했습니다. 사용 중인 AI 채팅에 붙여 넣어 이어서 읽어주세요."
      : outcome.message,
    promptCopied: outcome.ok,
  };
  renderApp();
  if (!outcome.ok) {
    const fallback =
      document.querySelector("[data-role='axis-detail-copy-fallback']") ||
      document.querySelector("[data-role='manual-copy-fallback']");
    if (fallback) {
      fallback.hidden = false;
      fallback.value = text;
      fallback.focus();
      fallback.select();
    }
  }
}

export async function handleCopyAxisKeywords(axisId) {
  const axis = state.result?.aiResponse?.axes?.find((item) => item.id === axisId);
  if (!axis) return;
  const text = buildVerificationKeywordCopyText(axis);
  const outcome = await copyTextToClipboard(text);
  state.manualChatGpt = { ...state.manualChatGpt, selectedAxisId: axis.id, copyStatus: outcome.message };
  renderApp();
  if (!outcome.ok) {
    const fallback = document.querySelector("[data-role='manual-copy-fallback']");
    if (fallback) {
      fallback.hidden = false;
      fallback.value = text;
      fallback.focus();
      fallback.select();
    }
  }
}

export async function handleCopyAxisFinderRetryPrompt() {
  const outcome = await copyTextToClipboard(AXIS_FINDER_RETRY_PROMPT);
  state.manualChatGpt = { ...state.manualChatGpt, copyStatus: outcome.message };
  renderApp();
  if (!outcome.ok) {
    const fallback = document.querySelector("[data-role='manual-copy-fallback']");
    if (fallback) {
      fallback.hidden = false;
      fallback.value = AXIS_FINDER_RETRY_PROMPT;
      fallback.focus();
      fallback.select();
    }
  }
}

export function selectAxis(axisId) {
  state.manualChatGpt = { ...state.manualChatGpt, selectedAxisId: axisId };
  state.axisDetail = { ...createInitialAxisDetailState(), selectedAxisId: axisId };
  renderApp();
}

export function cancelAxisDetailSelection() {
  state.manualChatGpt = { ...state.manualChatGpt, selectedAxisId: "" };
  state.axisDetail = createInitialAxisDetailState();
  renderApp();
}

export function applyManualAiResponse(text = state.manualChatGpt.responseText) {
  const parsed = parsePastedAiResponse(text);
  if (!parsed.ok) {
    state.manualChatGpt = { ...state.manualChatGpt, error: parsed.message };
    renderApp();
    return parsed;
  }
  state.result = {
    ...state.result,
    aiResponse: parsed.value,
    aiStatus: getAiResultStatus(parsed.value),
  };
  state.aiState = {
    status: "success",
    source: "manual-chatgpt",
    input: state.result.aiInput,
    response: parsed.value,
    error: null,
    isMock: false,
    isStale: false,
  };
  state.manualChatGpt = {
    ...state.manualChatGpt,
    error: "",
    selectedAxisId: "",
  };
  state.axisDetail = createInitialAxisDetailState();
  state.isResultStale = false;
  renderApp();
  return parsed;
}

export async function handleEvaluate() {
  const hasAnyInput = countCompletedInputs(state.formState) > 0;
  state.validation = getInputValidation(state.formState);
  if (!hasAnyInput) {
    state.result = null;
    state.ui = { ...state.ui, structureInfoExpanded: false };
    state.aiState = resetAiState();
    state.isResultStale = false;
    renderApp();
    const panel = document.querySelector(".result-panel");
    panel?.append(createEl("p", "message message--warning", "먼저 하나 이상의 항목을 작성해주세요."));
    return;
  }
  state.result = createEvaluationResult(state.formState);
  state.ui = { ...state.ui, structureInfoExpanded: false };
  state.manualChatGpt = { responseText: "", copyStatus: "", error: "", selectedAxisId: "" };
  state.axisDetail = createInitialAxisDetailState();
  const promptMode = typeof window === "undefined" ? "manual" : getPromptMode({ search: window.location.search });
  state.aiState = {
    ...createAiStateFromResult(state.result),
    status: promptMode === "manual" ? "brief-ready" : "loading",
    source: promptMode === "manual" ? "manual-chatgpt" : promptMode,
  };
  state.isResultStale = false;
  renderApp();
  if (promptMode === "manual") return;
  try {
    const useMock = promptMode === "mock";
    const aiResponse = await requestAiInterpretation(state.result.aiInput, { useMock });
    state.result = {
      ...state.result,
      aiResponse,
      aiStatus: getAiResultStatus(aiResponse),
    };
    state.aiState = {
      status: aiResponse.status === "incomplete" ? "success" : getAiResultStatus(aiResponse),
      input: state.result.aiInput,
      response: aiResponse,
      error: null,
      source: useMock ? "mock" : "api",
      isMock: useMock,
      isStale: false,
    };
  } catch (error) {
    state.result = createFallbackResult(state.result, error);
    state.aiState = {
      status: "fallback",
      input: state.result.aiInput,
      response: state.result.aiResponse,
      error: state.result.aiError,
      source: "fallback",
      isMock: false,
      isStale: false,
    };
  }
  renderApp();
}

export function handleReset() {
  state.formState = createInitialFormState();
  state.collapsed = { scope: true, detail: true, amplifier: true };
  state.ui = { ...state.ui, structureInfoExpanded: false };
  state.aiState = resetAiState();
  state.manualChatGpt = { responseText: "", copyStatus: "", error: "", selectedAxisId: "" };
  state.axisDetail = createInitialAxisDetailState();
  state.result = null;
  state.validation = null;
  state.isResultStale = false;
  renderApp();
}

export function markResultStale() {
  if (state.result) {
    state.isResultStale = true;
    state.aiState = markAiStateStale(state.aiState);
    state.manualChatGpt = { ...state.manualChatGpt, selectedAxisId: "" };
    state.axisDetail = createInitialAxisDetailState();
  }
}

function isCategoryComplete(key) {
  const item = getCategoryState(key);
  if (item.mode === "custom") return normalizeText(item.customText) !== "";
  return getSelectedOptionIds(state.formState, key).length > 0;
}

function findCategory(key) {
  return CATEGORY_META.find((category) => category.key === key);
}

function findCard(key) {
  return appRoot?.querySelector(`[data-card-key="${key}"]`) || null;
}

function replaceInputCard(key) {
  const category = findCategory(key);
  const card = findCard(key);
  if (!category || !card) return;
  card.replaceWith(renderInputCard(category));
}

export function updatePresetDescription(categoryKey) {
  const card = findCard(categoryKey);
  const description = card?.querySelector("[data-role='option-description']");
  if (!description) return;
  const options = getCategoryOptions(categoryKey);
  const selectedOptions = getSelectedOptionIds(state.formState, categoryKey)
    .map((optionId) => options.find((option) => option.id === optionId))
    .filter(Boolean);
  const text = getPresetDescriptionText(categoryKey, selectedOptions);
  description.textContent = text;
  description.hidden = !text;
}

export function updateCustomTagPreview(categoryKey) {
  const card = findCard(categoryKey);
  const preview = card?.querySelector("[data-role='tag-preview']");
  if (!preview) return;
  preview.replaceWith(renderTagPreview(categoryKey, getCategoryState(categoryKey).customText));
}

export function updateStaleNotice() {
  const panel = document.querySelector(".manual-chatgpt-panel");
  if (!panel || !state.result) return;
  const existing = panel.querySelector(".stale-ai-notice");
  if (!state.isResultStale) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const notice = createEl("p", "stale-ai-notice", "입력 내용이 변경되었습니다. 다시 요청하면 최신 내용이 반영됩니다.");
  panel.prepend(notice);
}


export function updateStructureInfoToggleState() {
  const isExpanded = getStructureInfoExpandedState(state.ui);
  const button = appRoot?.querySelector("[data-action='toggle-structure-info']");
  const panel = document.getElementById("structure-info-panel");
  if (button) {
    button.textContent = getStructureInfoToggleLabel(isExpanded);
    button.setAttribute("aria-expanded", getStructureInfoToggleAriaExpanded(isExpanded));
  }
  if (panel) panel.hidden = !isExpanded;
}

export function toggleStructureInfo() {
  state.ui = { ...state.ui, structureInfoExpanded: toggleBooleanState(state.ui.structureInfoExpanded) };
  updateStructureInfoToggleState();
}

export const updateResultDetailsToggleState = updateStructureInfoToggleState;
export const toggleResultDetails = toggleStructureInfo;

function handleRootEvent(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action, key, field, mode, group, templateId } = target.dataset;
  if (event.type === "click" && !shouldHandleAction(target, action)) return;
  if (event.type === "click" && action === "update-field") return;
  if (event.type === "change" && action !== "update-field") return;
  if (action === "set-mode") {
    if (!findCategory(key) || !["preset", "custom"].includes(mode)) return;
    state.formState = setInputMode(state.formState, key, mode);
    markResultStale();
    replaceInputCard(key);
    updateStaleNotice();
    return;
  }
  if (action === "toggle-section") {
    state.collapsed = { ...state.collapsed, [group]: !state.collapsed[group] };
    renderApp();
    return;
  }
  if (action === "remove-preset-option") {
    const optionId = target.dataset.optionId || "";
    if (!findCategory(key) || !optionId) return;
    state.formState = removePresetOptionFromFormState(state.formState, key, optionId);
    markResultStale();
    replaceInputCard(key);
    updateStaleNotice();
    return;
  }
  if (action === "apply-start-template") {
    state.formState = applyStarterTemplateToFormState(state.formState, templateId);
    state.collapsed = { ...state.collapsed, scope: true, detail: false, amplifier: false };
    markResultStale();
    renderApp();
    return;
  }
  if (action === "toggle-structure-info" || action === "toggle-result-details") {
    toggleStructureInfo();
    return;
  }
  if (action === "copy-full-prompt") {
    void handleCopyPrompt();
    return;
  }
  if (action === "copy-axis-detail-prompt") {
    void handleCopyAxisDetailPrompt(target.dataset.axisId);
    return;
  }
  if (action === "copy-axis-keywords") {
    void handleCopyAxisKeywords(target.dataset.axisId);
    return;
  }
  if (action === "copy-axis-finder-retry") {
    void handleCopyAxisFinderRetryPrompt();
    return;
  }
  if (action === "cancel-axis-detail") {
    cancelAxisDetailSelection();
    return;
  }
  if (action === "apply-manual-ai-response") {
    applyManualAiResponse();
    return;
  }
  if (action === "evaluate") {
    handleEvaluate();
    return;
  }
  if (action === "reset") {
    handleReset();
    return;
  }
  if (action === "update-field") {
    if (target.tagName !== "SELECT" || field !== "optionId" || !findCategory(key)) return;
    state.formState = target.value
      ? addPresetOptionToFormState(state.formState, key, target.value)
      : updateFormField(state.formState, key, field, "");
    markResultStale();
    replaceInputCard(key);
    updateStaleNotice();
  }
}

function handleInputEvent(event) {
  const target = event.target.closest("[data-action='update-field']");
  const manualTarget = event.target.closest("[data-action='update-manual-response']");
  if (manualTarget) {
    state.manualChatGpt = { ...state.manualChatGpt, responseText: manualTarget.value, error: "" };
    return;
  }
  if (!target) return;
  const { key, field } = target.dataset;
  if (target.tagName !== "TEXTAREA" || field !== "customText" || !findCategory(key)) return;
  state.formState = updateFormField(state.formState, key, field, target.value);
  markResultStale();
  updateCustomTagPreview(key);
  updateStaleNotice();
}

if (typeof document !== "undefined") {
  appRoot = document.querySelector("#app-root");
  if (appRoot) {
    appRoot.addEventListener("click", handleRootEvent);
    appRoot.addEventListener("change", handleRootEvent);
    appRoot.addEventListener("input", handleInputEvent);
    renderApp();
  }
}
