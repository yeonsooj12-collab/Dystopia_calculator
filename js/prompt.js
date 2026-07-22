const GROUP_KEYS = {
  core: ["pressure", "target", "technology", "transformation", "ideology"],
  details: ["actor", "mechanism", "metric", "benefit", "careNarrative"],
  amplifiers: ["classDistortion", "feedbackLoop", "victimInternalization", "irreversibility"],
};

const CATEGORY_LABELS = {
  pressure: "사회 압력",
  target: "영향을 받는 집단",
  technology: "외부 조건",
  periodScope: "우선 시대 범위",
  regionScope: "우선 지역 범위",
  transformation: "실제 변화",
  ideology: "정당화 언어",
  actor: "주도 행위자",
  mechanism: "통치 수단",
  metric: "분류 기준",
  benefit: "공식 효용",
  careNarrative: "저항·균열",
  classDistortion: "분배 불균형",
  feedbackLoop: "반복 효과",
  victimInternalization: "내면화",
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
      minItems: 3,
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
          "historicalCases",
          "similarities",
          "differences",
          "humanBehaviorPattern",
          "futureInsight",
          "verificationKeywords",
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
          historicalCases: {
            type: "array",
            minItems: 1,
            maxItems: 2,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "period", "region", "context", "insight", "verificationKeywords"],
              properties: {
                title: { type: "string" },
                period: { type: "string" },
                region: { type: "string" },
                context: { type: "string" },
                insight: { type: "string" },
                verificationKeywords: { type: "array", minItems: 1, maxItems: 5, items: { type: "string" } },
              },
            },
          },
          similarities: { type: "array", minItems: 1, maxItems: 2, items: { type: "string" } },
          differences: { type: "array", minItems: 1, maxItems: 2, items: { type: "string" } },
          humanBehaviorPattern: { type: "string" },
          futureInsight: { type: "string" },
          verificationKeywords: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
        },
      },
    },
    unresolvedElements: { type: "array", items: { type: "string" } },
    editorNote: { type: "string" },
  },
};

export const HISTORY_AXIS_FINDER_RESPONSE_JSON_SCHEMA = AXIS_FINDER_RESPONSE_JSON_SCHEMA;

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
    historicalCases: normalizeHistoricalCases(axis.historicalCases),
    similarities: sanitizeList(axis.similarities, 2),
    differences: sanitizeList(axis.differences, 2),
    humanBehaviorPattern: sanitizePromptText(axis.humanBehaviorPattern, 260),
    futureInsight: sanitizePromptText(axis.futureInsight, 260),
    verificationKeywords: sanitizeList(axis.verificationKeywords, 5),
  };
}

function normalizeHistoricalCases(cases) {
  if (!Array.isArray(cases)) return [];
  return cases
    .slice(0, 2)
    .map((item) => ({
      title: sanitizePromptText(item?.title || item, 120),
      period: sanitizePromptText(item?.period, 80),
      region: sanitizePromptText(item?.region, 80),
      context: sanitizePromptText(item?.context, 240),
      insight: sanitizePromptText(item?.insight, 240),
      verificationKeywords: sanitizeList(item?.verificationKeywords, 3),
    }))
    .filter((item) => item.title || item.context || item.insight);
}

export function normalizeAxisFinderResponse(response = {}) {
  const source = response && typeof response === "object" && !Array.isArray(response) ? response : {};
  return {
    version: sanitizePromptText(source.version) || "1.0",
    status: ["success", "incomplete", "fallback", "error"].includes(source.status) ? source.status : "error",
    interpretationMode: "axis-finder",
    overview: sanitizePromptText(source.overview, 320),
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
  if (Array.isArray(response?.axes) && response.axes.length !== 3) issues.push("axes must contain exactly 3 items.");
  for (const [index, axis] of (response?.axes || []).entries()) {
    if (!axis || typeof axis !== "object" || Array.isArray(axis)) issues.push(`axis ${index + 1} must be an object.`);
    for (const key of ["id", "title", "coreInsight", "centralContradiction", "bridge", "whyThisAxisMatters", "specificQuestion"]) {
      if (typeof axis?.[key] !== "string") issues.push(`axis ${index + 1} ${key} must be a string.`);
    }
    for (const key of ["usedElements", "deferredElements", "assumptions"]) {
      if (!Array.isArray(axis?.[key])) issues.push(`axis ${index + 1} ${key} must be an array.`);
    }
    if (Array.isArray(axis?.assumptions) && axis.assumptions.length > 2) issues.push(`axis ${index + 1} assumptions must be 2 or fewer.`);
    if (!Array.isArray(axis?.historicalCases) || axis.historicalCases.length < 1) issues.push(`axis ${index + 1} historicalCases must contain at least 1 item.`);
    for (const [caseIndex, historicalCase] of (axis?.historicalCases || []).entries()) {
      if (!historicalCase || typeof historicalCase !== "object" || Array.isArray(historicalCase)) issues.push(`axis ${index + 1} historicalCases ${caseIndex + 1} must be an object.`);
      for (const key of ["title", "period", "region", "context", "insight"]) {
        if (typeof historicalCase?.[key] !== "string") issues.push(`axis ${index + 1} historicalCases ${caseIndex + 1} ${key} must be a string.`);
      }
      if (!Array.isArray(historicalCase?.verificationKeywords) || historicalCase.verificationKeywords.length < 1) {
        issues.push(`axis ${index + 1} historicalCases ${caseIndex + 1} verificationKeywords must contain at least 1 item.`);
      }
    }
    for (const key of ["similarities", "differences", "verificationKeywords"]) {
      if (!Array.isArray(axis?.[key]) || axis[key].length < 1) issues.push(`axis ${index + 1} ${key} must contain at least 1 item.`);
    }
    for (const key of ["humanBehaviorPattern", "futureInsight"]) {
      if (typeof axis?.[key] !== "string") issues.push(`axis ${index + 1} ${key} must be a string.`);
    }
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
  const selectedOptions = Array.isArray(item.selectedOptions)
    ? item.selectedOptions
        .map((option) => sanitizePromptText(option.label || option.value || option, 120))
        .filter(Boolean)
    : [];
  return {
    field: key,
    categoryLabel: CATEGORY_LABELS[key] || key,
    value,
    selectedOptions,
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

function buildSupplementalScopeFacts(formState = {}) {
  return ["periodScope", "regionScope"]
    .map((key) => {
      const item = formState[key] || {};
      const value = sanitizePromptText(item.customText || item.optionId, 180);
      if (!value) return null;
      return {
        field: key,
        categoryLabel: CATEGORY_LABELS[key] || key,
        value,
        source: "custom",
      };
    })
    .filter(Boolean);
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
  const supplementalScope = buildSupplementalScopeFacts(formState);
  const confirmedClues = buildRuleBasedClues({ evaluation, interpretation, aiInput });
  const unresolvedConnections = buildUnresolvedConnections({ interpretation, aiInput });
  const brief = {
    version: "1.0",
    status: Object.values(inputFacts).flat().length > 0 ? "ready" : "empty",
    inputFacts,
    supplementalScope,
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
  if (!Array.isArray(brief?.supplementalScope)) issues.push("supplementalScope must be an array.");
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
      return `${group}:\n${items.map((item) => {
        const value = item.selectedOptions?.length ? item.selectedOptions.join(", ") : item.value;
        return `- ${item.categoryLabel}: ${value} (${item.source})${item.description ? ` / ${item.description}` : ""}`;
      }).join("\n")}`;
    })
    .join("\n\n");
}

export function buildFullChatGptPrompt(editorialBrief) {
  const brief = clone(editorialBrief);
  const validation = validateEditorialBrief(brief);
  if (!validation.ok) throw new Error(validation.issues.join(", "));
  return [
    "역할",
    "당신은 세계사 공부 방향을 빠르게 골라주는 분석 편집자다. 지금 단계는 깊은 해설이 아니라 2차 탐색으로 넘길 쟁점 후보를 만드는 빠른 색인 작업이다.",
    "사용자 입력을 하나의 이야기로 합치지 말고, 세계사의 사건, 제도, 생활상, 사조, 예술, 종교, 관습, 물질문화와 비교해볼 수 있는 서로 다른 쟁점 3개로 나눈다.",
    "사람이나 집단을 평가하지 않는다. 제도, 권력, 시장, 행정, 기술, 문화가 사람을 어떻게 분류하고 다루는지만 말한다.",
    "근거가 불확실한 사건명·연도·책·논문·URL·각주·참고문헌 번호를 만들지 않는다. 확인이 필요하면 verificationKeywords에 검색어만 남긴다.",
    "출력은 유효한 JSON 객체 하나뿐이다. 표준 큰따옴표를 쓰고, JSON 앞뒤 설명, 코드펜스, 참고문헌, 각주를 붙이지 않는다.",
    "",
    "1차 작업 범위",
    "- 목표는 빠른 후보 생성이다. 깊은 전후 맥락과 긴 역사 해설은 2차 프롬프트에서 다룬다.",
    "- axes는 정확히 3개만 만든다.",
    "- 각 axis는 서로 다른 역사 학습 질문이어야 한다.",
    "- 모든 입력 요소를 억지로 쓰지 않는다. 실제 쟁점에 쓰인 요소는 usedElements, 아직 보류할 요소는 deferredElements에 넣는다.",
    "- bridge는 한두 문장으로 쓴다. 현실 조건에서 왜 이 역사 렌즈로 넘어갈 수 있는지만 말한다.",
    "- historicalCases는 axis마다 1~2개만 쓴다. 각 사례의 context와 insight는 각각 1문장으로 제한한다.",
    "- similarities와 differences는 각각 1~2개만 쓴다.",
    "- humanBehaviorPattern과 futureInsight는 각각 1~2문장만 쓴다.",
    "- specificQuestion은 2차에서 더 파고들 질문 하나만 쓴다.",
    "",
    "선택 기준",
    "1. 입력된 영향을 받는 집단이 중심에 있는가",
    "2. 현실의 제도·시장·행정·문화 조건에서 적은 비약으로 이어지는가",
    "3. 역사 공부로 넓힐 수 있는 사건·제도·생활상·문화 패턴이 있는가",
    "4. 같은 사례나 같은 논리를 반복하지 않는가",
    "",
    "사실성과 레퍼런스 원칙",
    "- 확실히 아는 사례만 구체명으로 쓴다.",
    "- 확실하지 않으면 '전시 배급 체제', '검역과 이동 제한', '대중교육과 시민 형성'처럼 넓은 검증 가능 패턴으로 낮춰 쓴다.",
    "- 확인하지 않은 참고문헌 번호, URL, 저자명, 책 제목, 논문 제목, 직접 인용문을 절대 만들지 않는다.",
    "- 응답 끝에 [1], [2] 같은 참고문헌 목록을 붙이지 않는다.",
    "- 확실한 역사 사실과 비교 가설을 섞어 단정하지 않는다.",
    "",
    "필드별 길이 제한",
    "- overview: 최대 2문장.",
    "- title: 30자 안팎.",
    "- coreInsight: 최대 2문장.",
    "- centralContradiction: 한 문장.",
    "- bridge: 최대 2문장.",
    "- whyThisAxisMatters: 최대 2문장.",
    "- historicalCases: 1~2개. context와 insight는 각각 한 문장.",
    "- similarities: 최대 2개.",
    "- differences: 최대 2개.",
    "- verificationKeywords: 3~5개.",
    "- unresolvedElements: 최대 5개.",
    "- editorNote: 최대 2문장.",
    "",
    "금지",
    "- 완성된 장문 해설을 쓰지 않는다.",
    "- 점수나 등급을 매기지 않는다.",
    "- 사용자 입력을 다른 조건이나 집단으로 바꾸지 않는다.",
    "- 유명한 역사 비유에 맞추려고 중간 제도나 가정을 새로 발명하지 않는다.",
    "- 같은 내용을 여러 필드에서 반복하지 않는다.",
    "- 어떤 문자열 필드에도 생성 과정 설명이나 정렬 보고를 쓰지 않는다.",
    "",
    "사용자 입력 사실",
    formatFacts(brief.inputFacts),
    "",
    "사용자가 지정한 시대·지역 범위 힌트",
    brief.supplementalScope?.length
      ? brief.supplementalScope.map((item) => `- ${item.categoryLabel}: ${item.value}`).join("\n")
      : "없음",
    "",
    "규칙 기반 단서",
    JSON.stringify(brief.confirmedClues, null, 2),
    "",
    "AI가 해석해야 할 낯선 연결",
    JSON.stringify([...brief.unusualConnections, ...brief.unresolvedConnections], null, 2),
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
    "- 입력 사회 압력을 인접 문제로 교체하지 않았는가?",
    "- usedElements는 실제 인과관계에 참여하는가?",
    "- 중심 인과관계의 명확성이 요소 사용률보다 앞서는가?",
    "- bridge가 하나의 현실적인 주요 제도 경로만 쓰는가?",
    "- 중대한 가정을 assumptions로 통과시키지 않았는가?",
    "- 모든 axis가 입력된 영향을 받는 집단을 중심에 두는가?",
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
    axes: [selectedAxis, selectedAxis, selectedAxis],
    unresolvedElements: [],
    editorNote: "",
  });
  if (!selectedAxis.title || !selectedAxis.centralContradiction || axisValidation.issues.some((issue) => issue.includes("axis 1"))) {
    throw new Error("selected axis is invalid.");
  }
  return [
    "역할",
    "당신은 선택된 역사적 쟁점 하나를 세계사 렌즈로 더 깊게 읽어주는 사회·정치·제도·문화·역사 분석 편집자다.",
    "이 단계의 목적은 선택된 쟁점과 닮은 인간사의 주요 사건, 제도, 통치 방식, 생활상, 사조, 예술, 종교, 관습, 권리 제한과 저항의 논리를 사용자가 바로 읽고 공부할 수 있게 설명하는 것이다.",
    "제도의 영향을 받는 사람을 평가하거나 조롱하지 말고, 제도와 권력 구조가 사람을 어떻게 분류하고 다루었는지 분석한다.",
    "목표는 세계사를 통해 인간의 행동양식, 권력의 반복 패턴, 위기 속 제도 선택, 생활 세계의 적응, 문화 표현의 변화를 이해하고, 그 이해를 앞으로의 사회를 읽는 통찰로 잇는 것이다.",
    "세계사 렌즈 설명에는 제도의 작동뿐 아니라 그 제도가 한 사람의 권리, 관계, 시간, 이동, 생존 전략, 감정, 의례, 표현, 선택권 중 무엇을 바꾸었는지 포함한다.",
    "특정 역사 사건이나 문화 현상과 동일하다고 단정하지 않는다. 반드시 닮은 점과 다른 점을 함께 쓴다.",
    "사건명, 제도명, 작품명, 사조명, 시대가 확실하지 않으면 특정명을 만들지 말고 더 넓은 역사적 패턴으로 설명한다.",
    "현실 구조, 행위자의 이해관계, 외부 조건의 역할, 권한 경로, 비용 이전과 책임 공백, 생활 방식과 문화 표현을 충분히 검토한 뒤, 역사 장면의 앞뒤 맥락이 잘리지 않게 설명한다.",
    "근거가 있는 사실만 역사 사례나 문화 사례로 제시한다. 기억이 불확실하면 특정 사례명으로 쓰지 말고 넓은 역사적 패턴으로 낮춰 말한다.",
    "출처나 인용을 꾸며내지 않는다. 확인이 필요한 내용은 검증할 검색 키워드나 확인 질문으로 남긴다.",
    "",
    "선택된 역사적 쟁점",
    JSON.stringify(selectedAxis, null, 2),
    "",
    "원래 편집 브리프",
    JSON.stringify(brief, null, 2),
    "",
    "작성 원칙",
    "- JSON으로 답하지 않는다. 사용자가 AI 채팅창에서 바로 읽을 수 있는 한국어 해설로 쓴다.",
    "- 선택된 쟁점만 세계사 렌즈로 더 읽는다.",
    "- usedElements를 중심으로 작성한다.",
    "- deferredElements를 자동으로 다시 넣지 않는다.",
    "- deferredElements는 꼭 필요할 때만 1~2개까지 보조 비교 질문으로 언급할 수 있다.",
    "- 추가하는 경우 왜 필요한지 명시한다.",
    "- 사용자 입력과 AI가 세운 비교 가정은 구분한다.",
    "- 선택된 axis의 약한 연결을 더 그럴듯한 역사 비유로 덮지 않는다.",
    "- 새로운 중대한 가정을 추가해야만 역사 비교가 성립한다면 그 가정을 추가하지 말고 해당 요소를 중심 비교에서 제외한다.",
    "",
    "답변 형식",
    "아래 제목을 그대로 사용하되 JSON, 코드펜스, 스키마, 객체, 배열로 답하지 않는다.",
    "",
    "1. 핵심 요지",
    "- 선택된 쟁점이 어떤 역사 학습 질문으로 바뀌는지 3~5문장으로 쓴다.",
    "- 반복되는 긴장이나 핵심 인사이트를 말하되, 이것을 정답처럼 단정하지 않는다.",
    "",
    "2. 비교할 세계사 장면",
    "- 사건, 제도, 생활상, 사조, 예술, 종교, 관습, 물질문화 중에서 비교할 장면 2~4개를 고른다.",
    "- 각 장면은 별도 문단으로 나눈다.",
    "- 각 문단에는 시대·지역·행위자·제도 또는 문화 형식·전후 상황·결과를 포함한다.",
    "- 각 문단에는 무엇이 닮았는지와 무엇이 다른지를 모두 쓴다.",
    "- 특정 사건명, 작품명, 사조명이 불확실하면 더 넓은 역사적 패턴으로 낮춰 말한다.",
    "",
    "3. 앞뒤 맥락",
    "- 사례들이 왜 그 시점에 나타났는지 설명한다.",
    "- 전쟁, 재정, 무역, 이주, 기술, 행정 능력, 사회운동, 종교 의례, 소비문화, 예술 양식 같은 조건을 필요한 만큼 연결한다.",
    "- 사건이나 문화 현상의 결과뿐 아니라 그 이전의 압력과 이후의 반작용을 함께 쓴다.",
    "",
    "4. 닮은 점과 결정적인 차이",
    "- 입력 조건과 역사 장면의 닮은 점을 정리한다.",
    "- 단순 동일시를 막기 위해 결정적인 차이를 따로 정리한다.",
    "- 피해 규모, 법적 지위, 국가 역량, 폭력 수준, 국제 질서가 다르면 반드시 말한다.",
    "",
    "5. 확인할 키워드",
    "- 사용자가 직접 더 찾아볼 수 있는 검색 키워드 5~8개를 제시한다.",
    "- 책 제목, 논문 제목, 정확한 인용문은 직접 확인하지 않았다면 만들지 않는다.",
    "",
    "6. 더 공부할 질문",
    "- 이 쟁점을 더 깊게 공부하기 위한 질문 3~5개를 제시한다.",
    "- 질문은 행위자의 이해관계, 영향을 받는 집단, 제도의 실패, 생활 방식의 변화, 문화 표현, 저항과 균열, 현재와의 차이를 확인하게 만든다.",
    "",
    "입력 사회 압력 대체 금지",
    "- 입력된 사회 압력을 유사하거나 인접한 다른 문제로 조용히 교체하지 않는다.",
    "- 인접 문제가 논리 연결에 꼭 필요하다면 '비교의 한계'나 '더 확인할 조건'으로 명시한다.",
    "- 사회 압력이 선택한 쟁점에 직접 기여하지 않으면 원본 입력으로 보존하되 역사 비교의 중심 근거처럼 쓰지 않는다.",
    "- 사회 압력을 배경에서 한 번 언급한 것만으로 중심 인과관계에 사용했다고 처리하지 않는다.",
    "- 사용한 사회 압력이 중심 인과관계에서 어떤 역할을 하는지 본문에 보여준다.",
    "",
    "2차 충실성 검사",
    "- 선택된 axis의 사회 압력 연결이 실제 인과관계인지 확인한다.",
    "- 1차에서 보류했어야 할 요소를 다시 끌어오지 않는다.",
    "- 역사 비유의 비약을 긴 문장으로 숨기고 있지 않은지 확인한다.",
    "- 약한 연결이 발견되면 해당 요소를 중심 인과관계에서 제외한다.",
    "- 제외한 요소는 원본 입력으로 남길 수 있지만 세계사 렌즈 설명에는 억지로 사용하지 않는다.",
    "- 내용상의 한계 설명을 짧게 쓴다. 예: 이 조건은 강제 이주 사례와 닮은 행정 논리를 갖지만, 특정 역사적 폭력과 동일하다고 말해서는 안 된다.",
    "",
    "2차 비교 우선순위",
    "1. 중심 인과관계의 명확성",
    "2. 역사적 비교 기준의 명확성",
    "3. 사회 압력과 영향을 받는 집단의 충실한 사용",
    "4. 나머지 입력 요소의 사용률",
    "- 하위 기준을 만족하기 위해 상위 기준을 훼손하지 않는다.",
    "- 강한 결론을 보존하려고 정책 경로를 사후 발명하지 않는다.",
    "- 영향을 받는 집단은 계속 중심에 둔다. 왜 하필 이 집단이 영향을 받는지 보여준다.",
    "- usedElements는 인과사슬의 필수 노드일 때만 중심 서술에 사용한다.",
    "",
    "2차 사실성과 검증 가능성",
    "- 사건명, 제도명, 작품명, 사조명, 연도, 지역, 행위자를 확실히 아는 경우에만 구체명으로 쓴다.",
    "- 확실하지 않으면 특정명 대신 검증 가능한 넓은 역사적 패턴으로 쓴다.",
    "- 역사 사례와 문화 사례를 제시할 때는 시대, 지역, 행위자, 제도, 생활상, 문화 표현, 결과를 가능한 한 구분한다.",
    "- 확실히 아는 대표 키워드만 제시하고, 구체 출처가 필요하면 사용자가 확인할 검색어를 남긴다.",
    "- 검증 키워드는 출처 목록이 아니라 사용자가 직접 확인할 검색 출발점임을 전제로 쓴다.",
    "- 출처를 직접 확인하지 않은 상태에서 책 제목, 논문 제목, 정확한 문장 인용을 만들지 않는다.",
    "",
    "2차 매우 엄격한 레퍼런스 원칙",
    "- 확인하지 않은 참고문헌 번호, URL, 책 제목, 논문 제목, 기사 제목, 저자명, 쪽수, 직접 인용문을 절대 만들지 않는다.",
    "- 답변 끝에 [1], [2] 같은 가짜 각주나 참고문헌 목록을 붙이지 않는다.",
    "- 확실한 역사 사실과 비교 가설을 문장 안에서 구분한다. 예: '확인된 사례로는'과 '비교해볼 패턴으로는'을 혼동하지 않는다.",
    "- 고유명사의 기억이 불확실하면 쓰지 말고, 사용자가 검증할 수 있는 시대·지역·제도·키워드 조합으로 낮춰 말한다.",
    "- 각 사례에는 사용자가 바로 검색해 확인할 수 있는 검증 키워드를 자연스럽게 포함한다.",
    "",
    "2차 금지",
    "- JSON으로 답하지 않는다.",
    "- 분석 없이 역사 사례나 문화 사례 이름만 나열하지 않는다.",
    "- 새 기관 이름을 만드는 것으로 논리의 빈틈을 메우지 않는다.",
    "- 외부 조건, 정당화 언어, 공식 효용을 장식처럼 쓰지 않는다.",
    "- 모든 입력 요소를 강제로 통합하지 않는다.",
    "- 역사 사건이나 문화 표현을 소재처럼 소비하지 않는다.",
    "- '이 설정은 홀로코스트와 같다'처럼 거대한 폭력과 단순 동일시하지 않는다.",
    "- 확인되지 않은 사건명, 작품명, 사조명이나 연도를 지어내지 않는다.",
    "- 서로 다른 재정·보험·법률 체계를 설명 없이 통합하지 않는다.",
    "- 새로운 기관·기금·면허·급여체계로 bridge를 보강하지 않는다.",
    "- 생성 과정 설명이나 정렬 보고를 쓰지 않는다.",
    "- 금지 문구: 제공된 편집 브리프에 근거한다, 선택된 방향의 범위를 따른다, 업로드된 자료에 맞추었다, 원본 브리프와 정렬했다, source alignment, 사용자 입력에 충실하게 작성했다, 요청된 구조를 따랐다, 이 응답은 앞 단계 결과를 기반으로 한다.",
    "",
    "출력 지시",
    "- 자체검사 결과는 출력하지 않는다.",
    "- 분석은 충분히 했지만 표현은 압축했는가?",
    "- 같은 설명을 여러 구역에서 반복하지 않았는가?",
    "- 메타 문장이 들어가지 않았는가?",
    "- 입력 사회 압력을 인접 문제로 교체하지 않았는가?",
    "- usedElements는 실제 인과관계에 참여하는가?",
    "- 약한 연결을 장문으로 은폐하지 않았는가?",
    "- 새로운 중대한 가정을 추가하지 않았는가?",
    "- 약한 요소는 세계사 렌즈 본문의 중심에서 제외했는가?",
    "- 영향을 받는 집단이 계속 중심에 있는가?",
    "- 사건명·작품명·사조명·연도·제도명을 확실하지 않은데 구체명으로 쓰지 않았는가?",
    "- 검증할 검색 키워드나 비교 키워드를 남겼는가?",
    "지금부터 바로 사용자가 읽을 수 있는 한국어 해설을 작성한다.",
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

function extractFirstJsonObject(text) {
  const source = stripMarkdownCodeFence(text);
  if (!source) return "";
  const start = source.indexOf("{");
  if (start < 0) return source.trim();
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }
    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1).trim();
    }
  }
  return source.trim();
}

function normalizeJsonLikeText(text) {
  return String(text || "")
    .replace(/[\u201c\u201d\u201e\u2033]/g, "\"")
    .replace(/[\u2018\u2019\u201a\u2032]/g, "'");
}

function hasForbiddenField(value) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasForbiddenField);
  return Object.keys(value).some((key) => FORBIDDEN_RESPONSE_FIELDS.has(key) || hasForbiddenField(value[key]));
}

export function parsePastedAiResponse(text) {
  const cleaned = normalizeJsonLikeText(extractFirstJsonObject(text));
  if (!cleaned) return { ok: false, errorType: "empty", message: "AI 채팅 응답을 먼저 붙여 넣어주세요." };
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { ok: false, errorType: "parse", message: "JSON 형식으로 읽을 수 없습니다. AI가 반환한 JSON 전체를 복사했는지 확인해주세요." };
  }
  if (hasForbiddenField(parsed)) {
    return { ok: false, errorType: "forbidden-fields", message: "점수형 응답이 포함되어 있어 적용하지 않았습니다." };
  }
  if (parsed?.interpretationMode === "axis-finder") {
    const rawAxisValidation = validateAxisFinderResponse(parsed);
    if (!rawAxisValidation.ok) {
      return {
        ok: false,
        errorType: "schema",
        message: `역사적 쟁점 응답 구조에 필요한 항목이 없습니다. 전체 요청문을 다시 사용해 해석해주세요. 누락 예: ${rawAxisValidation.issues.slice(0, 3).join(" / ")}`,
        issues: rawAxisValidation.issues,
      };
    }
    const normalizedAxis = normalizeAxisFinderResponse(parsed);
    const normalizedAxisValidation = validateAxisFinderResponse(normalizedAxis);
    if (!normalizedAxisValidation.ok) {
      return {
        ok: false,
        errorType: "schema",
        message: `역사적 쟁점 응답 구조에 필요한 항목이 없습니다. 전체 요청문을 다시 사용해 해석해주세요. 누락 예: ${normalizedAxisValidation.issues.slice(0, 3).join(" / ")}`,
        issues: normalizedAxisValidation.issues,
      };
    }
    return { ok: true, value: normalizedAxis };
  }
  return {
    ok: false,
    errorType: "wrong-mode",
    message: "앱에는 1차 axis-finder JSON만 붙여 넣습니다. 선택한 쟁점의 2차 해설은 AI 채팅창에서 바로 읽어주세요.",
  };
}

export const PROMPT_FORBIDDEN_PATTERNS = BAD_PROMPT_PATTERNS;
