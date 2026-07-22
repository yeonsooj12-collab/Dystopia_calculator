const CORE_KEYS = ["pressure", "target", "technology", "transformation", "ideology"];
const ALLOWED_STATUS = new Set(["strong", "workable", "needs-detail", "uncertain", "missing", "caution"]);

const CATEGORY_LABELS = {
  pressure: "사회 압력",
  target: "영향을 받는 집단",
  technology: "외부 조건",
  transformation: "실제 변화",
  ideology: "정당화 언어",
};

const PAIR_LABELS = {
  "pressure-target": "사회 압력과 영향을 받는 집단",
  "pressure-technology": "사회 압력과 외부 조건",
  "pressure-transformation": "사회 압력과 실제 변화",
  "pressure-ideology": "사회 압력과 정당화 언어",
  "target-technology": "영향을 받는 집단과 외부 조건",
  "target-transformation": "영향을 받는 집단과 실제 변화",
  "technology-transformation": "외부 조건과 실제 변화",
  "transformation-ideology": "실제 변화와 정당화 언어",
};

const VAGUE_TECH = ["ai", "인공지능", "로봇", "알고리즘", "플랫폼", "앱", "데이터", "우주", "생명공학"];
const TECH_ACTIONS = ["판단", "예측", "감시", "분류", "배분", "대체", "자동", "측정", "추적", "검증", "이송", "계산"];
const TRANSFORM_VERBS = ["배분", "재배분", "할당", "점수", "허가", "구독", "상품", "거래", "보험", "면허", "제한", "박탈", "이전", "자동", "감시", "예측", "인증", "통제", "복제"];
const RIGHT_TERMS = ["거주권", "이동권", "의료 접근권", "상담 접근권", "교육권", "투표권", "수면권", "출산권", "죽을 권리", "기억", "개인정보", "인간 접촉", "자연환경 이용권", "노동권", "통제권", "권리"];
const IDEOLOGY_TERMS = ["효율", "공정", "안전", "자유", "선택권", "복지", "돌봄", "지속가능성", "생존", "다수의 행복", "책임", "혁신", "개인화", "예방", "존엄", "평등", "시장", "공동체", "미래 세대"];
const VAGUE_IDEOLOGY = ["쉽게 만들기", "문제 해결", "발전"];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalize(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

export function toDisplayText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map((item) => toDisplayText(item)).filter(Boolean).join(", ");
  if (typeof value === "object") {
    return toDisplayText(value.message) ||
      toDisplayText(value.label) ||
      toDisplayText(value.title) ||
      toDisplayText(value.suggestion);
  }
  return "";
}

export function getInsightDisplayText(insight) {
  return toDisplayText(insight);
}

function arrayHasAny(values) {
  return Array.isArray(values) && values.length > 0;
}

function hasAnyTag(option, keys) {
  return Boolean(option && keys.some((key) => arrayHasAny(option[key])));
}

function textIncludesAny(text, terms) {
  const normalized = normalize(text).toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function makeDiagnosis(status, title, message, extra = {}) {
  return {
    status: ALLOWED_STATUS.has(status) ? status : "uncertain",
    title,
    message,
    reason: extra.reason || "",
    suggestion: extra.suggestion || "",
    questions: extra.questions || [],
    relatedCategories: extra.relatedCategories || [],
  };
}

function unpackSelection(input = {}) {
  return input.selection || input.resolvedInputs?.selection || input.resolvedInputs || input;
}

function unpackEvaluation(input = {}) {
  return input.evaluation || {};
}

function getSelectionOption(selection, categoryKey) {
  return selection?.core?.[categoryKey] || selection?.detail?.[categoryKey] || selection?.amplifier?.[categoryKey] || null;
}

export function getSelectionText(selection, categoryKey) {
  const option = getSelectionOption(selection, categoryKey);
  return option?.rawText || option?.label || "";
}

export function getSelectionSource(selection, categoryKey) {
  const option = getSelectionOption(selection, categoryKey);
  return option?.source === "custom" ? "custom" : option ? "preset" : "empty";
}

export function getCategoryStatus(selection, categoryKey) {
  return getSelectionText(selection, categoryKey) ? "filled" : "missing";
}

export function getMissingCoreCategories(selection = {}) {
  return [];
}

function completedCoreCount(selection = {}) {
  return CORE_KEYS.filter((key) => getSelectionOption(selection, key)).length;
}

function pairKey(pair) {
  return Array.isArray(pair?.keys) ? pair.keys.join("-") : "";
}

function findPair(evaluation, left, right) {
  return evaluation?.coreEvaluation?.pairScores?.find((pair) => pairKey(pair) === `${left}-${right}`) || null;
}

function pairToInsight(pair, fallbackMessage) {
  const key = pairKey(pair);
  return {
    pairKey: key,
    label: PAIR_LABELS[key] || pair?.name || "핵심 연결",
    score: typeof pair?.score === "number" ? pair.score : null,
    confidence: pair?.confidence || "low",
    message: fallbackMessage || (pair?.confidence === "low" ? "정보가 부족해 두 요소의 연결은 아직 판단하기 어렵습니다." : "두 요소 사이의 연결 근거를 확인했습니다."),
  };
}

export function getInterpretationHeadline(evaluation = {}, selection = {}) {
  const count = completedCoreCount(selection);
  if (count === 0) return "조건을 작성하면 비교 진단을 시작할 수 있습니다.";
  if (count < 3) return "작성한 조건을 출발점으로 넓은 비교 질문을 만들 수 있습니다.";
  if (evaluation.confidence === "low") return "아직 연결을 판단할 정보가 충분하지 않습니다.";
  if (evaluation.compatibility >= 65) return "조건의 연결이 비교적 선명합니다.";
  if (evaluation.compatibility >= 40) return "기본 구조는 보이지만 몇 가지 연결은 더 설명할 수 있습니다.";
  return "중요한 요소 사이의 관계를 조금 더 구체적으로 설명해보세요.";
}

export function getInterpretationTone(evaluation = {}, selection = {}) {
  const count = completedCoreCount(selection);
  if (count < 3) return "exploratory";
  if (evaluation.confidence === "low") return "exploratory";
  if (evaluation.compatibility >= 65) return "encouraging";
  if (evaluation.compatibility < 40 && evaluation.coreEvaluation?.weaknesses?.length > 0) return "caution";
  return "neutral";
}

function overviewPart(selection, key, suffix) {
  const text = getSelectionText(selection, key);
  return text ? `${CATEGORY_LABELS[key]}: ${text}${suffix || ""}` : "";
}

function buildOverview(selection = {}) {
  return [
    overviewPart(selection, "pressure"),
    overviewPart(selection, "target"),
    overviewPart(selection, "technology"),
    overviewPart(selection, "transformation"),
    overviewPart(selection, "ideology"),
  ].filter(Boolean);
}

export function diagnosePressureTarget(input = {}) {
  const selection = unpackSelection(input);
  const evaluation = input.evaluation || {};
  const pressure = getSelectionOption(selection, "pressure");
  const target = getSelectionOption(selection, "target");
  const pair = findPair(evaluation, "pressure", "target");
  if (!pressure || !target) {
    return makeDiagnosis("missing", "사회 압력과 영향을 받는 집단", "사회 압력과 영향을 받는 집단 중 비어 있는 항목이 있습니다.", {
      suggestion: "먼저 어떤 압력이 어떤 집단에게 직접 작동하는지 적어보세요.",
      questions: ["이 사회 압력은 어떤 집단에게 가장 먼저 영향을 주나요?"],
      relatedCategories: ["pressure", "target"],
    });
  }
  if (!pair || pair.confidence === "low") {
    return makeDiagnosis("uncertain", "사회 압력과 영향을 받는 집단", "사회 압력과 영향을 받는 집단의 연결을 판단할 정보가 아직 충분하지 않습니다.", {
      suggestion: "압력이 이 집단에게 직접 영향을 주는 이유를 한 문장 더 붙여보세요.",
      questions: ["왜 이 집단이어야 하나요?", "이 집단은 어떤 기준으로 분류되나요?"],
      relatedCategories: ["pressure", "target"],
    });
  }
  if (pair.score >= 65) {
    return makeDiagnosis("strong", "사회 압력과 영향을 받는 집단", "사회 압력과 영향을 받는 집단이 비교적 직접적으로 연결됩니다.", {
      reason: "두 항목 사이에 비교 가능한 연결 근거가 있습니다.",
      questions: ["이 집단이 제도 안에서 어떤 기준으로 분류되는지 더 구체화할 수 있나요?"],
      relatedCategories: ["pressure", "target"],
    });
  }
  if (pair.score >= 35) {
    return makeDiagnosis("workable", "사회 압력과 영향을 받는 집단", "기본 연결은 보이지만 집단이 직접 영향을 받는 이유를 더 설명하면 선명해집니다.", {
      suggestion: "문제가 이 집단의 생활, 권리, 비용 중 무엇을 건드리는지 적어보세요.",
      questions: ["이 사회 압력이 이 집단에게 가장 직접적으로 주는 영향은 무엇인가요?"],
      relatedCategories: ["pressure", "target"],
    });
  }
  return makeDiagnosis("needs-detail", "사회 압력과 영향을 받는 집단", "사회 압력과 영향을 받는 집단 사이의 직접적인 연결이 아직 약하게 보입니다.", {
    suggestion: "집단을 바꾸기보다, 왜 이 집단이 제도 안에서 먼저 분류되는지 설명해보세요.",
    questions: ["이 집단은 제도에서 어떤 기준으로 분류되나요?"],
    relatedCategories: ["pressure", "target"],
  });
}

export function diagnoseTechnology(input = {}) {
  const selection = unpackSelection(input);
  const evaluation = input.evaluation || {};
  const technology = getSelectionOption(selection, "technology");
  const transformation = getSelectionOption(selection, "transformation");
  const text = technology?.rawText || technology?.label || "";
  if (!technology) return makeDiagnosis("missing", "외부 조건 역할", "외부 조건 항목이 아직 비어 있습니다.", { questions: ["전쟁, 무역, 이주, 기술, 강대국 압박 중 무엇이 조건을 바꾸나요?"], relatedCategories: ["technology"] });
  const pair = findPair(evaluation, "technology", "transformation");
  const vagueCustom = technology.source === "custom" && textIncludesAny(text, VAGUE_TECH) && !textIncludesAny(text, TECH_ACTIONS);
  if (vagueCustom) {
    return makeDiagnosis("needs-detail", "외부 조건 역할", "조건의 이름은 있지만 무엇을 바꾸는지는 아직 구체적이지 않습니다.", {
      suggestion: "이 조건이 비용, 물자, 이동, 감시, 배분, 동원 중 무엇을 바꾸는지 적어보세요.",
      questions: ["이 외부 조건은 제도에서 정확히 무엇을 가능하게 하나요?"],
      relatedCategories: ["technology", "transformation"],
    });
  }
  if (pair?.confidence === "low") return makeDiagnosis("uncertain", "외부 조건 역할", "외부 조건과 실제 변화의 연결 근거가 아직 부족합니다.", { questions: ["이 조건이 없으면 왜 같은 변화가 일어나기 어렵나요?"], relatedCategories: ["technology", "transformation"] });
  if (hasAnyTag(technology, ["functions", "enables"]) && transformation && pair?.score >= 50) {
    return makeDiagnosis(pair.score >= 65 ? "strong" : "workable", "외부 조건 역할", "외부 조건이 실제 변화를 가능하게 하는 방향성이 보입니다.", {
      reason: "외부 조건과 실제 변화가 비교 가능한 방식으로 연결됩니다.",
      questions: ["이 조건이 사람을 이동시키나요, 분류하나요, 배분하나요, 동원하나요?"],
      relatedCategories: ["technology", "transformation"],
    });
  }
  return makeDiagnosis("workable", "외부 조건 역할", "외부 조건은 있지만 제도 안에서의 역할을 더 구체화하면 좋습니다.", { questions: ["이 조건은 비용, 물자, 이동, 감시, 배분 중 무엇을 바꾸나요?"], relatedCategories: ["technology"] });
}

export function diagnoseTransformation(input = {}) {
  const selection = unpackSelection(input);
  const transformation = getSelectionOption(selection, "transformation");
  const text = transformation?.rawText || transformation?.label || "";
  if (!transformation) {
    return makeDiagnosis("missing", "실제 변화", "어떤 권리나 제도가 바뀌는지 정하면 비교 쟁점이 더 선명해집니다.", {
      suggestion: "무엇을 어떤 조건의 권리, 상품, 자격, 점수로 바꾸는지 적어보세요.",
      questions: ["기존의 어떤 권리가 조건부 권리가 되나요?"],
      relatedCategories: ["transformation"],
    });
  }
  const hasVerb = textIncludesAny(text, TRANSFORM_VERBS) || hasAnyTag(transformation, ["functions", "mechanisms"]);
  const hasRight = textIncludesAny(text, RIGHT_TERMS) || hasAnyTag(transformation, ["rights"]);
  if (hasVerb && hasRight) return makeDiagnosis("strong", "실제 변화", "무엇이 어떤 제도적 조건으로 바뀌는지 비교적 구체적입니다.", { questions: ["그 권리를 잃거나 얻는 기준은 무엇인가요?"], relatedCategories: ["transformation"] });
  if (hasVerb || hasRight) return makeDiagnosis("needs-detail", "실제 변화", "변화의 방향은 보이지만 권리 대상이나 변환 방식 중 하나가 더 필요합니다.", { suggestion: "무엇을 점수, 허가, 구독, 상품, 자격, 배분 대상으로 바꾸는지 적어보세요.", questions: ["무엇이 배분되거나 제한되나요?"], relatedCategories: ["transformation"] });
  return makeDiagnosis("needs-detail", "실제 변화", "문장은 있지만 어떤 권리나 제도가 어떻게 바뀌는지는 아직 추상적입니다.", { suggestion: "권리 이름과 변환 동사를 함께 써보세요.", questions: ["기존에 당연했던 무엇이 조건부 권리가 되나요?"], relatedCategories: ["transformation"] });
}

export function diagnoseIdeology(input = {}) {
  const selection = unpackSelection(input);
  const evaluation = input.evaluation || {};
  const ideology = getSelectionOption(selection, "ideology");
  const transformation = getSelectionOption(selection, "transformation");
  const text = ideology?.rawText || ideology?.label || "";
  if (!ideology) return makeDiagnosis("missing", "정당화 언어", "사회가 이 제도를 어떤 명분으로 받아들이는지 아직 비어 있습니다.", { questions: ["사람들은 왜 이 제도를 필요한 정책이라고 믿나요?"], relatedCategories: ["ideology"] });
  if (ideology.source === "custom" && (text.length < 8 || VAGUE_IDEOLOGY.some((term) => text.includes(term)))) {
    return makeDiagnosis("needs-detail", "정당화 언어", "명분이 아직 일반적이라 제도의 자기 정당화가 약하게 보입니다.", { suggestion: "질서, 안보, 공익, 효율, 자유, 평등 중 무엇을 앞세우는지 적어보세요.", questions: ["반대하는 사람을 비합리적으로 보이게 만드는 명분은 무엇인가요?"], relatedCategories: ["ideology"] });
  }
  const pair = findPair(evaluation, "transformation", "ideology");
  if ((textIncludesAny(text, IDEOLOGY_TERMS) || hasAnyTag(ideology, ["tones", "rights", "functions"])) && transformation) {
    return makeDiagnosis(pair?.score >= 65 ? "strong" : "workable", "정당화 언어", "제도 변화가 내세우는 명분이 보입니다.", { questions: ["이 명분이 실제 변화를 어떻게 설명하거나 가리나요?"], relatedCategories: ["ideology", "transformation"] });
  }
  return makeDiagnosis("workable", "정당화 언어", "명분은 있지만 제도 변화와의 충돌을 더 설명하면 좋습니다.", { questions: ["사회는 왜 이 제도를 필요한 정책이라고 믿나요?"], relatedCategories: ["ideology"] });
}

export function diagnoseCoreThesis(input = {}) {
  const selection = unpackSelection(input);
  const evaluation = input.evaluation || {};
  const ideology = getSelectionOption(selection, "ideology");
  const transformation = getSelectionOption(selection, "transformation");
  if (!ideology && !transformation) return makeDiagnosis("missing", "중심 모순", "명분과 제도 변화가 모두 필요합니다.", { questions: ["무엇을 명분으로 어떤 권리를 바꾸나요?"], relatedCategories: ["ideology", "transformation"] });
  if (!ideology) return makeDiagnosis("missing", "중심 모순", "제도 변화는 보이지만 사회가 이를 정당화하는 명분이 아직 부족합니다.", { questions: ["사회는 왜 이 제도를 좋은 정책이라고 믿나요?"], relatedCategories: ["ideology"] });
  if (!transformation) return makeDiagnosis("missing", "중심 모순", "명분은 보이지만 실제로 어떤 권리나 제도가 바뀌는지 더 구체화하면 중심 모순이 선명해집니다.", { questions: ["어떤 권리가 조건부 자격이 되나요?"], relatedCategories: ["transformation"] });
  const pair = findPair(evaluation, "transformation", "ideology");
  if (pair?.confidence === "low") return makeDiagnosis("uncertain", "중심 모순", "명분과 실제 변화의 연결은 아직 판단할 정보가 부족합니다.", { questions: ["이 명분은 어떤 권리 제한이나 의무 부과를 설명하나요?"], relatedCategories: ["ideology", "transformation"] });
  return makeDiagnosis(pair?.score >= 55 ? "strong" : "workable", "중심 모순", `${getSelectionText(selection, "ideology")}이라는 명분과 ${getSelectionText(selection, "transformation")}이 연결되며, 명분과 실제 결과의 충돌을 만들 수 있습니다.`, {
    reason: "정당화 언어와 실제 변화가 함께 제시되어 있습니다.",
    questions: ["표면의 선의와 실제 손실을 한 문장으로 대비할 수 있나요?"],
    relatedCategories: ["ideology", "transformation"],
  });
}

export function buildPriorityInsight(input = {}) {
  const selection = unpackSelection(input);
  const evaluation = input.evaluation || {};
  const diagnoses = input.diagnoses || {};
  const missing = getMissingCoreCategories(selection);
  if (completedCoreCount(selection) === 0) return { title: "먼저 이 부분을 생각해보세요", message: "조건을 하나 이상 입력하면 세계사 비교 질문을 만들 수 있습니다.", suggestion: "떠오르는 사회 압력, 외부 조건, 집단, 제도 변화 중 하나만 먼저 적어보세요.", questions: ["지금 가장 먼저 떠오르는 조건은 무엇인가요?"] };
  if (missing.length > 0) return { title: "먼저 이 부분을 생각해보세요", message: `${missing[0].label} 항목이 비어 있어 중심 구조가 아직 완성되지 않았습니다.`, suggestion: `${missing[0].label}을 한 문장으로 채워보세요.`, questions: [`${missing[0].label}에는 무엇이 들어가야 하나요?`] };
  const uncertain = evaluation.coreEvaluation?.pairScores?.find((pair) => pair.confidence === "low");
  if (uncertain) return { title: "먼저 이 부분을 생각해보세요", message: `${PAIR_LABELS[pairKey(uncertain)] || uncertain.name} 연결은 아직 판단 근거가 부족합니다.`, suggestion: "두 요소가 왜 직접 이어지는지 한 문장으로 보강해보세요.", questions: ["두 요소 사이의 직접 연결은 무엇인가요?"] };
  const weak = evaluation.coreEvaluation?.pairScores?.find((pair) => pair.confidence !== "low" && pair.score < 35);
  if (weak) return { title: "먼저 이 부분을 생각해보세요", message: `${PAIR_LABELS[pairKey(weak)] || weak.name} 연결이 약하게 보입니다.`, suggestion: "둘 중 하나를 바꾸기보다 연결 이유를 먼저 적어보세요.", questions: ["이 연결을 설명하는 중간 장치는 무엇인가요?"] };
  if (diagnoses.transformation?.status === "needs-detail") return { title: "먼저 이 부분을 생각해보세요", message: "실제 변화가 조금 더 구체적이면 비교 쟁점이 선명해집니다.", suggestion: diagnoses.transformation.suggestion, questions: diagnoses.transformation.questions };
  if (diagnoses.technology?.status === "needs-detail") return { title: "먼저 이 부분을 생각해보세요", message: "외부 조건이 제도에서 맡는 역할을 더 구체화할 수 있습니다.", suggestion: diagnoses.technology.suggestion, questions: diagnoses.technology.questions };
  if (diagnoses.pressureTarget && diagnoses.pressureTarget.status !== "strong") return { title: "먼저 이 부분을 생각해보세요", message: "사회 압력과 영향을 받는 집단의 연결을 더 선명하게 만들 수 있습니다.", suggestion: diagnoses.pressureTarget.suggestion, questions: diagnoses.pressureTarget.questions };
  if (diagnoses.ideology?.status === "needs-detail") return { title: "먼저 이 부분을 생각해보세요", message: "정당화 언어를 더 구체화하면 역사 비교의 기준이 선명해집니다.", suggestion: diagnoses.ideology.suggestion, questions: diagnoses.ideology.questions };
  if (evaluation.scatterRisk >= 45 && evaluation.amplifierEvaluation?.selectedCount >= 3) return { title: "먼저 이 부분을 생각해보세요", message: "작동과 결과 요소가 많아 중심 쟁점이 분산될 수 있습니다.", suggestion: "가장 중요한 요소 1~2개만 남겨도 충분한지 확인해보세요.", questions: ["이 조건에서 가장 중요한 역사 비교 질문은 무엇인가요?"] };
  return { title: "먼저 이 부분을 생각해보세요", message: "큰 구조는 작동합니다. 이제 중심 모순을 한 문장으로 압축해보세요.", suggestion: "표면의 명분과 실제 손실을 대비해보세요.", questions: ["표면의 선의와 실제 피해를 한 문장으로 쓰면 어떻게 되나요?"] };
}

function mapPairList(pairs = [], type) {
  return pairs.map((pair) => {
    const key = pairKey(pair);
    const label = PAIR_LABELS[key] || pair.name || "핵심 연결";
    const message =
      type === "uncertain"
        ? "정보가 부족해 이 연결은 아직 판단하기 어렵습니다."
        : type === "weak"
          ? "이 연결은 설명을 더하면 좋아질 수 있습니다."
          : "두 요소가 같은 문제 영역이나 작동 방향을 공유합니다.";
    return pairToInsight(pair, message);
  });
}

export function getPromptQuestions({ diagnoses = {}, priorityInsight = {}, evaluation = {} } = {}) {
  const questions = [];
  const add = (items = []) => {
    for (const question of items) {
      if (question && !questions.includes(question) && questions.length < 4) questions.push(question);
    }
  };
  for (const diagnosis of Object.values(diagnoses)) {
    if (diagnosis.status === "missing") add(diagnosis.questions);
  }
  add(priorityInsight.questions);
  add(diagnoses.transformation?.questions);
  add(diagnoses.pressureTarget?.questions);
  add(diagnoses.technology?.questions);
  add(diagnoses.ideology?.questions);
  if (evaluation.scatterRisk >= 45) add(["작동과 결과 요소 중 하나만 남긴다면 무엇이 가장 핵심인가요?"]);
  return questions;
}

export function getCoreReflectionQuestions(input) {
  return getPromptQuestions(input);
}

function assertCleanLanguage(value) {
  const banned = ["실패", "틀렸", "나쁨", "무효", "창의성이 부족", "비현실적"];
  const text = JSON.stringify(value);
  return !banned.some((word) => text.includes(word));
}

export function buildInterpretation({ formState = {}, resolvedInputs = {}, evaluation = {} } = {}) {
  const inputSnapshot = clone({ formState, resolvedInputs, evaluation });
  const selection = resolvedInputs.selection ? resolvedInputs.selection : resolvedInputs;
  const diagnoses = {
    pressureTarget: diagnosePressureTarget({ selection, evaluation }),
    technology: diagnoseTechnology({ selection, evaluation }),
    transformation: diagnoseTransformation({ selection, evaluation }),
    ideology: diagnoseIdeology({ selection, evaluation }),
  };
  const coreThesisDiagnosis = diagnoseCoreThesis({ selection, evaluation });
  const priorityInsight = buildPriorityInsight({ selection, evaluation, diagnoses });
  const pairScores = evaluation.coreEvaluation?.pairScores || [];
  const strengths = mapPairList(pairScores.filter((pair) => pair.confidence !== "low" && pair.score >= 65), "strong");
  const needsExplanation = mapPairList(pairScores.filter((pair) => pair.confidence !== "low" && pair.score < 35), "weak");
  const uncertain = mapPairList(pairScores.filter((pair) => pair.confidence === "low"), "uncertain");
  const interpretation = {
    headline: getInterpretationHeadline(evaluation, selection),
    tone: getInterpretationTone(evaluation, selection),
    overview: buildOverview(selection),
    priorityInsight,
    coreThesisDiagnosis,
    categoryDiagnoses: diagnoses,
    strengths,
    needsExplanation,
    uncertain,
    reflectionQuestions: getPromptQuestions({ diagnoses: { ...diagnoses, coreThesisDiagnosis }, priorityInsight, evaluation }),
    missingCoreCategories: getMissingCoreCategories(selection),
    metadata: {
      confidence: evaluation.confidence || "low",
      compatibility: typeof evaluation.compatibility === "number" ? evaluation.compatibility : 0,
      evidenceCoverage: typeof evaluation.evidenceCoverage === "number" ? evaluation.evidenceCoverage : 0,
      scatterRisk: typeof evaluation.scatterRisk === "number" ? evaluation.scatterRisk : 0,
    },
  };
  if (!assertCleanLanguage(interpretation)) throw new Error("Interpretation contains forbidden wording.");
  if (JSON.stringify(inputSnapshot) !== JSON.stringify({ formState, resolvedInputs, evaluation })) {
    throw new Error("buildInterpretation must not mutate input.");
  }
  return interpretation;
}

function limitItems(items = [], max = 2) {
  const safeItems = Array.isArray(items) ? items : [];
  const visible = safeItems.slice(0, max);
  const remaining = Math.max(0, safeItems.length - visible.length);
  return {
    items: visible,
    remaining,
    total: safeItems.length,
  };
}

function compactPriority(priorityInsight = {}) {
  return {
    title: toDisplayText(priorityInsight.title) || "먼저 이 부분을 생각해보세요",
    message: toDisplayText(priorityInsight.message),
    suggestion: toDisplayText(priorityInsight.suggestion),
  };
}

function compactThesis(coreThesisDiagnosis = {}) {
  return {
    status: coreThesisDiagnosis.status || "uncertain",
    title: toDisplayText(coreThesisDiagnosis.title) || "중심 모순",
    message: toDisplayText(coreThesisDiagnosis.message),
    suggestion: toDisplayText(coreThesisDiagnosis.suggestion),
  };
}

export function buildCompactInterpretationView(interpretation = {}) {
  const snapshot = clone(interpretation || {});
  const compact = {
    headline: toDisplayText(interpretation.headline),
    tone: interpretation.tone || "neutral",
    priority: compactPriority(interpretation.priorityInsight),
    thesis: compactThesis(interpretation.coreThesisDiagnosis),
    strengths: limitItems(interpretation.strengths, 2),
    needsExplanation: limitItems(interpretation.needsExplanation, 2),
    uncertain: limitItems(interpretation.uncertain, 2),
    questions: limitItems(interpretation.reflectionQuestions, 3),
    detailCounts: {
      strengths: Array.isArray(interpretation.strengths) ? interpretation.strengths.length : 0,
      needsExplanation: Array.isArray(interpretation.needsExplanation) ? interpretation.needsExplanation.length : 0,
      uncertain: Array.isArray(interpretation.uncertain) ? interpretation.uncertain.length : 0,
      questions: Array.isArray(interpretation.reflectionQuestions) ? interpretation.reflectionQuestions.length : 0,
    },
  };
  if (JSON.stringify(snapshot) !== JSON.stringify(interpretation || {})) {
    throw new Error("buildCompactInterpretationView must not mutate input.");
  }
  return compact;
}
