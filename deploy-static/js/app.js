import "./engine.js";
import {
  buildAiInput,
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
    title: "어떤 사회문제가 커졌는가?",
    description: "미친 소리의 압력이 시작되는 구조적 문제를 고릅니다.",
    placeholder: "예: 인간 노동의 가치가 급격히 하락한다",
  },
  {
    key: "target",
    group: "core",
    number: 2,
    title: "누가 그 변화의 대상이 되는가?",
    description: "제도 변화가 직접 향하는 사람이나 집단을 정합니다.",
    placeholder: "예: 일자리를 잃은 중년층",
  },
  {
    key: "technology",
    group: "core",
    number: 3,
    title: "무엇이 그것을 가능하게 하는가?",
    description: "정책을 가능하게 만드는 기술이나 환경을 고릅니다.",
    placeholder: "예: 감정과 생산성을 예측하는 인공지능",
  },
  {
    key: "transformation",
    group: "core",
    number: 4,
    title: "어떤 권리·제도가 바뀌는가?",
    description: "핵심 미친 소리를 만드는 제도적 전환을 씁니다.",
    placeholder: "예: 인간 상담 접근권을 월 구독제로 전환한다",
  },
  {
    key: "ideology",
    group: "core",
    number: 5,
    title: "사회는 무엇을 명분으로 내세우는가?",
    description: "제도가 스스로를 정당화하는 언어를 정합니다.",
    placeholder: "예: 효율과 선택권을 확대하기 위해",
  },
  {
    key: "actor",
    group: "detail",
    number: 6,
    title: "누가 이 제도를 운영하는가?",
    description: "정책을 실제로 집행하는 기관이나 주체입니다.",
    placeholder: "예: 보험회사와 지방정부가 공동 운영한다",
  },
  {
    key: "mechanism",
    group: "detail",
    number: 7,
    title: "실제로 어떻게 작동하는가?",
    description: "차등, 배정, 갱신 같은 실행 방식을 정합니다.",
    placeholder: "예: 알고리즘이 거주권을 자동 배정한다",
  },
  {
    key: "metric",
    group: "detail",
    number: 8,
    title: "무엇으로 사람을 측정하는가?",
    description: "제도의 판단 기준이 되는 수치나 지표입니다.",
    placeholder: "예: 생애 예상 세금 기여도",
  },
  {
    key: "benefit",
    group: "detail",
    number: 9,
    title: "어떤 혜택을 약속하는가?",
    description: "제도가 내세우는 공식 효용을 정합니다.",
    placeholder: "예: 의료비와 주거 비용을 줄인다",
  },
  {
    key: "careNarrative",
    group: "detail",
    number: 10,
    title: "어떤 돌봄의 언어로 포장되는가?",
    description: "통제가 보호처럼 보이게 만드는 말을 고릅니다.",
    placeholder: "예: 개인별 맞춤환경을 제공한다",
  },
  {
    key: "classDistortion",
    group: "amplifier",
    number: 11,
    title: "계층에 따라 결과가 어떻게 달라지는가?",
    description: "누가 비용을 지고 누가 빠져나가는지 봅니다.",
    placeholder: "예: 부유층은 면제권을 구매한다",
  },
  {
    key: "feedbackLoop",
    group: "amplifier",
    number: 12,
    title: "어떤 악순환이 스스로 강화되는가?",
    description: "제도가 문제를 더 키우는 반복 구조입니다.",
    placeholder: "예: 낮은 점수가 기회를 줄여 점수를 더 낮춘다",
  },
  {
    key: "victimInternalization",
    group: "amplifier",
    number: 13,
    title: "당사자는 어떤 불이익을 자신의 책임으로 받아들이게 되는가?",
    description: "제도의 불이익이 자기계발이나 의무처럼 포장되는 지점입니다.",
    placeholder: "예: 감시받는 상태를 안전하다는 증거로 여긴다",
  },
  {
    key: "irreversibility",
    group: "amplifier",
    number: 14,
    title: "무엇이 되돌릴 수 없게 되는가?",
    description: "한 번 진입하면 복구하기 어려운 조건을 정합니다.",
    placeholder: "예: 삭제된 기억은 복구할 수 없다",
  },
];

const GROUPS = {
  core: {
    title: "핵심 구조",
    kicker: "1단계",
    description: "먼저 이 다섯 가지를 채우면 미친 소리의 중심 뼈대가 생깁니다.",
  },
  detail: {
    title: "구체화",
    kicker: "2단계 · 선택",
    description: "핵심 구조가 잡힌 뒤 제도를 더 구체적으로 만들고 싶을 때 작성하세요.",
  },
  amplifier: {
    title: "미친소리 증폭",
    kicker: "3단계 · 선택",
    description: "1~2개만 선택해도 충분합니다. 너무 많이 넣으면 중심 모순이 흐려질 수 있습니다.",
  },
};

const state = {
  formState: createInitialFormState(),
  collapsed: { detail: true, amplifier: true },
  ui: { exampleExpanded: false, structureInfoExpanded: false },
  aiState: createInitialAiState(),
  manualChatGpt: { responseText: "", copyStatus: "", error: "", selectedAxisId: "" },
  axisDetail: createInitialAxisDetailState(),
  result: null,
  validation: null,
  isResultStale: false,
};

let appRoot = null;

function optionSourceLabel(source) {
  return source === "custom" ? "직접 입력" : "기존 선택지";
}

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
      { mode: "preset", optionId: "", customText: "", metadata: {} },
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
    responseText: "",
    error: "",
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
    return typeof item.optionId === "string" && item.optionId !== "";
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
  const aiInput = buildAiInput({
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

export function getSelectedOptionId(formState, key) {
  const optionId = formState?.[key]?.optionId;
  return typeof optionId === "string" ? optionId : "";
}

export function shouldHandleAction(element, action) {
  if (!element || element.dataset?.action !== action) return false;
  if (action === "update-field") return ["SELECT", "TEXTAREA"].includes(element.tagName);
  return element.tagName === "BUTTON";
}

export function getExampleExpandedState(uiState = {}) {
  return Boolean(uiState.exampleExpanded);
}

export function toggleBooleanState(value) {
  return !Boolean(value);
}

export function getExampleToggleLabel(isExpanded) {
  return isExpanded ? "예시 접기" : "예시 전체 보기";
}

export function getExampleToggleAriaExpanded(isExpanded) {
  return String(Boolean(isExpanded));
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
        title: "핵심 구조",
        subtitle: "먼저 미래사회의 중심 방향을 만든다.",
        items: [
          ["사회문제", "무엇이 악화되거나 부족해졌는가"],
          ["대상", "누가 제도의 직접 대상이 되는가"],
          ["기술", "무엇이 그 제도를 가능하게 하는가"],
          ["권리·제도 변화", "기존 권리가 어떤 조건이나 상품으로 바뀌는가"],
          ["정당화 이념", "사회는 무엇을 명분으로 내세우는가"],
        ].map(([label, description]) => ({ label, description })),
      },
      {
        number: "②",
        tone: "detail",
        headingId: "formula-detail-heading",
        title: "구체화",
        subtitle: "이 제도가 실제로 어떻게 운영되는지 설계한다.",
        items: [
          ["운영자", "누가 제도를 집행하는가"],
          ["운영 방식", "절차와 배정은 어떻게 이루어지는가"],
          ["측정 기준", "무엇으로 사람과 상황을 평가하는가"],
          ["보상", "어떤 혜택을 약속하는가"],
          ["돌봄 언어", "통제를 어떤 보호의 말로 포장하는가"],
        ].map(([label, description]) => ({ label, description })),
      },
      {
        number: "③",
        tone: "amplifier",
        headingId: "formula-amplifier-heading",
        title: "미친소리 증폭",
        subtitle: "모순을 더욱 선명하게 만든다.",
        items: [
          ["계층 왜곡", "누가 예외를 사고 누가 비용을 떠안는가"],
          ["악순환", "제도가 문제를 어떻게 다시 키우는가"],
          ["제도 논리의 자기내면화", "당사자는 어떤 불이익을 자신의 책임으로 받아들이게 되는가"],
          ["비가역성", "무엇이 되돌릴 수 없게 되는가"],
        ].map(([label, description]) => ({ label, description })),
      },
    ],
    {
      headingId: "formula-result-heading",
      title: "미래사회 미친소리 설정",
      description: "말이 되기 때문에 더 불편한 하나의 사회가 만들어집니다.",
    },
    "계산기의 3단계 사고 공식",
  );
}

function renderExampleCollapsedSummary() {
  const summary = createEl("div", "example-collapsed-summary");
  summary.append(
    createEl(
      "p",
      "",
      "고령화 문제를 해결한다는 명분 아래, 노인의 지구 거주권을 제한하는 미래사회를 단계별로 뜯어봅니다.",
    ),
    createEl(
      "p",
      "help-text",
      "아래 내용은 권장 답안이 아니라 서로 다른 요소가 하나의 중심 모순으로 이어지는 과정을 보여주는 예시입니다.",
    ),
  );
  return summary;
}

function renderTutorialChoice(choice) {
  const item = createEl("div", "tutorial-choice");
  item.append(createEl("div", "tutorial-choice-label", choice.label));
  item.append(createEl("div", "tutorial-choice-value", choice.value));
  item.append(createEl("div", "tutorial-choice-reason", choice.reason));
  return item;
}

function renderTutorialStep(step) {
  const section = createEl("section", `tutorial-step tutorial-step--${step.tone}`);
  section.append(createEl("p", "section-kicker", step.kicker));
  section.append(createEl("h4", "", step.title));
  section.append(createEl("p", "tutorial-step-description", step.description));

  const choices = createEl("div", "tutorial-choice-list");
  for (const choice of step.choices) choices.append(renderTutorialChoice(choice));
  section.append(choices);

  const output = createEl("div", "tutorial-step-output");
  output.append(createEl("strong", "", "이 단계에서 만들어진 것"), createEl("p", "", step.output));
  section.append(output);
  return section;
}

function renderExampleDetails() {
  const details = createEl("div", "example-details example-tutorial");
  details.id = "example-details";
  details.hidden = !state.ui.exampleExpanded;

  const steps = [
    {
      kicker: "STEP 1",
      tone: "core",
      title: "핵심 구조",
      description: "먼저 사회문제와 대상을 정하고, 기술·제도 변화·정당화 이념을 연결합니다.",
      choices: [
        {
          label: "사회문제",
          value: "초고령화와 지구 내 거주 가능 공간의 부족",
          reason: "특정 집단을 문제로 삼는 대신, 그들을 문제로 분류하는 제도에서 출발합니다.",
        },
        {
          label: "대상",
          value: "일정 연령에 이른 시민",
          reason: "특정 개인이 아니라 행정적으로 분류 가능한 대상을 정해야 제도가 작동합니다.",
        },
        {
          label: "기술",
          value: "대규모 우주 거주지와 자동 이송 시스템",
          reason: "현실에서는 실행할 수 없는 제도를 가능하게 만드는 기술 조건을 둡니다.",
        },
        {
          label: "권리·제도 변화",
          value: "지구 거주권을 연령과 사회적 기여도에 따라 재배분",
          reason: "핵심은 이주가 아니라 기본권이 조건부 자원으로 바뀌는 데 있습니다.",
        },
        {
          label: "정당화 이념",
          value: "세대 간 공정성과 생존 자원의 효율적 배분",
          reason: "제도는 악의를 드러내기보다 공익과 복지의 언어로 자신을 정당화할 때 더 미친 소리답습니다.",
        },
      ],
      output: "고령 시민을 보호하고 미래 세대의 생존을 보장한다는 명분 아래, 나이를 기준으로 시민의 지구 거주권을 차등 배분한다.",
    },
    {
      kicker: "STEP 2",
      tone: "detail",
      title: "구체화",
      description: "1단계의 모순이 실제 사회 제도처럼 작동하도록 운영 구조를 만듭니다.",
      choices: [
        {
          label: "운영자",
          value: "행성 거주자 관리청과 민간 우주복지 기업",
          reason: "국가기관과 민간기업이 함께 운영하면 공공정책과 시장 논리가 동시에 작동합니다.",
        },
        {
          label: "운영 방식",
          value: "나이, 의료비, 노동 기여도, 가족 부양 부담을 종합해 지구 잔류 점수를 계산",
          reason: "추상적인 차별이 실제 행정 절차와 계산 방식으로 바뀌는 단계입니다.",
        },
        {
          label: "측정 기준",
          value: "예상 잔여수명, 의료자원 소비량, 경제적 기여도, 가족의 돌봄 가능성",
          reason: "사람의 삶을 숫자로 환산하는 순간 제도의 비인간성이 드러납니다.",
        },
        {
          label: "보상",
          value: "무상 우주 이주, 평생 의료, 인공지능 돌봄, 가족 영상통화",
          reason: "강제적 제도를 혜택과 복지처럼 보이게 만드는 장치입니다.",
        },
        {
          label: "돌봄 언어",
          value: "새로운 삶의 선택, 미래 세대에게 지구를 돌려주는 결정",
          reason: "배제와 강제를 선택·존엄·배려의 언어로 포장하는 방식을 살펴봅니다.",
        },
      ],
      output: "나이와 비용을 계산해 지구 잔류 자격을 정하고, 거주지 강제 배정을 복지 혜택처럼 운영하는 제도.",
    },
    {
      kicker: "STEP 3",
      tone: "amplifier",
      title: "미친소리 증폭",
      description: "제도의 모순이 계층과 시간 속에서 더 날카롭게 드러나도록 만듭니다.",
      choices: [
        {
          label: "계층 왜곡",
          value: "부유층은 기여도 점수나 민간 지구 거주권을 구매",
          reason: "같은 제도라도 계층에 따라 다르게 적용되면 공정성이라는 명분이 무너집니다.",
        },
        {
          label: "악순환",
          value: "우주 이주자가 늘수록 지구의 노인 지원 시설이 줄어듦",
          reason: "제도가 문제를 해결하는 대신 스스로 문제를 더 키우게 만듭니다.",
        },
        {
          label: "제도 논리의 자기내면화",
          value: "거주지 강제 배정을 스스로 신청하는 것이 성숙한 시민성으로 포장됨",
          reason: "제도의 영향을 받는 사람이 불이익을 자신의 선택과 책임으로 받아들이게 합니다.",
        },
        {
          label: "비가역성",
          value: "지구 거주권을 반납하면 돌아올 수 없음",
          reason: "결과를 되돌릴 수 없게 만들면 미친 소리의 불편함이 강해집니다.",
        },
      ],
      output: "시민의 접근권을 차등화하고, 그 결과를 계층 격차와 자기책임의 윤리로 정당화하는 제도.",
    },
  ];

  for (const step of steps) {
    details.append(renderTutorialStep(step));
  }

  const finalResult = createEl("section", "tutorial-final-result");
  finalResult.append(
    createEl("h4", "", "완성된 미래사회 미친소리 설정"),
    createEl(
      "p",
      "",
      "지구의 거주 가능 지역이 줄어든 미래, 정부는 세대 간 공정성과 사회 전체의 생존 효율을 명분으로 고령 시민의 지구 거주권을 연령과 사회적 기여도에 따라 재배분한다. 일정 연령에 이른 시민은 복지형 우주 거주지로 이전하도록 권고받지만, 실제로는 지구 공동체 접근권이 조건부로 바뀌는 제도로 작동한다.",
    ),
  );
  const summary = createEl("div", "tutorial-final-summary");
  [
    ["표면의 선의", "노년 복지, 세대 간 공정성, 생존 자원의 효율적 배분"],
    ["실제 제도", "나이와 비용을 기준으로 기본권과 공동체 소속을 차등 배분"],
    ["미친소리의 핵심", "사회를 보호한다는 언어가 사람을 사회에서 제거하는 행정 절차로 변한다"],
  ].forEach(([label, text]) => {
    const row = createEl("div", "tutorial-choice");
    row.append(createEl("div", "tutorial-choice-label", label), createEl("div", "tutorial-choice-value", text));
    summary.append(row);
  });
  finalResult.append(summary);
  details.append(finalResult);

  return details;
}

export function renderOnboarding() {
  const panel = createEl("section", "onboarding-panel");
  panel.setAttribute("aria-labelledby", "onboarding-heading");

  const intro = createEl("div", "onboarding-intro");
  intro.append(createEl("p", "section-kicker", "사용 설명서"));
  const heading = createEl("h2", "", "이 계산기는 이런 순서로 생각합니다");
  heading.id = "onboarding-heading";
  intro.append(
    heading,
    createEl("p", "help-text", "항목을 무작위로 섞는 것이 아니라, 사용자가 만든 요소 사이의 연결과 모순을 점검합니다."),
  );
  panel.append(intro, renderFormulaFlow());

  const example = createEl("section", "example-panel");
  example.setAttribute("aria-labelledby", "example-heading");
  const exampleHeader = createEl("div", "example-header");
  const titleWrap = createEl("div");
  titleWrap.append(createEl("p", "section-kicker", "예시로 이해하기"));
  const exampleHeading = createEl("h3", "", "우주 고려장");
  exampleHeading.id = "example-heading";
  titleWrap.append(
    exampleHeading,
    createEl("p", "help-text", "고령화 문제를 해결한다는 명분 아래, 노인의 지구 거주권을 제한하는 미래사회를 단계별로 뜯어봅니다."),
  );
  const toggle = createEl("button", "example-toggle", getExampleToggleLabel(state.ui.exampleExpanded));
  toggle.type = "button";
  toggle.dataset.action = "toggle-example";
  toggle.setAttribute("aria-controls", "example-details");
  toggle.setAttribute("aria-expanded", getExampleToggleAriaExpanded(state.ui.exampleExpanded));
  exampleHeader.append(titleWrap, toggle);

  example.append(exampleHeader, renderExampleCollapsedSummary(), renderExampleDetails());
  panel.append(example);

  const transition = createEl("div", "transition-to-form");
  transition.append(
    createEl("p", "", "이제 아래에서 자신의 설정을 직접 구성해보세요."),
    createEl("p", "help-text", "예시와 다르게 만들어도 됩니다. 계산기는 특정 결론을 요구하지 않습니다."),
  );
  panel.append(transition);

  return panel;
}

export function renderSection(group) {
  const meta = GROUPS[group];
  const section = createEl("section", `section-panel section-panel--${group}`);
  if (group !== "core") section.classList.add("section-panel--optional");
  section.setAttribute("aria-labelledby", `${group}-heading`);

  const header = createEl("div", "section-header");
  const titleWrap = createEl("div");
  titleWrap.append(createEl("p", "section-kicker", meta.kicker));
  const heading = createEl("h2", "", meta.title);
  heading.id = `${group}-heading`;
  titleWrap.append(heading, createEl("p", "section-description", meta.description));

  const keys = byGroup(group).map((item) => item.key);
  const progress = createEl("div", "section-progress");
  progress.dataset.progressGroup = group;
  progress.textContent = updateProgress(group);

  header.append(titleWrap, progress);
  if (group !== "core") {
    const toggle = createEl("button", "section-toggle", state.collapsed[group] ? "열기" : "접기");
    toggle.type = "button";
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
  const isMissing =
    state.validation &&
    category.group === "core" &&
    state.validation.missingCore.includes(category.key);
  const card = createEl("article", `input-card${isMissing ? " input-card--missing" : ""}`);
  card.dataset.cardKey = category.key;
  if (category.key === "transformation") card.classList.add("input-card--wide");

  const heading = createEl("div", "card-heading");
  heading.append(createEl("span", "card-number", String(category.number)));
  const headingText = createEl("div");
  headingText.append(createEl("h3", "", category.title));
  const desc = createEl("p", "card-description", category.description);
  desc.id = `${category.key}-description`;
  headingText.append(desc);
  heading.append(headingText);

  const mode = createEl("div", "mode-toggle", "");
  const presetButton = createEl("button", item.mode === "preset" ? "mode-toggle--active" : "", "기존 선택지");
  presetButton.type = "button";
  presetButton.dataset.action = "set-mode";
  presetButton.dataset.key = category.key;
  presetButton.dataset.mode = "preset";
  const customButton = createEl("button", item.mode === "custom" ? "mode-toggle--active" : "", "직접 입력");
  customButton.type = "button";
  customButton.dataset.action = "set-mode";
  customButton.dataset.key = category.key;
  customButton.dataset.mode = "custom";
  mode.append(presetButton, customButton);

  const presetField = createEl("div", "field-group");
  presetField.hidden = item.mode !== "preset";
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
  emptyOption.textContent = "선택하지 않음";
  select.append(emptyOption);
  for (const option of options) {
    const optionEl = document.createElement("option");
    optionEl.value = option.id;
    optionEl.textContent = option.label;
    optionEl.selected = item.optionId === option.id;
    select.append(optionEl);
  }
  select.value = getSelectedOptionId(state.formState, category.key);
  const selectedOption = options.find((option) => option.id === item.optionId);
  const optionDescription = createEl("p", "option-description", selectedOption?.description || "선택지를 고르면 설명이 표시됩니다.");
  optionDescription.dataset.role = "option-description";
  presetField.append(selectLabel, select, optionDescription);

  const customField = createEl("div", "field-group");
  customField.hidden = item.mode !== "custom";
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

  const status = createEl("div", "status-row");
  status.dataset.role = "card-status";
  const badge = createEl("span", `status-badge status-badge--${item.mode}`, item.mode === "custom" ? "직접 입력" : "기존 선택지");
  status.append(badge);
  if (isMissing) status.append(createEl("p", "message message--danger", "핵심 구조에 필요한 항목입니다."));

  card.append(heading, mode, presetField, customField, status);
  return card;
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
  if (normalizeText(text) && allTags.length === 0) {
    tags.append(createEl("p", "message message--info", "연결 태그를 찾지 못해 판단 신뢰도가 낮아질 수 있습니다."));
  } else {
    for (const tag of allTags.slice(0, 10)) tags.append(createEl("span", "tag-pill", tag));
  }
  wrap.append(help, tags);
  return wrap;
}

function renderActions() {
  const wrap = createEl("div", "action-row");
  const evaluate = createEl("button", "primary-button", "설정 해석하기");
  evaluate.textContent = "ChatGPT에 해석 요청 만들기";
  evaluate.type = "button";
  evaluate.dataset.action = "evaluate";
  const reset = createEl("button", "secondary-button", "입력 초기화");
  reset.type = "button";
  reset.dataset.action = "reset";
  wrap.append(
    createEl("p", "action-help", "선택한 요소를 평가하지 않고, 서로 연결될 수 있는 방식과 중심 모순을 살펴봅니다."),
    evaluate,
    reset,
  );
  return wrap;
}

function renderResultPanel() {
  const panel = createEl("section", "result-panel");
  panel.setAttribute("aria-labelledby", "result-heading");
  panel.setAttribute("aria-live", "polite");
  panel.append(createEl("h2", "", "AI 편집자 해석"));
  if (state.isResultStale && state.result) {
    panel.append(createEl("p", "stale-ai-notice", "입력 내용이 변경되었습니다. 다시 해석하면 최신 내용이 반영됩니다."));
  }
  if (!state.result) {
    panel.append(createEl("p", "help-text", "항목을 작성한 뒤 설정 해석을 요청해보세요."));
    if (state.validation) panel.append(renderValidation(state.validation));
    return panel;
  }
  panel.append(renderAiResult(state.result, state.aiState));
  return panel;
}

export function renderValidation(validation) {
  const wrap = createEl("div", "result-summary");
  if (!validation) return wrap;
  if (validation.missingCore.length > 0) {
    wrap.append(createEl("p", "message message--warning", `핵심 구조 미작성: ${validation.missingCore.join(", ")}`));
  }
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
  const groupLabels = { core: "핵심 구조", detail: "구체화", amplifier: "미친소리 증폭" };
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
    createEl("h3", "", "입력 누락"),
    createEl(
      "p",
      "",
      context.missingCoreCategories?.length
        ? context.missingCoreCategories.map((item) => item.label).join(", ")
        : "핵심 구조의 선택된 항목을 기준으로 해석했습니다.",
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
      "낯선 조합은 태그가 적게 겹칠 수 있지만, 설명을 통해 강한 미친소리로 발전할 수 있습니다.",
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
    overview.append(createEl("p", "", "작성된 핵심 구조가 아직 없습니다."));
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
  if (aiState?.status === "loading") return "해석 요청 중";
  if (aiState?.status === "ready") return "해석 대기";
  if (aiState?.status === "brief-ready") return "로컬 편집 브리프";
  if (aiState?.source === "manual-chatgpt-detail") return "ChatGPT 바텀업 적용";
  if (aiState?.source === "manual-chatgpt") return "ChatGPT 해석 적용";
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

function renderBriefFacts(inputFacts = {}) {
  const wrap = createEl("div", "manual-brief-facts");
  const labels = { core: "핵심 구조", details: "구체화", amplifiers: "미친소리 증폭" };
  for (const group of ["core", "details", "amplifiers"]) {
    const section = createEl("section", "manual-brief-group");
    section.append(createEl("h4", "", labels[group]));
    const list = document.createElement("ul");
    const items = inputFacts[group] || [];
    if (!items.length) list.append(createEl("li", "", "선택된 항목 없음"));
    for (const item of items) {
      list.append(createEl("li", "", `${item.categoryLabel}: ${item.value}`));
    }
    section.append(list);
    wrap.append(section);
  }
  return wrap;
}

function renderBriefList(title, items, emptyText) {
  const section = createEl("section", "manual-brief-list");
  section.append(createEl("h4", "", title));
  const list = document.createElement("ul");
  const content = Array.isArray(items) && items.length ? items : [emptyText];
  for (const item of content) {
    const text = typeof item === "string" ? item : item.categoryLabel || item.value || item.field || "";
    list.append(createEl("li", "", text));
  }
  section.append(list);
  return section;
}

export function renderManualChatGptPanel(result) {
  const panel = createEl("div", "manual-chatgpt-panel");
  const brief = result?.editorialBrief;
  if (!brief) {
    panel.append(createEl("p", "help-text", "아직 AI에게 보낼 편집 브리프가 없습니다."));
    return panel;
  }

  const intro = createEl("section", "manual-brief-intro");
  intro.append(
    createEl("span", "ai-status-badge ai-status-badge--brief", "로컬 정리본"),
    createEl("h3", "", "AI에게 보낼 편집 브리프"),
    createEl("p", "help-text", "이 내용은 최종 해석이 아닙니다. 현재 입력과 규칙으로 확인 가능한 단서를 정리한 자료입니다."),
  );
  panel.append(intro);
  panel.append(renderBriefFacts(brief.inputFacts));
  if (brief.confirmedClues.length) panel.append(renderBriefList("규칙으로 확인한 단서", brief.confirmedClues, "확인된 단서 없음"));
  panel.append(renderBriefList("AI가 해석해야 할 낯선 연결", [...brief.unusualConnections, ...brief.unresolvedConnections], "추가 해석이 필요한 연결 없음"));
  panel.append(renderBriefList("아직 정하지 않은 조건", brief.missingDecisions, "누락된 조건 없음"));
  panel.append(renderBriefList("함께 보낼 질문", brief.ruleQuestions.slice(0, 4), "질문 없음"));

  const copyActions = createEl("div", "manual-copy-actions");
  const fullCopy = createEl("button", "secondary-button", "일반 ChatGPT용 전체 요청 복사");
  fullCopy.type = "button";
  fullCopy.dataset.action = "copy-full-prompt";
  copyActions.append(fullCopy);
  if (state.manualChatGpt.copyStatus) copyActions.append(createEl("p", "message message--info", state.manualChatGpt.copyStatus));
  panel.append(copyActions);

  const fallback = createEl("textarea", "manual-copy-fallback");
  fallback.readOnly = true;
  fallback.value = result.fullChatGptPrompt || "";
  fallback.hidden = true;
  fallback.dataset.role = "manual-copy-fallback";
  panel.append(fallback);

  const guide = createEl("ol", "manual-chatgpt-guide");
  [
    "전체 요청을 복사합니다.",
    "ChatGPT 대화창을 열고 붙여 넣습니다.",
    "반환된 JSON 전체를 복사합니다.",
    "아래 응답 입력란에 붙여 넣습니다.",
    "AI 해석 적용을 누릅니다.",
  ].forEach((item) => guide.append(createEl("li", "", item)));
  panel.append(guide);

  const paste = createEl("section", "manual-response-panel");
  paste.append(createEl("h3", "", "ChatGPT 응답 붙여넣기"));
  const textareaLabel = createEl("label", "manual-response-label", "ChatGPT 응답 JSON 붙여넣기");
  const textarea = document.createElement("textarea");
  textarea.placeholder = "ChatGPT가 반환한 JSON 전체를 여기에 붙여 넣으세요.";
  textarea.value = state.manualChatGpt.responseText;
  textarea.dataset.action = "update-manual-response";
  textarea.className = "manual-response-textarea";
  textareaLabel.append(textarea);
  paste.append(textareaLabel);
  const apply = createEl("button", "primary-button", "AI 해석 적용");
  apply.type = "button";
  apply.dataset.action = "apply-manual-ai-response";
  paste.append(apply);
  if (state.manualChatGpt.error) paste.append(createEl("p", "message message--danger", state.manualChatGpt.error));
  panel.append(paste);
  return panel;
}

function renderElementBadges(items = [], className, emptyText) {
  const wrap = createEl("div", "axis-element-badges");
  const content = Array.isArray(items) && items.length ? items : [emptyText];
  for (const item of content) wrap.append(createEl("span", className, item));
  return wrap;
}

function findAxisById(response, axisId) {
  return response?.axes?.find((axis) => axis.id === axisId) || null;
}

export function isAxisDetailPanelVisible(axisDetailState = state.axisDetail) {
  return Boolean(axisDetailState?.selectedAxisId);
}

export function updateAxisDetailResponseState(axisDetailState, responseText) {
  return {
    ...axisDetailState,
    responseText,
    error: "",
  };
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
    createEl("span", "ai-status-badge ai-status-badge--loading", "2차 해석 대기"),
    createEl("h3", "", "선택한 방향 바텀업하기"),
    createEl("p", "help-text", "복사한 요청문을 ChatGPT에 붙여 넣은 뒤, 반환된 editor JSON 전체를 아래에 붙여 넣으세요. 이 단계는 선택한 방향을 바텀업하는 과정입니다."),
  );

  const summary = createEl("div", "axis-detail-summary");
  summary.append(createEl("h4", "", selectedAxis.title));
  summary.append(createEl("p", "axis-contradiction", selectedAxis.centralContradiction));
  const used = createEl("section", "axis-elements");
  used.append(createEl("h5", "", "이번 방향에서 사용한 요소"));
  used.append(renderElementBadges(selectedAxis.usedElements, "axis-used-badge", "사용 요소 없음"));
  summary.append(used);
  const deferred = createEl("section", "axis-elements");
  deferred.append(createEl("h5", "", "보류한 요소"));
  deferred.append(renderElementBadges(selectedAxis.deferredElements, "axis-deferred-badge", "보류 요소 없음"));
  summary.append(deferred);
  panel.append(summary);

  if (state.axisDetail.copyStatus) panel.append(createEl("p", "message message--info", state.axisDetail.copyStatus));

  const textareaLabel = createEl("label", "axis-detail-label", "ChatGPT 바텀업 응답 붙여넣기");
  const textarea = document.createElement("textarea");
  textarea.placeholder = "ChatGPT가 반환한 editor JSON 전체를 여기에 붙여 넣으세요.";
  textarea.rows = 12;
  textarea.value = state.axisDetail.responseText;
  textarea.dataset.action = "update-axis-detail-response";
  textarea.className = "manual-response-textarea axis-detail-response-textarea";
  textareaLabel.append(textarea);
  panel.append(textareaLabel);

  const actions = createEl("div", "manual-copy-actions");
  const apply = createEl("button", "primary-button", "바텀업 결과 적용");
  apply.type = "button";
  apply.dataset.action = "apply-axis-detail-response";
  const copyAgain = createEl("button", "secondary-button", "바텀업 요청 다시 복사");
  copyAgain.type = "button";
  copyAgain.dataset.action = "copy-axis-detail-prompt";
  copyAgain.dataset.axisId = selectedAxis.id;
  const cancel = createEl("button", "secondary-button", "방향 선택 취소");
  cancel.type = "button";
  cancel.dataset.action = "cancel-axis-detail";
  actions.append(apply, copyAgain, cancel);
  panel.append(actions);

  if (state.axisDetail.error) panel.append(createEl("p", "message message--danger", state.axisDetail.error));

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
  panel.append(
    createEl("span", "ai-status-badge ai-status-badge--manual", "ChatGPT 방향 찾기"),
    createEl("h3", "", "이 조합에서 발견한 미친소리 방향"),
    createEl("p", "help-text", "모든 요소를 하나의 이야기로 합치지 않고, 서로 다른 미친소리 가능성으로 나눠 봅니다."),
  );
  if (response.overview) panel.append(createEl("p", "axis-overview", response.overview));

  const grid = createEl("div", "axis-card-grid");
  for (const axis of response.axes || []) {
    const card = createEl("article", "axis-card");
    if (state.manualChatGpt.selectedAxisId === axis.id) card.classList.add("axis-card--selected");
    card.append(
      createEl("h4", "", axis.title),
      createEl("p", "axis-core-insight", axis.coreInsight),
      createEl("p", "axis-contradiction", axis.centralContradiction),
    );
    const used = createEl("section", "axis-elements");
    used.append(createEl("h5", "", "이번 방향에서 사용"));
    used.append(renderElementBadges(axis.usedElements, "axis-used-badge", "사용 요소 없음"));
    card.append(used);
    const deferred = createEl("section", "axis-elements");
    deferred.append(createEl("h5", "", "다른 방향에서 사용 가능"));
    deferred.append(renderElementBadges(axis.deferredElements, "axis-deferred-badge", "보류 요소 없음"));
    card.append(deferred);
    if (axis.bridge) card.append(createEl("p", "axis-bridge", axis.bridge));
    if (axis.assumptions?.length) {
      const assumptions = createEl("section", "axis-elements");
      assumptions.append(createEl("h5", "", "필요한 가정"));
      assumptions.append(renderElementBadges(axis.assumptions, "axis-assumption-badge", "추가 가정 없음"));
      card.append(assumptions);
    }
    if (axis.whyThisAxisMatters) card.append(createEl("p", "axis-why", axis.whyThisAxisMatters));
    if (axis.specificQuestion) card.append(createEl("p", "axis-question", axis.specificQuestion));
    const button = createEl("button", "secondary-button", "이 방향으로 바텀업하기");
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
    unresolved.append(createEl("summary", "", "아직 어느 방향에도 배치하지 않은 요소"));
    unresolved.append(createEl("p", "help-text", "제외된 요소가 아닙니다. 다음 구체화 과정에서 사용할 수 있는 재료입니다."));
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

export function renderAiResult(result, aiState = {}) {
  const response = result?.aiResponse || aiState.response || null;
  const compact = result?.compactInterpretation || buildCompactInterpretationView(result?.interpretation || {});
  const panel = createEl("div", `ai-result-panel ai-result-panel--${response ? getAiResultStatus(response) : aiState.status || "idle"}`);
  if (!response) {
    const status = createEl("div", "ai-result-status");
    status.append(createEl("span", `ai-status-badge ai-status-badge--${getAiBadgeTone(response, aiState)}`, getAiBadgeLabel(response, aiState)));
    panel.append(status);
    panel.append(
      createEl(
        "p",
        "help-text",
        aiState.status === "loading"
          ? "모델이 선택한 요소 사이의 중간 논리를 찾는 중입니다."
          : "아직 계산된 아이디어가 없습니다.",
      ),
    );
    if (result?.editorialBrief && aiState.status === "brief-ready") panel.append(renderManualChatGptPanel(result));
    return panel;
  }
  if (response.interpretationMode === "axis-finder") return renderAxisFinderResult(result, response);

  const status = createEl("div", "ai-result-status");
  const badge = createEl("span", `ai-status-badge ai-status-badge--${getAiBadgeTone(response, aiState)}`, getAiBadgeLabel(response, aiState));
  status.append(badge);
  if (aiState?.error) status.append(createEl("span", "ai-error-note", "API 요청 실패로 내부 fallback을 표시합니다."));
  panel.append(status);

  const headline = createEl("section", "ai-headline");
  headline.append(createEl("h3", "", "미친소리로 발전할 가능성"));
  headline.append(createEl("p", "", getAiResultHeadline(response)));
  panel.append(headline);

  const reading = createEl("section", "ai-connection-reading");
  reading.classList.add("ai-main-reading");
  reading.append(createEl("h3", "", "중심 연결 방향"));
  reading.append(createEl("p", "", response.connectionReading || "작성된 항목 사이의 가능한 연결을 더 탐색할 수 있습니다."));
  panel.append(reading);

  const contradiction = createEl("section", "ai-central-contradiction");
  contradiction.append(createEl("h3", "", "중심 모순 후보"));
  contradiction.append(createEl("p", "ai-contradiction-statement", response.centralContradiction?.statement || "중심 모순을 더 정할 수 있습니다."));
  if (response.centralContradiction?.explanation) contradiction.append(createEl("p", "", response.centralContradiction.explanation));
  panel.append(contradiction);

  if (response.settingDraft) {
    const draft = createEl("section", "ai-setting-draft");
    draft.append(createEl("h3", "", "미친소리 초안"), createEl("p", "", response.settingDraft));
    panel.append(draft);
  }

  const extra = createEl("details", "ai-extra-details");
  extra.append(createEl("summary", "", "질문, 다른 방향, 입력 구분 보기"));

  const questions = createEl("section", "ai-questions");
  questions.append(createEl("h3", "", "더 정해야 할 질문"));
  const questionList = document.createElement("ol");
    const questionItems = response.questions?.length ? response.questions.slice(0, 3) : ["이 설정에서 가장 불편한 제도적 조건은 무엇인가?"];
  for (const question of questionItems) questionList.append(createEl("li", "", question));
  questions.append(questionList);
  extra.append(questions);

  if (response.alternativeReadings?.length) {
    const alternatives = createEl("section", "ai-alternative-readings");
    alternatives.append(createEl("h3", "", "다른 미친소리 방향"));
    const list = document.createElement("ul");
    for (const item of response.alternativeReadings.slice(0, 1)) list.append(createEl("li", "", item));
    alternatives.append(list);
    extra.append(alternatives);
  }

  extra.append(
    createEl(
      "p",
      "ai-provenance-note",
      "사용자가 입력한 요소는 그대로 유지했습니다. 새롭게 추가된 연결과 조건은 가능한 해석이며, 확정된 설정이 아닙니다.",
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
  const groupLabels = { core: "핵심 구조", detail: "구체화", amplifier: "미친소리 증폭" };
  for (const group of ["core", "detail", "amplifier"]) {
    if (summaryData[group].length === 0) continue;
    const groupWrap = createEl("div", "summary-group");
    groupWrap.append(createEl("h3", "", groupLabels[group]));
    const dl = createEl("dl", "summary-items");
    for (const item of summaryData[group]) {
      const row = createEl("div", "summary-item");
      row.append(createEl("dt", "", item.title), createEl("dd", "", item.label));
      row.append(createEl("span", `status-badge status-badge--${item.source === "custom" ? "custom" : "preset"}`, optionSourceLabel(item.source)));
      dl.append(row);
    }
    groupWrap.append(dl);
    wrap.append(groupWrap);
  }
  return wrap;
}

export function updateProgress(group) {
  const keys = byGroup(group).map((item) => item.key);
  const label = group === "core" ? "핵심" : group === "detail" ? "구체화" : "미친소리 증폭";
  return `${label} ${countCompletedInputs(state.formState, keys)}/${keys.length} 작성`;
}

export async function copyTextToClipboard(text) {
  if (!text) return { ok: false, message: "복사할 내용이 없습니다." };
  try {
    if (!navigator?.clipboard?.writeText) throw new Error("clipboard_unavailable");
    await navigator.clipboard.writeText(text);
    return { ok: true, message: "복사했습니다. ChatGPT 대화창에 붙여 넣어주세요." };
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
  const isSameAxis = state.axisDetail.selectedAxisId === axis.id;
  state.manualChatGpt = { ...state.manualChatGpt, selectedAxisId: axis.id };
  state.axisDetail = {
    selectedAxisId: axis.id,
    responseText: isSameAxis ? state.axisDetail.responseText : "",
    error: "",
    copyStatus: outcome.ok
      ? "선택한 방향 바텀업 요청을 복사했습니다. ChatGPT에 붙여 넣어주세요."
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

export function parseAxisDetailResponse(text) {
  const parsed = parsePastedAiResponse(text);
  if (!parsed.ok) return parsed;
  if (parsed.value?.interpretationMode !== "editor") {
    return {
      ok: false,
      errorType: "wrong-mode",
      message: "1차 방향 탐색 응답이 아니라 editor 형식의 2차 바텀업 응답이 필요합니다.",
    };
  }
  return parsed;
}

export function applyAxisDetailResponse(text = state.axisDetail.responseText) {
  const parsed = parseAxisDetailResponse(text);
  if (!parsed.ok) {
    state.axisDetail = { ...state.axisDetail, error: parsed.message };
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
    source: "manual-chatgpt-detail",
    input: state.result.aiInput,
    response: parsed.value,
    error: null,
    isMock: false,
    isStale: false,
  };
  state.axisDetail = { ...state.axisDetail, error: "" };
  state.isResultStale = false;
  renderApp();
  document.querySelector(".ai-result-panel")?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  return parsed;
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
    selectedAxisId: parsed.value?.interpretationMode === "axis-finder" ? "" : state.manualChatGpt.selectedAxisId,
  };
  if (parsed.value?.interpretationMode === "axis-finder") state.axisDetail = createInitialAxisDetailState();
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
  state.collapsed = { detail: true, amplifier: true };
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
  return getSelectedOptionId(state.formState, key) !== "";
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
  const selectedOption = options.find((option) => option.id === getSelectedOptionId(state.formState, categoryKey));
  description.textContent = selectedOption?.description || "선택지를 고르면 설명이 표시됩니다.";
}

export function updateCardStatus(categoryKey) {
  const category = findCategory(categoryKey);
  const item = getCategoryState(categoryKey);
  const card = findCard(categoryKey);
  const status = card?.querySelector("[data-role='card-status']");
  if (!category || !card || !status) return;

  const isMissing =
    state.validation &&
    category.group === "core" &&
    state.validation.missingCore.includes(categoryKey) &&
    !isCategoryComplete(categoryKey);

  card.classList.toggle("input-card--missing", Boolean(isMissing));
  status.replaceChildren();
  status.append(createEl("span", `status-badge status-badge--${item.mode}`, item.mode === "custom" ? "직접 입력" : "기존 선택지"));
  if (isMissing) status.append(createEl("p", "message message--danger", "핵심 구조에 필요한 항목입니다."));
}

export function updateCustomTagPreview(categoryKey) {
  const card = findCard(categoryKey);
  const preview = card?.querySelector("[data-role='tag-preview']");
  if (!preview) return;
  preview.replaceWith(renderTagPreview(categoryKey, getCategoryState(categoryKey).customText));
}

export function updateProgressDisplay(group) {
  const groups = group ? [group] : ["core", "detail", "amplifier"];
  for (const groupName of groups) {
    const progress = appRoot?.querySelector(`[data-progress-group="${groupName}"]`);
    if (progress) progress.textContent = updateProgress(groupName);
  }
}

export function updateStaleNotice() {
  const panel = document.querySelector(".result-panel");
  if (!panel || !state.result) return;
  const existing = panel.querySelector(".stale-ai-notice");
  if (!state.isResultStale) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const notice = createEl("p", "stale-ai-notice", "입력 내용이 변경되었습니다. 다시 해석하면 최신 내용이 반영됩니다.");
  const heading = panel.querySelector("h2");
  if (heading?.nextSibling) panel.insertBefore(notice, heading.nextSibling);
  else panel.append(notice);
}

export function updateExampleToggleState() {
  const isExpanded = getExampleExpandedState(state.ui);
  const button = appRoot?.querySelector("[data-action='toggle-example']");
  const panel = document.getElementById("example-details");
  if (button) {
    button.textContent = getExampleToggleLabel(isExpanded);
    button.setAttribute("aria-expanded", getExampleToggleAriaExpanded(isExpanded));
  }
  if (panel) panel.hidden = !isExpanded;
}

export function toggleExampleDetails() {
  state.ui = { ...state.ui, exampleExpanded: toggleBooleanState(state.ui.exampleExpanded) };
  updateExampleToggleState();
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
  const { action, key, field, mode, group } = target.dataset;
  if (event.type === "click" && !shouldHandleAction(target, action)) return;
  if (event.type === "click" && action === "update-field") return;
  if (event.type === "change" && action !== "update-field") return;
  if (action === "set-mode") {
    if (!findCategory(key) || !["preset", "custom"].includes(mode)) return;
    state.formState = setInputMode(state.formState, key, mode);
    markResultStale();
    replaceInputCard(key);
    updateProgressDisplay(findCategory(key)?.group);
    updateStaleNotice();
    return;
  }
  if (action === "toggle-section") {
    state.collapsed = { ...state.collapsed, [group]: !state.collapsed[group] };
    renderApp();
    return;
  }
  if (action === "toggle-example") {
    toggleExampleDetails();
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
  if (action === "apply-axis-detail-response") {
    applyAxisDetailResponse();
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
    state.formState = updateFormField(state.formState, key, field, target.value);
    markResultStale();
    updatePresetDescription(key);
    updateCardStatus(key);
    updateProgressDisplay(findCategory(key)?.group);
    updateStaleNotice();
  }
}

function handleInputEvent(event) {
  const target = event.target.closest("[data-action='update-field']");
  const manualTarget = event.target.closest("[data-action='update-manual-response']");
  const axisDetailTarget = event.target.closest("[data-action='update-axis-detail-response']");
  if (axisDetailTarget) {
    state.axisDetail = updateAxisDetailResponseState(state.axisDetail, axisDetailTarget.value);
    return;
  }
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
  updateCardStatus(key);
  updateProgressDisplay(findCategory(key)?.group);
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
