import { allCategories, categoryDefinitions } from "./data.js";

export const CATEGORY_KEY_MAP = {
  pressure: "pressures",
  target: "targets",
  technology: "technologies",
  transformation: "transformations",
  ideology: "ideologies",
  actor: "actors",
  metric: "metrics",
  mechanism: "mechanisms",
  benefit: "benefits",
  careNarrative: "careNarratives",
  classDistortion: "classDistortions",
  feedbackLoop: "feedbackLoops",
  victimInternalization: "victimInternalizations",
  irreversibility: "irreversibilities",
};

const CORE_KEYS = ["pressure", "target", "technology", "transformation", "ideology"];
const DETAIL_KEYS = ["actor", "metric", "mechanism", "benefit", "careNarrative"];
const AMPLIFIER_KEYS = ["classDistortion", "feedbackLoop", "victimInternalization", "irreversibility"];
const ALL_KEYS = [...CORE_KEYS, ...DETAIL_KEYS, ...AMPLIFIER_KEYS];

const EMPTY_INPUT = Object.freeze({ mode: "preset", optionId: "", customText: "" });

const KEYWORD_RULES = [
  { keywords: ["고령", "노인", "노후"], domains: ["aging"] },
  { keywords: ["AI", "인공지능", "알고리즘"], domains: ["governance", "labor"], functions: ["automate", "predict"] },
  { keywords: ["일자리", "실업", "취업", "노동", "생산성", "직업", "대체"], domains: ["labor"] },
  { keywords: ["중년"], domains: ["labor", "aging"] },
  { keywords: ["병원", "의료", "치료", "건강", "환자"], domains: ["healthcare"], rights: ["healthcare"] },
  { keywords: ["집", "주거", "거주"], domains: ["housing"], rights: ["residence"] },
  { keywords: ["거주권"], domains: ["housing"], rights: ["residence"] },
  { keywords: ["이동권"], domains: ["migration"], rights: ["mobility"] },
  { keywords: ["출산", "임신", "자녀", "출산권"], domains: ["reproduction"], rights: ["reproduction"] },
  { keywords: ["삭제권"], rights: ["deletion"] },
  { keywords: ["죽을 권리"], rights: ["death"] },
  { keywords: ["접근권"], functions: ["license"] },
  { keywords: ["기억"], domains: ["identity"], rights: ["memory"], functions: ["edit", "trade"] },
  { keywords: ["개인정보", "사생활", "감시"], domains: ["privacy"], rights: ["privacy"], functions: ["monitor"] },
  { keywords: ["신분권", "시민권", "제도"], domains: ["governance"], rights: ["citizenship"], functions: ["license"] },
  { keywords: ["이동", "이주"], domains: ["migration"], rights: ["mobility"], functions: ["relocate"] },
  { keywords: ["환경", "자연", "탄소", "기후", "지구"], domains: ["climate", "environment"], rights: ["environment"] },
  { keywords: ["점수", "등급", "평가"], functions: ["score"] },
  { keywords: ["보험"], domains: ["finance", "healthcare"], functions: ["insure"] },
  { keywords: ["월별", "유료", "프리미엄", "결제"], tones: ["marketization"] },
  { keywords: ["구독"], tones: ["marketization"], functions: ["trade"] },
  { keywords: ["무료"], tones: ["welfare-language"] },
  { keywords: ["허가", "승인", "면허"], functions: ["license"], tones: ["technocracy"] },
  { keywords: ["세대", "미래인류"], tones: ["generational-conflict"] },
  { keywords: ["효율", "최적화"], tones: ["utilitarianism", "technocracy"], functions: ["optimize"] },
  { keywords: ["보호", "돌봄", "안전"], tones: ["paternalism", "welfare-language"] },
  { keywords: ["강제", "의무"], functions: ["enforce"] },
  { keywords: ["배분", "할당", "재배분"], functions: ["allocate"] },
  { keywords: ["삭제"], rights: ["deletion"], functions: ["edit"] },
  { keywords: ["복제"], domains: ["digital-life"], functions: ["replicate"] },
  { keywords: ["상속"], functions: ["inherit"] },
  { keywords: ["감정", "인간"], domains: ["identity"], functions: ["predict", "monitor"] },
  { keywords: ["상담"], domains: ["healthcare", "community"], rights: ["human-contact"] },
  { keywords: ["생애주기"], domains: ["aging"], functions: ["allocate"] },
];

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === "string" && item.trim() !== ""))];
}

function clamp01(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(1, Math.max(0, number));
}

function hasCategory(categoryKey) {
  return Object.hasOwn(CATEGORY_KEY_MAP, categoryKey);
}

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  const sanitized = {};
  if (typeof metadata.description === "string") sanitized.description = normalizeText(metadata.description);
  for (const field of ["domains", "functions", "rights", "tones", "needs", "enables", "mechanisms"]) {
    sanitized[field] = uniqueStrings(metadata[field]);
  }
  for (const field of ["plausibility", "novelty", "madness"]) {
    if (field in metadata) sanitized[field] = clamp01(metadata[field], field === "novelty" ? 0.7 : 0.5);
  }
  return sanitized;
}

function mergeTagArrays(first, second) {
  return uniqueStrings([...(first || []), ...(second || [])]);
}

function getInputEngine() {
  return globalThis.SatireIdeaEngine || null;
}

function resolveSource(selection) {
  if (!selection || !selection.option) return "empty";
  return selection.mode === "custom" ? "custom" : "preset";
}

function getResolvedOption(selection) {
  return selection && selection.option ? selection.option : null;
}

function inferenceConfidenceFromOption(option) {
  const tagCount =
    option.domains.length + option.functions.length + option.rights.length + option.tones.length;
  if (tagCount >= 4) return "medium";
  if (tagCount >= 1) return "low";
  return "none";
}

function getCustomInferredTags(option) {
  if (!option || option.source !== "custom") return null;
  return {
    domains: uniqueStrings(option.domains),
    functions: uniqueStrings(option.functions),
    rights: uniqueStrings(option.rights),
    tones: uniqueStrings(option.tones),
    needs: uniqueStrings(option.needs),
    enables: uniqueStrings(option.enables),
    mechanisms: uniqueStrings(option.mechanisms),
    inferenceConfidence: option.inferenceConfidence || "none",
  };
}

/**
 * 사용자 입력 텍스트의 양끝 공백과 연속 공백을 정리한다.
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * 주관식 입력에 사용할 임시 id를 만든다.
 * @param {string} categoryKey
 * @param {unknown} text
 * @returns {string}
 */
export function slugifyCustomId(categoryKey, text) {
  const safeCategory = normalizeText(categoryKey).replace(/[^A-Za-z0-9_-]+/g, "-") || "item";
  const slug = normalizeText(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `custom-${safeCategory}-${slug || "item"}`;
}

/**
 * UI category key에 해당하는 categoryDefinitions 항목을 찾는다.
 * @param {string} categoryKey
 * @returns {object|null}
 */
export function getCategoryDefinition(categoryKey) {
  const dataKey = CATEGORY_KEY_MAP[categoryKey];
  if (!dataKey) return null;
  return categoryDefinitions.find((definition) => definition.id === dataKey) || null;
}

/**
 * UI category key에 해당하는 기본 선택지 배열의 shallow copy를 반환한다.
 * @param {string} categoryKey
 * @returns {object[]}
 */
export function getCategoryOptions(categoryKey) {
  const dataKey = CATEGORY_KEY_MAP[categoryKey];
  const options = dataKey ? allCategories[dataKey] : null;
  return Array.isArray(options) ? [...options] : [];
}

/**
 * 기본 선택지 id로 option 객체를 찾는다.
 * @param {string} categoryKey
 * @param {string} optionId
 * @returns {object|null}
 */
export function findPresetOption(categoryKey, optionId) {
  if (typeof optionId !== "string") return null;
  return getCategoryOptions(categoryKey).find((option) => option.id === optionId) || null;
}

/**
 * 주관식 입력을 기존 option과 호환되는 custom option 객체로 만든다.
 * @param {string} categoryKey
 * @param {unknown} text
 * @param {object=} metadata
 * @returns {object|null}
 */
export function createCustomOption(categoryKey, text, metadata = {}) {
  if (!hasCategory(categoryKey)) return null;
  const label = normalizeText(text);
  if (!label) return null;
  const sanitized = sanitizeMetadata(metadata);
  const option = {
    id: slugifyCustomId(categoryKey, label),
    label,
    description: sanitized.description || "사용자가 직접 입력한 항목",
    domains: uniqueStrings(sanitized.domains),
    functions: uniqueStrings(sanitized.functions),
    rights: uniqueStrings(sanitized.rights),
    tones: uniqueStrings(sanitized.tones),
    plausibility: clamp01(sanitized.plausibility, 0.5),
    novelty: clamp01(sanitized.novelty, 0.7),
    madness: clamp01(sanitized.madness, 0.5),
    source: "custom",
    rawText: label,
    inferenceConfidence: "none",
  };
  if (categoryKey === "pressure") option.needs = uniqueStrings(sanitized.needs);
  if (categoryKey === "technology") option.enables = uniqueStrings(sanitized.enables);
  if (categoryKey === "transformation") option.mechanisms = uniqueStrings(sanitized.mechanisms);
  option.inferenceConfidence = inferenceConfidenceFromOption(option);
  return option;
}

/**
 * 기본 선택지를 선택 상태 객체로 만든다.
 * @param {string} categoryKey
 * @param {string} optionId
 * @returns {object|null}
 */
export function createPresetSelection(categoryKey, optionId) {
  const option = findPresetOption(categoryKey, optionId);
  if (!option) return null;
  return { mode: "preset", categoryKey, optionId, customText: "", option };
}

/**
 * 주관식 입력을 선택 상태 객체로 만든다.
 * @param {string} categoryKey
 * @param {unknown} text
 * @param {object=} metadata
 * @returns {object|null}
 */
export function createCustomSelection(categoryKey, text, metadata = {}) {
  const option = createCustomOption(categoryKey, text, metadata);
  if (!option) return null;
  return { mode: "custom", categoryKey, optionId: "", customText: option.label, option };
}

/**
 * 명시적 키워드 사전으로 주관식 입력의 최소 태그를 추론한다.
 * @param {string} categoryKey
 * @param {unknown} text
 * @returns {object}
 */
export function inferCustomMetadata(categoryKey, text) {
  const normalized = normalizeText(text);
  const result = {
    domains: [],
    functions: [],
    rights: [],
    tones: [],
    needs: [],
    enables: [],
    mechanisms: [],
    matchedKeywords: [],
  };
  if (!hasCategory(categoryKey) || !normalized) return result;

  for (const rule of KEYWORD_RULES) {
    const matched = rule.keywords.filter((keyword) => normalized.includes(keyword));
    if (matched.length === 0) continue;
    result.matchedKeywords.push(...matched);
    result.domains.push(...(rule.domains || []));
    result.functions.push(...(rule.functions || []));
    result.rights.push(...(rule.rights || []));
    result.tones.push(...(rule.tones || []));
  }

  result.domains = uniqueStrings(result.domains);
  result.functions = uniqueStrings(result.functions);
  result.rights = uniqueStrings(result.rights);
  result.tones = uniqueStrings(result.tones);
  result.matchedKeywords = uniqueStrings(result.matchedKeywords);
  if (categoryKey === "pressure") result.needs = [...result.functions];
  if (categoryKey === "technology") result.enables = [...result.functions];
  if (categoryKey === "transformation") result.mechanisms = [...result.functions];
  return result;
}

/**
 * 추론 태그와 사용자 metadata를 합쳐 custom option을 만든다.
 * @param {string} categoryKey
 * @param {unknown} text
 * @param {object=} metadata
 * @returns {object|null}
 */
export function createEnrichedCustomOption(categoryKey, text, metadata = {}) {
  const inferred = inferCustomMetadata(categoryKey, text);
  const userMetadata = sanitizeMetadata(metadata);
  const merged = {
    description: userMetadata.description,
    domains: mergeTagArrays(inferred.domains, userMetadata.domains),
    functions: mergeTagArrays(inferred.functions, userMetadata.functions),
    rights: mergeTagArrays(inferred.rights, userMetadata.rights),
    tones: mergeTagArrays(inferred.tones, userMetadata.tones),
    needs: mergeTagArrays(inferred.needs, userMetadata.needs),
    enables: mergeTagArrays(inferred.enables, userMetadata.enables),
    mechanisms: mergeTagArrays(inferred.mechanisms, userMetadata.mechanisms),
    plausibility: "plausibility" in userMetadata ? userMetadata.plausibility : 0.5,
    novelty: "novelty" in userMetadata ? userMetadata.novelty : 0.7,
    madness: "madness" in userMetadata ? userMetadata.madness : 0.5,
  };
  const option = createCustomOption(categoryKey, text, merged);
  if (!option) return null;
  option.inferred = inferred;
  option.inferenceConfidence = inferenceConfidenceFromOption(option);
  return option;
}

/**
 * 단일 category input을 preset/custom/empty 선택으로 해석한다.
 * @param {string} categoryKey
 * @param {object} input
 * @returns {object|null}
 */
export function resolveInputSelection(categoryKey, input = {}) {
  if (!hasCategory(categoryKey) || !input || typeof input !== "object") return null;
  const mode = input.mode;
  const customText = normalizeText(input.customText);
  const optionId = typeof input.optionId === "string" ? input.optionId : "";
  if (mode === "custom" && customText) {
    const option = createEnrichedCustomOption(categoryKey, customText, input.metadata);
    return option ? { mode: "custom", categoryKey, optionId: "", customText: option.label, option } : null;
  }
  if (mode === "preset") return createPresetSelection(categoryKey, optionId);
  if (customText) {
    const option = createEnrichedCustomOption(categoryKey, customText, input.metadata);
    return option ? { mode: "custom", categoryKey, optionId: "", customText: option.label, option } : null;
  }
  if (optionId) return createPresetSelection(categoryKey, optionId);
  return null;
}

/**
 * 전체 formState를 engine 입력 구조로 변환한다.
 * @param {object} formState
 * @returns {object}
 */
export function resolveAllInputs(formState = {}) {
  const resolvedSelections = Object.fromEntries(ALL_KEYS.map((key) => [key, resolveInputSelection(key, formState[key])]));
  const sources = Object.fromEntries(ALL_KEYS.map((key) => [key, resolveSource(resolvedSelections[key])]));
  return {
    core: Object.fromEntries(CORE_KEYS.map((key) => [key, getResolvedOption(resolvedSelections[key])])),
    detail: Object.fromEntries(DETAIL_KEYS.map((key) => [key, getResolvedOption(resolvedSelections[key])])),
    amplifier: Object.fromEntries(AMPLIFIER_KEYS.map((key) => [key, getResolvedOption(resolvedSelections[key])])),
    sources,
    customCount: Object.values(sources).filter((source) => source === "custom").length,
    presetCount: Object.values(sources).filter((source) => source === "preset").length,
    emptyCount: Object.values(sources).filter((source) => source === "empty").length,
  };
}

/**
 * formState를 resolve하고 기존 evaluateConcept()로 진단한다.
 * @param {object} formState
 * @returns {{selection:object,evaluation:object,inputSummary:object}}
 */
export function evaluateResolvedInputs(formState = {}) {
  const selection = resolveAllInputs(formState);
  const engine = getInputEngine();
  if (!engine || typeof engine.evaluateConcept !== "function") {
    throw new Error("SatireIdeaEngine.evaluateConcept is required.");
  }
  const inferredTagsByCategory = {};
  for (const key of ALL_KEYS) {
    const option = selection.core[key] || selection.detail[key] || selection.amplifier[key] || null;
    const inferred = getCustomInferredTags(option);
    if (inferred) inferredTagsByCategory[key] = inferred;
  }
  return {
    selection,
    evaluation: engine.evaluateConcept(selection),
    inputSummary: {
      customCount: selection.customCount,
      presetCount: selection.presetCount,
      emptyCount: selection.emptyCount,
      inferredTagsByCategory,
    },
  };
}

/**
 * formState의 입력 완성도와 주의 메시지를 만든다.
 * @param {object} formState
 * @returns {{isCoreComplete:boolean,missingCore:string[],warnings:string[],info:string[]}}
 */
export function getInputValidation(formState = {}) {
  const resolved = resolveAllInputs(formState);
  const missingCore = CORE_KEYS.filter((key) => !resolved.core[key]);
  const warnings = [];
  const info = [];
  if (resolved.customCount >= 1) warnings.push("직접 입력 항목은 판단 근거가 제한적일 수 있습니다.");
  const customTexts = ALL_KEYS.map((key) => normalizeText(formState[key] && formState[key].customText)).filter(Boolean);
  if (customTexts.some((text, index) => customTexts.indexOf(text) !== index)) {
    warnings.push("동일한 직접 입력이 여러 항목에 반복됩니다.");
  }
  if (AMPLIFIER_KEYS.filter((key) => resolved.amplifier[key]).length >= 3) {
    warnings.push("미친 소리 증폭 요소가 3개 이상이면 조합이 산만해질 수 있습니다.");
  }
  for (const key of ALL_KEYS) {
    const option = resolved.core[key] || resolved.detail[key] || resolved.amplifier[key] || null;
    if (option && option.source === "custom" && option.inferenceConfidence === "none") {
      info.push("직접 입력한 항목의 연결 태그를 찾지 못해 판단 신뢰도가 낮게 표시됩니다.");
      break;
    }
  }
  return { isCoreComplete: missingCore.length === 0, missingCore, warnings, info };
}

/**
 * formState를 JSON 직렬화 가능한 최소 구조로 정리한다.
 * @param {object} formState
 * @returns {object}
 */
export function serializeFormState(formState = {}) {
  const serialized = {};
  for (const key of ALL_KEYS) {
    const value = formState[key] && typeof formState[key] === "object" ? formState[key] : {};
    const item = {
      mode: value.mode === "custom" ? "custom" : "preset",
      optionId: typeof value.optionId === "string" ? value.optionId : "",
      customText: normalizeText(value.customText),
    };
    const metadata = sanitizeMetadata(value.metadata);
    if (Object.keys(metadata).length > 0) item.metadata = metadata;
    serialized[key] = item;
  }
  return serialized;
}

/**
 * 직렬화된 formState를 모든 카테고리를 포함하는 안전한 상태로 복원한다.
 * @param {object} serialized
 * @returns {object}
 */
export function restoreFormState(serialized = {}) {
  const restored = {};
  for (const key of ALL_KEYS) {
    const value = serialized[key] && typeof serialized[key] === "object" ? serialized[key] : EMPTY_INPUT;
    const item = {
      mode: value.mode === "custom" ? "custom" : "preset",
      optionId: typeof value.optionId === "string" ? value.optionId : "",
      customText: normalizeText(value.customText),
    };
    const metadata = sanitizeMetadata(value.metadata);
    if (Object.keys(metadata).length > 0) item.metadata = metadata;
    restored[key] = item;
  }
  return restored;
}

if (typeof window !== "undefined") {
  window.SatireIdeaInput = {
    CATEGORY_KEY_MAP,
    normalizeText,
    slugifyCustomId,
    getCategoryDefinition,
    getCategoryOptions,
    findPresetOption,
    createCustomOption,
    createPresetSelection,
    createCustomSelection,
    resolveInputSelection,
    resolveAllInputs,
    inferCustomMetadata,
    createEnrichedCustomOption,
    evaluateResolvedInputs,
    getInputValidation,
    serializeFormState,
    restoreFormState,
  };
}
