/**
 * @typedef {Object} SatireOption
 * @property {string} id - Unique kebab-case identifier inside its category.
 * @property {string} label - Korean display name.
 * @property {string} description - One-line explanation for users and prompts.
 * @property {string[]} domains - Social domain tags.
 * @property {string[]} functions - Functional tags used by the compatibility engine.
 * @property {string[]} rights - Related rights tags.
 * @property {string[]} tones - Satirical justification tone tags.
 * @property {number} plausibility - Real-world plausibility, from 0 to 1.
 * @property {number} novelty - Idea freshness, from 0 to 1.
 * @property {number} madness - Satirical intensity, from 0 to 1.
 * @property {string[]=} needs - Needs created by a structural pressure.
 * @property {string[]=} enables - Functions enabled by a technology or environment.
 * @property {string[]=} mechanisms - Mechanisms used by a rights or institution transformation.
 */

export const commonTags = {
  domains: [
    "aging",
    "labor",
    "healthcare",
    "housing",
    "reproduction",
    "climate",
    "finance",
    "governance",
    "identity",
    "privacy",
    "migration",
    "community",
    "education",
    "environment",
    "digital-life",
  ],
  functions: [
    "reduce-cost",
    "allocate",
    "relocate",
    "monitor",
    "predict",
    "score",
    "exclude",
    "automate",
    "replicate",
    "edit",
    "insure",
    "license",
    "trade",
    "inherit",
    "incentivize",
    "ration",
    "separate",
    "optimize",
    "enforce",
    "personalize",
  ],
  rights: [
    "residence",
    "healthcare",
    "reproduction",
    "privacy",
    "identity",
    "memory",
    "citizenship",
    "mobility",
    "labor",
    "death",
    "deletion",
    "environment",
    "human-contact",
  ],
  tones: [
    "utilitarianism",
    "meritocracy",
    "technocracy",
    "paternalism",
    "marketization",
    "collectivism",
    "generational-conflict",
    "ecological-morality",
    "risk-management",
    "dataism",
    "welfare-language",
    "pioneerism",
  ],
};

export const categoryDefinitions = [
  { id: "pressures", label: "구조적 문제", group: "core", required: false },
  { id: "targets", label: "대상", group: "core", required: false },
  { id: "technologies", label: "미래 기술·환경", group: "core", required: false },
  { id: "transformations", label: "권리·제도 변환", group: "core", required: false },
  { id: "ideologies", label: "정당화 이념", group: "core", required: false },
  { id: "actors", label: "실행 주체", group: "detail", required: false },
  { id: "metrics", label: "평가 지표", group: "detail", required: false },
  { id: "mechanisms", label: "실행 방식", group: "detail", required: false },
  { id: "benefits", label: "공식 효용", group: "detail", required: false },
  { id: "careNarratives", label: "돌봄 서사", group: "detail", required: false },
  { id: "classDistortions", label: "계층 왜곡", group: "amplifier", required: false },
  { id: "feedbackLoops", label: "피드백 루프", group: "amplifier", required: false },
  { id: "victimInternalizations", label: "제도 논리의 자기내면화", group: "amplifier", required: false },
  { id: "irreversibilities", label: "비가역성", group: "amplifier", required: false },
];

/** @type {SatireOption[]} */
export const pressures = [
  { id: "aging-society", label: "고령화", description: "인구 구조가 늙어가며 돌봄과 재정 부담이 사회의 중심 압력이 된다.", domains: ["aging", "healthcare", "finance"], functions: ["reduce-cost", "allocate", "predict"], rights: ["healthcare", "death"], tones: ["utilitarianism", "welfare-language", "risk-management"], plausibility: 0.95, novelty: 0.42, madness: 0.38, needs: ["reduce-cost", "allocate", "monitor"] },
  { id: "low-birthrate", label: "저출산", description: "출산과 양육이 개인 선택이 아니라 국가 생존 지표처럼 취급된다.", domains: ["reproduction", "governance", "finance"], functions: ["incentivize", "score", "allocate"], rights: ["reproduction", "privacy"], tones: ["collectivism", "generational-conflict", "welfare-language"], plausibility: 0.93, novelty: 0.48, madness: 0.44, needs: ["incentivize", "score", "ration"] },
  { id: "ai-unemployment", label: "AI 실업", description: "인간 노동의 필요가 줄어들며 생계와 자격의 기준이 흔들린다.", domains: ["labor", "digital-life", "education"], functions: ["automate", "score", "exclude"], rights: ["labor", "human-contact"], tones: ["technocracy", "meritocracy", "dataism"], plausibility: 0.9, novelty: 0.55, madness: 0.5, needs: ["automate", "score", "personalize"] },
  { id: "medical-cost-surge", label: "의료비 폭증", description: "치료 가능성은 늘지만 접근권은 비용과 예측 점수에 묶인다.", domains: ["healthcare", "finance", "aging"], functions: ["insure", "ration", "predict"], rights: ["healthcare", "privacy"], tones: ["risk-management", "marketization", "paternalism"], plausibility: 0.92, novelty: 0.44, madness: 0.45, needs: ["insure", "predict", "ration"] },
  { id: "pension-depletion", label: "연금 고갈", description: "세대 간 계약이 무너지며 노후 권리가 조건부 혜택으로 재정의된다.", domains: ["aging", "finance", "governance"], functions: ["allocate", "score", "incentivize"], rights: ["healthcare", "death"], tones: ["generational-conflict", "utilitarianism", "risk-management"], plausibility: 0.91, novelty: 0.46, madness: 0.42, needs: ["allocate", "score", "reduce-cost"] },
  { id: "climate-crisis", label: "기후위기", description: "생존 가능한 환경이 희소 자원이 되며 권리 배분의 명분이 된다.", domains: ["climate", "environment", "migration"], functions: ["ration", "relocate", "monitor"], rights: ["environment", "residence", "mobility"], tones: ["ecological-morality", "collectivism", "risk-management"], plausibility: 0.96, novelty: 0.5, madness: 0.52, needs: ["ration", "relocate", "enforce"] },
  { id: "housing-shortage", label: "주거 부족", description: "거주 공간이 삶의 기본 조건이 아니라 산정 가능한 배정 대상이 된다.", domains: ["housing", "finance", "community"], functions: ["allocate", "score", "trade"], rights: ["residence", "privacy"], tones: ["marketization", "technocracy", "welfare-language"], plausibility: 0.88, novelty: 0.45, madness: 0.4, needs: ["allocate", "score", "trade"] },
  { id: "regional-collapse", label: "지방소멸", description: "지역의 인구 공백이 개인 이동권과 거주권을 압박한다.", domains: ["migration", "housing", "governance"], functions: ["relocate", "incentivize", "allocate"], rights: ["residence", "mobility", "citizenship"], tones: ["collectivism", "pioneerism", "welfare-language"], plausibility: 0.86, novelty: 0.5, madness: 0.43, needs: ["relocate", "incentivize", "allocate"] },
  { id: "loneliness-growth", label: "외로움 증가", description: "관계의 결핍이 공중보건 문제로 수치화된다.", domains: ["community", "healthcare", "digital-life"], functions: ["monitor", "personalize", "score"], rights: ["human-contact", "privacy"], tones: ["paternalism", "welfare-language", "dataism"], plausibility: 0.84, novelty: 0.6, madness: 0.47, needs: ["monitor", "personalize", "incentivize"] },
  { id: "lifespan-identity-delay", label: "수명연장으로 인한 인간 정체", description: "삶이 길어질수록 은퇴, 상속, 세대교체가 지연된다.", domains: ["aging", "identity", "finance"], functions: ["inherit", "license", "score"], rights: ["identity", "memory", "death"], tones: ["generational-conflict", "risk-management", "technocracy"], plausibility: 0.74, novelty: 0.66, madness: 0.55, needs: ["inherit", "license", "score"] },
  { id: "human-labor-worth-loss", label: "인간 노동 경쟁력 상실", description: "인간이 할 수 있다는 사실이 오히려 비효율의 증거가 된다.", domains: ["labor", "digital-life", "finance"], functions: ["automate", "exclude", "score"], rights: ["labor", "identity"], tones: ["meritocracy", "technocracy", "marketization"], plausibility: 0.87, novelty: 0.58, madness: 0.53, needs: ["automate", "exclude", "score"] },
  { id: "resource-scarcity", label: "자원 부족", description: "에너지, 물, 공간 같은 기반 자원이 시민권보다 먼저 계산된다.", domains: ["environment", "climate", "governance"], functions: ["ration", "allocate", "monitor"], rights: ["environment", "residence", "citizenship"], tones: ["utilitarianism", "ecological-morality", "risk-management"], plausibility: 0.9, novelty: 0.47, madness: 0.49, needs: ["ration", "allocate", "monitor"] },
];

/** @type {SatireOption[]} */
export const targets = [
  { id: "elderly", label: "노인", description: "고령이라는 이유로 돌봄 필요와 재정 부담으로 환산되는 시민.", domains: ["aging", "healthcare"], functions: ["score", "insure"], rights: ["healthcare", "death"], tones: ["paternalism", "welfare-language"], plausibility: 0.9, novelty: 0.38, madness: 0.42 },
  { id: "early-retirees", label: "조기 은퇴자", description: "은퇴 이후에도 노동 가능성을 증명해야 하는 시민.", domains: ["aging", "labor", "finance"], functions: ["score", "incentivize"], rights: ["labor", "healthcare"], tones: ["meritocracy", "generational-conflict"], plausibility: 0.82, novelty: 0.5, madness: 0.39 },
  { id: "young-adults", label: "청년층", description: "미래 세대의 부담을 이유로 현재 권리의 양보를 요구받는 세대.", domains: ["labor", "housing", "reproduction"], functions: ["score", "allocate"], rights: ["residence", "labor", "reproduction"], tones: ["generational-conflict", "meritocracy"], plausibility: 0.88, novelty: 0.42, madness: 0.4 },
  { id: "childless-households", label: "무자녀 가구", description: "자녀 유무가 공공 기여도와 지원 자격으로 환산되는 가구.", domains: ["reproduction", "finance", "community"], functions: ["score", "incentivize"], rights: ["reproduction", "privacy"], tones: ["collectivism", "generational-conflict"], plausibility: 0.77, novelty: 0.58, madness: 0.56 },
  { id: "high-medical-cost-patients", label: "고의료비 환자", description: "치료 필요보다 예상 비용으로 먼저 평가되는 환자.", domains: ["healthcare", "finance"], functions: ["insure", "predict"], rights: ["healthcare", "privacy"], tones: ["risk-management", "marketization"], plausibility: 0.86, novelty: 0.43, madness: 0.49 },
  { id: "ai-displaced-workers", label: "AI에 대체된 노동자", description: "자동화가 결정했지만 실패 책임은 개인이 떠안는 노동자.", domains: ["labor", "digital-life"], functions: ["automate", "exclude"], rights: ["labor", "identity"], tones: ["technocracy", "meritocracy"], plausibility: 0.89, novelty: 0.54, madness: 0.5 },
  { id: "debt-defaulters", label: "채무불이행자", description: "채무와 실직 기록이 시민 자격으로 번역되는 사람.", domains: ["finance", "governance"], functions: ["score", "exclude"], rights: ["citizenship", "mobility"], tones: ["marketization", "risk-management"], plausibility: 0.83, novelty: 0.53, madness: 0.51 },
  { id: "regional-residents", label: "지방 거주자", description: "지역 소멸 대응의 수단으로 이동과 거주 선택을 제한받는 주민.", domains: ["migration", "housing", "community"], functions: ["relocate", "allocate"], rights: ["residence", "mobility"], tones: ["collectivism", "pioneerism"], plausibility: 0.8, novelty: 0.52, madness: 0.43 },
  { id: "loneliness-risk-group", label: "외로움 고위험군", description: "가족·사회적 관계망이 적다는 이유로 위험군이 되는 사람.", domains: ["community", "healthcare", "digital-life"], functions: ["monitor", "personalize"], rights: ["privacy", "human-contact"], tones: ["paternalism", "dataism"], plausibility: 0.78, novelty: 0.65, madness: 0.5 },
  { id: "digital-afterlife-personas", label: "디지털 사후인격", description: "사망 뒤에도 데이터와 계약을 통해 계속 사용되는 인격.", domains: ["identity", "privacy", "digital-life"], functions: ["replicate", "inherit"], rights: ["identity", "memory", "deletion"], tones: ["dataism", "marketization"], plausibility: 0.7, novelty: 0.75, madness: 0.68 },
  { id: "genetic-risk-group", label: "유전적 고위험군", description: "질병이 생기기 전부터 예상 비용으로 평가되는 사람.", domains: ["healthcare", "identity", "privacy"], functions: ["predict", "insure"], rights: ["privacy", "healthcare", "identity"], tones: ["risk-management", "technocracy"], plausibility: 0.84, novelty: 0.55, madness: 0.54 },
  { id: "future-humans", label: "미래인류", description: "아직 태어나지 않았지만 현재 권리 제한의 명분으로 호출되는 세대.", domains: ["climate", "reproduction", "governance"], functions: ["incentivize", "ration"], rights: ["environment", "reproduction"], tones: ["collectivism", "ecological-morality"], plausibility: 0.72, novelty: 0.7, madness: 0.62 },
];

/** @type {SatireOption[]} */
export const technologies = [
  { id: "space-colony", label: "우주 식민지", description: "지구 밖 거주지가 새로운 계층 이동과 추방의 무대가 된다.", domains: ["migration", "housing", "environment"], functions: ["relocate", "allocate"], rights: ["residence", "mobility"], tones: ["pioneerism", "marketization"], plausibility: 0.45, novelty: 0.74, madness: 0.66, enables: ["relocate", "allocate", "separate"] },
  { id: "artificial-womb", label: "인공자궁", description: "출산과 양육의 부담을 기술과 제도 밖으로 분리한다.", domains: ["reproduction", "healthcare"], functions: ["replicate", "optimize"], rights: ["reproduction", "identity"], tones: ["technocracy", "welfare-language"], plausibility: 0.62, novelty: 0.72, madness: 0.64, enables: ["replicate", "optimize", "license"] },
  { id: "digital-persona-copy", label: "디지털 인격 복제", description: "인간의 말투와 기억을 계약 가능한 인격으로 복제한다.", domains: ["identity", "privacy", "digital-life"], functions: ["replicate", "trade"], rights: ["identity", "memory", "deletion"], tones: ["dataism", "marketization"], plausibility: 0.72, novelty: 0.68, madness: 0.7, enables: ["replicate", "inherit", "trade"] },
  { id: "memory-editing", label: "기억 편집", description: "고통, 책임, 역사까지 수정 가능한 개인 데이터가 된다.", domains: ["identity", "privacy", "healthcare"], functions: ["edit", "personalize"], rights: ["memory", "identity"], tones: ["paternalism", "technocracy"], plausibility: 0.48, novelty: 0.78, madness: 0.76, enables: ["edit", "personalize", "insure"] },
  { id: "body-upgrade", label: "신체 개조", description: "몸의 기능을 갱신하고 성능을 등급화한다.", domains: ["healthcare", "labor", "identity"], functions: ["optimize", "license"], rights: ["identity", "labor", "healthcare"], tones: ["meritocracy", "marketization"], plausibility: 0.65, novelty: 0.62, madness: 0.58, enables: ["optimize", "license", "score"] },
  { id: "artificial-emotion", label: "인공감정", description: "돌봄, 위로, 친밀감을 합성하고 품질 평가한다.", domains: ["community", "healthcare", "digital-life"], functions: ["personalize", "automate"], rights: ["human-contact", "privacy"], tones: ["welfare-language", "dataism"], plausibility: 0.75, novelty: 0.61, madness: 0.55, enables: ["personalize", "automate", "monitor"] },
  { id: "brain-computer-interface", label: "뇌-컴퓨터 인터페이스", description: "생각과 감각이 직접 기록되고 서비스화된다.", domains: ["privacy", "identity", "digital-life"], functions: ["monitor", "edit"], rights: ["privacy", "identity", "memory"], tones: ["technocracy", "dataism"], plausibility: 0.58, novelty: 0.7, madness: 0.67, enables: ["monitor", "edit", "score"] },
  { id: "national-biometric-monitoring", label: "전국민 생체 모니터링", description: "건강과 위험을 명분으로 신체 상태가 상시 행정 자료가 된다.", domains: ["healthcare", "governance", "privacy"], functions: ["monitor", "predict"], rights: ["privacy", "healthcare"], tones: ["risk-management", "paternalism"], plausibility: 0.82, novelty: 0.55, madness: 0.58, enables: ["monitor", "predict", "enforce"] },
  { id: "emotion-prediction", label: "감정 예측", description: "미래의 불만, 우울, 분노를 선제적으로 점수화한다.", domains: ["community", "governance", "digital-life"], functions: ["predict", "score"], rights: ["privacy", "human-contact"], tones: ["risk-management", "dataism"], plausibility: 0.8, novelty: 0.6, madness: 0.57, enables: ["predict", "score", "monitor"] },
  { id: "care-robot", label: "인간형 로봇", description: "돌봄과 관계 노동을 인간과 유사한 기계가 대신한다.", domains: ["aging", "healthcare", "labor"], functions: ["automate", "personalize"], rights: ["human-contact", "labor"], tones: ["technocracy", "welfare-language"], plausibility: 0.78, novelty: 0.49, madness: 0.5, enables: ["automate", "personalize", "reduce-cost"] },
  { id: "virtual-residence", label: "가상현실 거주", description: "물리적 주거 부족을 가상 주거권으로 보상한다.", domains: ["housing", "digital-life", "community"], functions: ["relocate", "personalize"], rights: ["residence", "human-contact"], tones: ["marketization", "welfare-language"], plausibility: 0.7, novelty: 0.66, madness: 0.62, enables: ["relocate", "personalize", "separate"] },
  { id: "genetic-editing", label: "유전자 편집", description: "질병 예방과 계층 재생산이 같은 기술 언어로 묶인다.", domains: ["healthcare", "reproduction", "identity"], functions: ["edit", "predict"], rights: ["reproduction", "identity", "privacy"], tones: ["risk-management", "meritocracy"], plausibility: 0.74, novelty: 0.6, madness: 0.63, enables: ["edit", "predict", "license"] },
];

/** @type {SatireOption[]} */
export const transformations = [
  { id: "residence-by-life-stage", label: "거주권을 생애주기별로 배분", description: "나이와 생산 단계에 따라 살 수 있는 장소가 달라진다.", domains: ["housing", "aging"], functions: ["allocate", "relocate"], rights: ["residence", "mobility"], tones: ["utilitarianism", "technocracy"], plausibility: 0.72, novelty: 0.62, madness: 0.58, mechanisms: ["allocate", "relocate", "ration"] },
  { id: "healthcare-as-subscription", label: "의료 접근권을 구독제로 전환", description: "기본 치료와 인간 상담이 요금제별 서비스가 된다.", domains: ["healthcare", "finance"], functions: ["insure", "license"], rights: ["healthcare", "human-contact"], tones: ["marketization", "risk-management"], plausibility: 0.81, novelty: 0.52, madness: 0.6, mechanisms: ["insure", "license", "exclude"] },
  { id: "reproduction-as-permit", label: "출산권을 허가제로 전환", description: "출산이 개인 권리보다 사회 기여 심사의 대상이 된다.", domains: ["reproduction", "governance"], functions: ["license", "score"], rights: ["reproduction", "privacy"], tones: ["collectivism", "risk-management"], plausibility: 0.58, novelty: 0.68, madness: 0.76, mechanisms: ["license", "score", "enforce"] },
  { id: "memory-as-collateral", label: "기억 소유권을 담보화", description: "개인의 기억과 경험이 대출과 보험의 담보가 된다.", domains: ["identity", "finance", "privacy"], functions: ["trade", "insure"], rights: ["memory", "privacy"], tones: ["marketization", "dataism"], plausibility: 0.5, novelty: 0.82, madness: 0.78, mechanisms: ["trade", "insure", "inherit"] },
  { id: "sacrifice-as-insurance-discount", label: "권리 포기를 보험료 할인과 교환한다", description: "권리 포기와 신체 정보 제공이 보험료 절감 행위로 포장된다.", domains: ["healthcare", "finance"], functions: ["insure", "incentivize"], rights: ["healthcare", "privacy"], tones: ["marketization", "risk-management"], plausibility: 0.79, novelty: 0.61, madness: 0.64, mechanisms: ["insure", "incentivize", "monitor"] },
  { id: "identity-as-renewable-license", label: "신분권을 갱신형 라이선스로 전환", description: "시민의 신분이 정기 심사와 갱신 수수료에 묶인다.", domains: ["identity", "governance", "finance"], functions: ["license", "score"], rights: ["identity", "citizenship"], tones: ["technocracy", "marketization"], plausibility: 0.65, novelty: 0.69, madness: 0.72, mechanisms: ["license", "score", "exclude"] },
  { id: "right-not-to-work-by-performance", label: "노동하지 않을 권리를 성과점수와 연계", description: "쉴 권리마저 과거 생산성과 평판으로 배정된다.", domains: ["labor", "finance"], functions: ["score", "allocate"], rights: ["labor", "healthcare"], tones: ["meritocracy", "technocracy"], plausibility: 0.74, novelty: 0.6, madness: 0.62, mechanisms: ["score", "allocate", "incentivize"] },
  { id: "mobility-linked-to-carbon", label: "이동권을 탄소예산과 연계", description: "이동의 자유가 개인별 탄소 잔액으로 제한된다.", domains: ["climate", "migration"], functions: ["ration", "monitor"], rights: ["mobility", "environment"], tones: ["ecological-morality", "risk-management"], plausibility: 0.78, novelty: 0.57, madness: 0.55, mechanisms: ["ration", "monitor", "enforce"] },
  { id: "right-to-die-as-national-approval", label: "죽을 권리를 국가 승인제로 전환", description: "죽음의 선택이 복지 비용과 생산 가치 심사에 걸린다.", domains: ["aging", "healthcare", "governance"], functions: ["license", "score"], rights: ["death", "healthcare"], tones: ["paternalism", "utilitarianism"], plausibility: 0.55, novelty: 0.74, madness: 0.8, mechanisms: ["license", "score", "enforce"] },
  { id: "afterlife-control-as-inheritance", label: "사후 통제권을 상속자산으로 전환", description: "죽은 뒤의 데이터 인격을 가족과 기업이 나눠 갖는다.", domains: ["identity", "privacy", "finance"], functions: ["inherit", "trade"], rights: ["identity", "memory", "deletion"], tones: ["marketization", "dataism"], plausibility: 0.68, novelty: 0.77, madness: 0.7, mechanisms: ["inherit", "trade", "replicate"] },
  { id: "human-counseling-as-premium", label: "인간 상담 접근권을 프리미엄 서비스로 전환", description: "인간에게 위로받는 일이 고가 서비스가 된다.", domains: ["healthcare", "community", "digital-life"], functions: ["personalize", "exclude"], rights: ["human-contact", "healthcare"], tones: ["marketization", "welfare-language"], plausibility: 0.84, novelty: 0.62, madness: 0.59, mechanisms: ["personalize", "exclude", "trade"] },
  { id: "nature-use-as-personal-quota", label: "자연환경 이용권을 개인별 할당제로 전환", description: "숲, 바다, 공기 같은 환경 접근이 잔여 할당량으로 관리된다.", domains: ["environment", "climate"], functions: ["ration", "allocate"], rights: ["environment", "mobility"], tones: ["ecological-morality", "technocracy"], plausibility: 0.71, novelty: 0.65, madness: 0.57, mechanisms: ["ration", "allocate", "enforce"] },
];

/** @type {SatireOption[]} */
export const ideologies = [
  { id: "utilitarianism", label: "공리주의", description: "최대 다수의 이익이라는 말로 개인의 손실을 계산한다.", domains: ["governance"], functions: ["optimize", "allocate"], rights: ["citizenship"], tones: ["utilitarianism"], plausibility: 0.9, novelty: 0.35, madness: 0.42 },
  { id: "meritocracy", label: "능력주의", description: "받을 자격이 있는 사람만 권리를 누려야 한다고 말한다.", domains: ["labor", "education"], functions: ["score", "incentivize"], rights: ["labor", "residence"], tones: ["meritocracy"], plausibility: 0.88, novelty: 0.38, madness: 0.44 },
  { id: "capitalism", label: "자본주의", description: "가격과 소유권을 가장 공정한 배분 장치로 둔다.", domains: ["finance"], functions: ["trade", "license"], rights: ["privacy", "residence"], tones: ["marketization"], plausibility: 0.93, novelty: 0.32, madness: 0.4 },
  { id: "socialism", label: "사회주의", description: "공동 부담과 평등 배분의 언어로 개인 선택을 제한한다.", domains: ["governance", "community"], functions: ["allocate", "ration"], rights: ["citizenship", "healthcare"], tones: ["collectivism", "welfare-language"], plausibility: 0.78, novelty: 0.42, madness: 0.43 },
  { id: "ecologism", label: "생태주의", description: "환경 보존의 명분으로 생활권과 이동권을 재조정한다.", domains: ["climate", "environment"], functions: ["ration", "monitor"], rights: ["environment", "mobility"], tones: ["ecological-morality"], plausibility: 0.84, novelty: 0.46, madness: 0.45 },
  { id: "technocracy", label: "기술관료주의", description: "전문가와 알고리즘이 정치적 논쟁을 대신해야 한다고 본다.", domains: ["governance", "digital-life"], functions: ["predict", "score"], rights: ["privacy", "citizenship"], tones: ["technocracy", "dataism"], plausibility: 0.86, novelty: 0.44, madness: 0.48 },
  { id: "libertarianism", label: "자유주의", description: "선택권을 준다는 명분으로 책임과 비용을 개인에게 넘긴다.", domains: ["finance", "identity"], functions: ["trade", "license"], rights: ["identity", "privacy"], tones: ["marketization", "meritocracy"], plausibility: 0.82, novelty: 0.43, madness: 0.46 },
  { id: "welfarism", label: "복지주의", description: "보호와 돌봄의 언어로 감시와 조건부 혜택을 정당화한다.", domains: ["healthcare", "governance"], functions: ["monitor", "allocate"], rights: ["healthcare", "privacy"], tones: ["welfare-language", "paternalism"], plausibility: 0.89, novelty: 0.45, madness: 0.47 },
  { id: "communitarianism", label: "공동체주의", description: "공동체 유지라는 명분으로 개인의 이동과 거절을 제한한다.", domains: ["community", "migration"], functions: ["relocate", "incentivize"], rights: ["mobility", "residence"], tones: ["collectivism", "paternalism"], plausibility: 0.78, novelty: 0.5, madness: 0.5 },
  { id: "humanism", label: "인간주의", description: "인간다움을 보존한다는 말로 정상성의 기준을 만든다.", domains: ["identity", "healthcare"], functions: ["exclude", "license"], rights: ["identity", "human-contact"], tones: ["paternalism", "risk-management"], plausibility: 0.73, novelty: 0.57, madness: 0.52 },
  { id: "risk-management", label: "위험관리주의", description: "아직 일어나지 않은 위험을 이유로 현재 권리를 선제 제한한다.", domains: ["governance", "finance"], functions: ["predict", "exclude"], rights: ["privacy", "mobility"], tones: ["risk-management"], plausibility: 0.9, novelty: 0.48, madness: 0.51 },
  { id: "dataism", label: "데이터주의", description: "측정된 것만 현실이고 점수화된 것만 공정하다고 여긴다.", domains: ["digital-life", "governance"], functions: ["monitor", "score"], rights: ["privacy", "identity"], tones: ["dataism", "technocracy"], plausibility: 0.87, novelty: 0.52, madness: 0.55 },
];

/** @type {SatireOption[]} */
export const actors = [
  { id: "state", label: "국가", description: "위기 대응과 공익을 명분으로 권리 배분을 집행한다.", domains: ["governance"], functions: ["allocate", "enforce"], rights: ["citizenship"], tones: ["utilitarianism", "risk-management"], plausibility: 0.92, novelty: 0.32, madness: 0.4 },
  { id: "insurance-company", label: "보험회사", description: "위험 예측과 비용 절감을 이유로 삶의 조건을 재분류한다.", domains: ["finance", "healthcare"], functions: ["insure", "predict"], rights: ["healthcare", "privacy"], tones: ["marketization", "risk-management"], plausibility: 0.88, novelty: 0.42, madness: 0.48 },
  { id: "transnational-corporation", label: "초국적 기업", description: "국경보다 큰 플랫폼과 인프라를 운영한다.", domains: ["finance", "digital-life"], functions: ["trade", "monitor"], rights: ["privacy", "labor"], tones: ["marketization", "technocracy"], plausibility: 0.86, novelty: 0.45, madness: 0.46 },
  { id: "pension-agency", label: "연금공단", description: "세대 간 재정 균형을 이유로 노후 권리를 조정한다.", domains: ["aging", "finance"], functions: ["allocate", "score"], rights: ["healthcare", "death"], tones: ["welfare-language", "generational-conflict"], plausibility: 0.83, novelty: 0.46, madness: 0.43 },
  { id: "hospital", label: "병원", description: "치료 접근과 생명 유지의 문턱을 현장에서 관리한다.", domains: ["healthcare"], functions: ["insure", "ration"], rights: ["healthcare", "death"], tones: ["paternalism", "risk-management"], plausibility: 0.82, novelty: 0.38, madness: 0.42 },
  { id: "platform-company", label: "플랫폼 기업", description: "관계, 노동, 이동 데이터를 묶어 새로운 자격 체계를 만든다.", domains: ["digital-life", "labor"], functions: ["monitor", "score"], rights: ["privacy", "labor"], tones: ["dataism", "marketization"], plausibility: 0.9, novelty: 0.5, madness: 0.5 },
  { id: "ai-administration", label: "인공지능 행정부", description: "정책 집행을 자동화하며 책임의 위치를 흐린다.", domains: ["governance", "digital-life"], functions: ["automate", "enforce"], rights: ["citizenship", "privacy"], tones: ["technocracy", "dataism"], plausibility: 0.72, novelty: 0.65, madness: 0.6 },
  { id: "space-development-company", label: "우주개발 기업", description: "새 거주지의 통행권과 생존 인프라를 소유한다.", domains: ["migration", "housing"], functions: ["relocate", "trade"], rights: ["residence", "mobility"], tones: ["pioneerism", "marketization"], plausibility: 0.52, novelty: 0.72, madness: 0.63 },
  { id: "future-human-trust", label: "미래인류 신탁", description: "태어나지 않은 사람들의 이익을 대리한다.", domains: ["climate", "reproduction"], functions: ["incentivize", "ration"], rights: ["environment", "reproduction"], tones: ["collectivism", "ecological-morality"], plausibility: 0.5, novelty: 0.78, madness: 0.67 },
  { id: "senior-labor-union", label: "노년 노동조합", description: "늙은 세대의 노동권과 생존권을 집단 교섭한다.", domains: ["aging", "labor"], functions: ["incentivize", "trade"], rights: ["labor", "healthcare"], tones: ["collectivism", "generational-conflict"], plausibility: 0.68, novelty: 0.62, madness: 0.45 },
  { id: "local-government", label: "지방정부", description: "지역 생존을 위해 거주와 이동 정책을 실험한다.", domains: ["migration", "housing", "community"], functions: ["relocate", "allocate"], rights: ["residence", "mobility"], tones: ["pioneerism", "welfare-language"], plausibility: 0.84, novelty: 0.44, madness: 0.4 },
  { id: "credit-rating-agency", label: "신용평가 기관", description: "금융 점수를 시민 생활 전반의 자격으로 확장한다.", domains: ["finance", "governance"], functions: ["score", "exclude"], rights: ["citizenship", "privacy"], tones: ["marketization", "dataism"], plausibility: 0.86, novelty: 0.51, madness: 0.52 },
];

/** @type {SatireOption[]} */
export const metrics = [
  { id: "lifetime-tax-contribution", label: "생애 예상 세금 기여도", description: "한 사람이 앞으로 낼 세금을 권리 배분의 기준으로 삼는다.", domains: ["finance", "governance"], functions: ["predict", "score"], rights: ["citizenship"], tones: ["utilitarianism", "meritocracy"], plausibility: 0.82, novelty: 0.48, madness: 0.5 },
  { id: "expected-medical-cost", label: "예상 의료비", description: "미래 치료 비용을 현재 접근권의 기준으로 계산한다.", domains: ["healthcare", "finance"], functions: ["predict", "insure"], rights: ["healthcare"], tones: ["risk-management", "marketization"], plausibility: 0.88, novelty: 0.4, madness: 0.46 },
  { id: "carbon-efficiency", label: "탄소효율", description: "삶의 방식이 탄소 대비 생산성으로 평가된다.", domains: ["climate", "environment"], functions: ["monitor", "score"], rights: ["environment", "mobility"], tones: ["ecological-morality", "technocracy"], plausibility: 0.78, novelty: 0.55, madness: 0.47 },
  { id: "birth-contribution", label: "출산기여도", description: "출산, 양육, 돌봄이 사회 기여 점수로 환산된다.", domains: ["reproduction", "community"], functions: ["score", "incentivize"], rights: ["reproduction"], tones: ["collectivism", "generational-conflict"], plausibility: 0.7, novelty: 0.62, madness: 0.58 },
  { id: "ai-replaceability", label: "AI 대체 가능성", description: "자동화될 가능성이 높을수록 권리와 지원이 달라진다.", domains: ["labor", "digital-life"], functions: ["predict", "automate"], rights: ["labor"], tones: ["technocracy", "meritocracy"], plausibility: 0.85, novelty: 0.55, madness: 0.52 },
  { id: "housing-productivity-density", label: "주거면적 대비 생산성", description: "차지한 공간이 만들어내는 경제 가치를 측정한다.", domains: ["housing", "finance"], functions: ["score", "allocate"], rights: ["residence"], tones: ["marketization", "utilitarianism"], plausibility: 0.72, novelty: 0.6, madness: 0.54 },
  { id: "social-conflict-risk", label: "사회적 갈등 위험도", description: "주장, 관계, 이동이 갈등 발생 가능성으로 평가된다.", domains: ["community", "governance"], functions: ["predict", "monitor"], rights: ["citizenship", "privacy"], tones: ["risk-management", "paternalism"], plausibility: 0.8, novelty: 0.58, madness: 0.55 },
  { id: "emotional-stability", label: "감정 안정도", description: "감정의 변동 폭이 사회 비용으로 산정된다.", domains: ["healthcare", "community"], functions: ["monitor", "score"], rights: ["privacy", "human-contact"], tones: ["dataism", "paternalism"], plausibility: 0.76, novelty: 0.62, madness: 0.53 },
  { id: "policy-compliance", label: "정책 순응도", description: "정책을 얼마나 잘 따르는지가 혜택의 기준이 된다.", domains: ["governance"], functions: ["monitor", "enforce"], rights: ["citizenship", "mobility"], tones: ["technocracy", "risk-management"], plausibility: 0.86, novelty: 0.44, madness: 0.48 },
  { id: "human-uniqueness", label: "인간 고유성", description: "AI나 복제 인격과 구별되는 인간다움을 점수화한다.", domains: ["identity", "digital-life"], functions: ["score", "exclude"], rights: ["identity", "human-contact"], tones: ["humanism", "meritocracy"], plausibility: 0.58, novelty: 0.72, madness: 0.65 },
  { id: "future-human-utility", label: "미래인류 효용", description: "현재 선택이 미래 세대에게 남길 효용을 계산한다.", domains: ["climate", "reproduction"], functions: ["predict", "optimize"], rights: ["environment", "reproduction"], tones: ["ecological-morality", "collectivism"], plausibility: 0.65, novelty: 0.68, madness: 0.55 },
  { id: "relationship-maintenance-cost", label: "사회관계 유지 비용", description: "관계 형성과 돌봄에 드는 시간과 자원을 수치화한다.", domains: ["community", "healthcare"], functions: ["predict", "personalize"], rights: ["human-contact", "privacy"], tones: ["welfare-language", "dataism"], plausibility: 0.74, novelty: 0.64, madness: 0.5 },
];

/** @type {SatireOption[]} */
export const mechanisms = [
  { id: "tax-differentiation", label: "세금 차등", description: "점수와 위험도에 따라 부담을 다르게 매긴다.", domains: ["finance", "governance"], functions: ["score", "incentivize"], rights: ["citizenship"], tones: ["meritocracy", "utilitarianism"], plausibility: 0.9, novelty: 0.36, madness: 0.38 },
  { id: "insurance-rate-differentiation", label: "보험료 차등", description: "예측된 위험이 곧 비용이 된다.", domains: ["healthcare", "finance"], functions: ["insure", "predict"], rights: ["healthcare", "privacy"], tones: ["risk-management", "marketization"], plausibility: 0.92, novelty: 0.35, madness: 0.42 },
  { id: "basic-income-linkage", label: "기본소득 연계", description: "기본소득을 권리 점수와 정책 순응도에 묶는다.", domains: ["finance", "governance"], functions: ["allocate", "incentivize"], rights: ["citizenship", "labor"], tones: ["welfare-language", "technocracy"], plausibility: 0.7, novelty: 0.58, madness: 0.5 },
  { id: "identity-renewal", label: "신분권 갱신", description: "시민 자격을 정기적으로 확인하고 갱신한다.", domains: ["identity", "governance"], functions: ["license", "score"], rights: ["identity", "citizenship"], tones: ["technocracy", "risk-management"], plausibility: 0.64, novelty: 0.66, madness: 0.62 },
  { id: "algorithmic-auto-allocation", label: "알고리즘 자동배정", description: "사람이 살 곳, 받을 혜택, 해야 할 일을 자동 배정한다.", domains: ["digital-life", "governance"], functions: ["automate", "allocate"], rights: ["residence", "labor"], tones: ["technocracy", "dataism"], plausibility: 0.8, novelty: 0.56, madness: 0.54 },
  { id: "auction", label: "경매", description: "희소 권리를 가격 경쟁으로 배분한다.", domains: ["finance", "housing"], functions: ["trade", "allocate"], rights: ["residence", "environment"], tones: ["marketization"], plausibility: 0.82, novelty: 0.43, madness: 0.48 },
  { id: "lottery", label: "추첨", description: "공정해 보이는 무작위로 삶의 조건을 배정한다.", domains: ["governance", "housing"], functions: ["allocate", "ration"], rights: ["residence", "healthcare"], tones: ["welfare-language", "utilitarianism"], plausibility: 0.76, novelty: 0.5, madness: 0.46 },
  { id: "housing-right-linkage", label: "주거권 연계", description: "다른 사회 점수를 거주 자격과 연결한다.", domains: ["housing", "finance"], functions: ["score", "allocate"], rights: ["residence", "mobility"], tones: ["marketization", "technocracy"], plausibility: 0.78, novelty: 0.52, madness: 0.51 },
  { id: "medical-benefit-linkage", label: "의료혜택 연계", description: "생활 기록과 사회 기여도에 따라 의료 접근을 조정한다.", domains: ["healthcare", "governance"], functions: ["insure", "score"], rights: ["healthcare", "privacy"], tones: ["risk-management", "welfare-language"], plausibility: 0.78, novelty: 0.57, madness: 0.58 },
  { id: "debt-repayment-labor", label: "채무 상환형 노동", description: "빚을 갚기 위해 특정 노동이나 이주를 요구한다.", domains: ["finance", "labor"], functions: ["enforce", "incentivize"], rights: ["labor", "mobility"], tones: ["marketization", "meritocracy"], plausibility: 0.72, novelty: 0.54, madness: 0.57 },
  { id: "household-unit-allocation", label: "가족 단위 할당", description: "개인이 아니라 가족 전체를 권리와 책임의 단위로 묶는다.", domains: ["community", "reproduction"], functions: ["allocate", "inherit"], rights: ["reproduction", "privacy"], tones: ["collectivism", "paternalism"], plausibility: 0.74, novelty: 0.52, madness: 0.5 },
  { id: "performance-based-right-recovery", label: "성과에 따른 권리 회복", description: "잃어버린 권리를 점수와 실적으로 되찾게 한다.", domains: ["labor", "governance"], functions: ["score", "incentivize"], rights: ["citizenship", "labor"], tones: ["meritocracy", "welfare-language"], plausibility: 0.79, novelty: 0.56, madness: 0.56 },
];

/** @type {SatireOption[]} */
export const benefits = [
  { id: "medical-cost-saving", label: "의료비 절감", description: "치료 접근을 조정해 전체 의료 지출을 줄인다고 주장한다.", domains: ["healthcare", "finance"], functions: ["reduce-cost", "insure"], rights: ["healthcare"], tones: ["utilitarianism", "risk-management"], plausibility: 0.88, novelty: 0.32, madness: 0.36 },
  { id: "secure-housing-space", label: "주거공간 확보", description: "주거권을 재배치해 부족한 공간을 효율화한다고 말한다.", domains: ["housing"], functions: ["allocate", "relocate"], rights: ["residence"], tones: ["welfare-language", "technocracy"], plausibility: 0.8, novelty: 0.42, madness: 0.4 },
  { id: "reduce-loneliness", label: "외로움 감소", description: "관계와 돌봄을 배정해 고립을 줄인다고 설명한다.", domains: ["community", "healthcare"], functions: ["personalize", "monitor"], rights: ["human-contact"], tones: ["welfare-language", "paternalism"], plausibility: 0.78, novelty: 0.5, madness: 0.42 },
  { id: "administrative-efficiency", label: "행정 효율 향상", description: "복잡한 갈등을 자동화된 절차로 줄인다고 주장한다.", domains: ["governance", "digital-life"], functions: ["automate", "optimize"], rights: ["citizenship"], tones: ["technocracy"], plausibility: 0.9, novelty: 0.35, madness: 0.38 },
  { id: "carbon-reduction", label: "탄소배출 감소", description: "이동과 소비를 제한해 배출량을 줄인다고 말한다.", domains: ["climate", "environment"], functions: ["ration", "monitor"], rights: ["environment", "mobility"], tones: ["ecological-morality"], plausibility: 0.86, novelty: 0.4, madness: 0.38 },
  { id: "care-labor-shortage-relief", label: "돌봄인력 부족 완화", description: "로봇과 배정 제도로 돌봄 공백을 메운다고 설명한다.", domains: ["aging", "healthcare", "labor"], functions: ["automate", "allocate"], rights: ["healthcare", "human-contact"], tones: ["welfare-language", "technocracy"], plausibility: 0.84, novelty: 0.45, madness: 0.42 },
  { id: "generation-conflict-relief", label: "세대갈등 완화", description: "세대별 부담을 점수로 나눠 갈등을 줄인다고 주장한다.", domains: ["aging", "finance"], functions: ["allocate", "score"], rights: ["healthcare", "reproduction"], tones: ["generational-conflict", "utilitarianism"], plausibility: 0.74, novelty: 0.46, madness: 0.43 },
  { id: "labor-market-transition-support", label: "노동시장 전환 지원", description: "자동화 이후 사람들을 새 역할로 옮긴다고 말한다.", domains: ["labor", "education"], functions: ["relocate", "incentivize"], rights: ["labor"], tones: ["welfare-language", "technocracy"], plausibility: 0.8, novelty: 0.42, madness: 0.36 },
  { id: "resource-predictability", label: "자원배분 예측 가능성 증가", description: "권리와 자원을 미리 계산해 낭비를 줄인다고 설명한다.", domains: ["environment", "governance"], functions: ["predict", "allocate"], rights: ["environment", "citizenship"], tones: ["risk-management", "technocracy"], plausibility: 0.82, novelty: 0.44, madness: 0.4 },
  { id: "emergency-early-response", label: "응급상황 조기예지", description: "위험을 먼저 예측해 사고를 막는다고 주장한다.", domains: ["healthcare", "governance"], functions: ["predict", "monitor"], rights: ["healthcare", "privacy"], tones: ["risk-management", "paternalism"], plausibility: 0.86, novelty: 0.43, madness: 0.42 },
  { id: "personalized-environment", label: "개인 맞춤형 환경 제공", description: "개인의 상태에 맞춰 공간, 관계, 서비스를 조정한다고 말한다.", domains: ["digital-life", "housing"], functions: ["personalize", "monitor"], rights: ["privacy", "residence"], tones: ["dataism", "welfare-language"], plausibility: 0.76, novelty: 0.51, madness: 0.45 },
  { id: "reduce-social-burden", label: "사회적 부담 감소", description: "개인의 선택을 조정해 사회 전체 비용을 낮춘다고 설명한다.", domains: ["governance", "finance"], functions: ["reduce-cost", "incentivize"], rights: ["citizenship"], tones: ["utilitarianism", "welfare-language"], plausibility: 0.85, novelty: 0.37, madness: 0.41 },
];

/** @type {SatireOption[]} */
export const careNarratives = [
  { id: "new-life-goal", label: "새로운 삶의 목표 제공", description: "통제를 의미와 성장의 기회로 포장한다.", domains: ["identity", "community"], functions: ["incentivize", "personalize"], rights: ["identity"], tones: ["paternalism", "welfare-language"], plausibility: 0.76, novelty: 0.48, madness: 0.43 },
  { id: "choice-expansion", label: "선택권 확대", description: "실제로는 제한된 메뉴를 자유로운 선택처럼 제시한다.", domains: ["finance", "digital-life"], functions: ["trade", "license"], rights: ["privacy", "mobility"], tones: ["marketization"], plausibility: 0.84, novelty: 0.4, madness: 0.42 },
  { id: "social-isolation-relief", label: "사회적 고립 해소", description: "관계의 질보다 연결 여부를 행정적으로 보장한다.", domains: ["community", "healthcare"], functions: ["monitor", "personalize"], rights: ["human-contact"], tones: ["welfare-language", "paternalism"], plausibility: 0.82, novelty: 0.5, madness: 0.44 },
  { id: "personalized-care", label: "개인별 맞춤환경 제공", description: "감시와 예측을 돌봄의 정밀함으로 설명한다.", domains: ["digital-life", "healthcare"], functions: ["monitor", "personalize"], rights: ["privacy", "healthcare"], tones: ["dataism", "welfare-language"], plausibility: 0.83, novelty: 0.45, madness: 0.44 },
  { id: "protect-future-humans", label: "미래인류 보호", description: "존재하지 않는 사람들의 이익으로 현재의 권리를 조정한다.", domains: ["climate", "reproduction"], functions: ["ration", "incentivize"], rights: ["environment", "reproduction"], tones: ["collectivism", "ecological-morality"], plausibility: 0.7, novelty: 0.62, madness: 0.52 },
  { id: "human-dignity-guarantee", label: "인간 존엄 보장", description: "존엄을 측정 가능한 상태로 정의해 관리한다.", domains: ["identity", "healthcare"], functions: ["score", "monitor"], rights: ["identity", "human-contact"], tones: ["humanism", "paternalism"], plausibility: 0.74, novelty: 0.54, madness: 0.48 },
  { id: "self-realization-support", label: "자아실현 지원", description: "정책 순응을 자기계발의 언어로 바꾼다.", domains: ["education", "labor"], functions: ["incentivize", "score"], rights: ["labor", "identity"], tones: ["meritocracy", "welfare-language"], plausibility: 0.8, novelty: 0.44, madness: 0.42 },
  { id: "community-participation-expansion", label: "공동체 참여 확대", description: "거절하기 어려운 의무를 참여 기회라고 부른다.", domains: ["community", "governance"], functions: ["incentivize", "enforce"], rights: ["citizenship", "mobility"], tones: ["collectivism", "welfare-language"], plausibility: 0.78, novelty: 0.46, madness: 0.44 },
  { id: "health-promotion", label: "건강 증진", description: "건강을 이유로 생활 방식과 신체 데이터를 관리한다.", domains: ["healthcare", "privacy"], functions: ["monitor", "incentivize"], rights: ["healthcare", "privacy"], tones: ["paternalism", "risk-management"], plausibility: 0.88, novelty: 0.34, madness: 0.39 },
  { id: "economic-independence-support", label: "경제적 자립 지원", description: "지원 축소를 자립 훈련으로 표현한다.", domains: ["finance", "labor"], functions: ["incentivize", "exclude"], rights: ["labor", "citizenship"], tones: ["meritocracy", "welfare-language"], plausibility: 0.83, novelty: 0.38, madness: 0.43 },
  { id: "risk-protection", label: "위험으로부터의 선제적 보호", description: "아직 일어나지 않은 위험을 이유로 자유를 미리 제한한다.", domains: ["governance", "healthcare"], functions: ["predict", "enforce"], rights: ["privacy", "mobility"], tones: ["risk-management", "paternalism"], plausibility: 0.86, novelty: 0.46, madness: 0.47 },
  { id: "administrative-burden-liberation", label: "행정 부담으로부터의 해방", description: "복잡한 선택을 없애는 것을 편의로 설명한다.", domains: ["governance", "digital-life"], functions: ["automate", "optimize"], rights: ["citizenship", "privacy"], tones: ["technocracy", "welfare-language"], plausibility: 0.85, novelty: 0.4, madness: 0.41 },
];

/** @type {SatireOption[]} */
export const classDistortions = [
  { id: "wealthy-buy-exemptions", label: "예외권이 고가 상품이 된다", description: "규칙은 모두에게 같다고 말하지만 예외를 감당할 수 있는 조건은 다르게 배치된다.", domains: ["finance", "governance"], functions: ["trade", "exclude"], rights: ["citizenship", "residence"], tones: ["marketization"], plausibility: 0.9, novelty: 0.42, madness: 0.55 },
  { id: "poor-join-experiments", label: "경제적 취약성이 실험 참여를 사실상 강제한다", description: "형식상 자발적 동의가 실제 생활 조건과 분리되기 어려워진다.", domains: ["finance", "healthcare"], functions: ["incentivize", "monitor"], rights: ["healthcare", "privacy"], tones: ["marketization", "risk-management"], plausibility: 0.84, novelty: 0.5, madness: 0.6 },
  { id: "risk-to-individual-profit-to-company", label: "위험은 개인에게, 수익은 기업에게 돌아간다", description: "실패 책임과 성공 이익이 서로 다른 곳에 배정된다.", domains: ["finance", "digital-life"], functions: ["trade", "insure"], rights: ["privacy", "labor"], tones: ["marketization"], plausibility: 0.88, novelty: 0.39, madness: 0.53 },
  { id: "score-inherits-to-children", label: "점수가 자녀에게 상속된다", description: "부모의 데이터가 다음 세대의 출발선이 된다.", domains: ["finance", "reproduction"], functions: ["inherit", "score"], rights: ["identity", "citizenship"], tones: ["meritocracy", "dataism"], plausibility: 0.72, novelty: 0.66, madness: 0.68 },
  { id: "human-service-becomes-luxury", label: "인간 서비스가 사치재가 된다", description: "사람에게 직접 대우받는 일이 높은 요금제의 특권이 된다.", domains: ["healthcare", "community"], functions: ["personalize", "trade"], rights: ["human-contact", "healthcare"], tones: ["marketization"], plausibility: 0.84, novelty: 0.55, madness: 0.58 },
  { id: "right-to-refuse-is-costly", label: "거부권은 있지만 행사 비용이 지나치게 비싸다", description: "형식적 자유는 남기고 실제 선택 가능성은 제거한다.", domains: ["finance", "governance"], functions: ["license", "trade"], rights: ["privacy", "mobility"], tones: ["libertarianism", "marketization"], plausibility: 0.86, novelty: 0.48, madness: 0.54 },
  { id: "algorithm-error-burden-on-person", label: "알고리즘 오류의 입증책임은 개인이 진다", description: "기계가 틀려도 인간이 자신을 증명해야 한다.", domains: ["digital-life", "governance"], functions: ["score", "enforce"], rights: ["citizenship", "privacy"], tones: ["technocracy", "dataism"], plausibility: 0.88, novelty: 0.5, madness: 0.56 },
  { id: "upper-class-buys-human-time", label: "상위계층만 진짜 인간 시간을 산다", description: "돌봄, 상담, 교육의 인간 접촉이 고가 상품이 된다.", domains: ["healthcare", "education"], functions: ["trade", "personalize"], rights: ["human-contact"], tones: ["marketization"], plausibility: 0.82, novelty: 0.54, madness: 0.57 },
  { id: "good-score-market-advantage", label: "좋은 점수를 사는 비교 시장이 생긴다", description: "평판 개선 서비스가 새로운 계층 사다리처럼 팔린다.", domains: ["finance", "digital-life"], functions: ["score", "trade"], rights: ["identity", "privacy"], tones: ["marketization", "meritocracy"], plausibility: 0.8, novelty: 0.58, madness: 0.56 },
  { id: "specific-regions-test-zones", label: "특정 지역만 실험구역이 된다", description: "낮은 정치적 저항을 이유로 지역이 정책 실험장이 된다.", domains: ["migration", "governance"], functions: ["relocate", "monitor"], rights: ["residence", "mobility"], tones: ["pioneerism", "technocracy"], plausibility: 0.78, novelty: 0.55, madness: 0.55 },
  { id: "lower-class-data-over-collected", label: "지원이 필요한 사람일수록 더 촘촘하게 감시된다", description: "도움이 필요한 상황일수록 더 많은 사생활 증명을 요구받는 구조가 된다.", domains: ["privacy", "finance"], functions: ["monitor", "score"], rights: ["privacy", "citizenship"], tones: ["welfare-language", "dataism"], plausibility: 0.87, novelty: 0.52, madness: 0.57 },
  { id: "exemption-status-symbol", label: "면제 자격이 새로운 신분 상징이 된다", description: "규칙을 따르지 않아도 되는 능력이 지위가 된다.", domains: ["finance", "identity"], functions: ["license", "trade"], rights: ["identity", "citizenship"], tones: ["marketization", "meritocracy"], plausibility: 0.8, novelty: 0.61, madness: 0.6 },
];

/** @type {SatireOption[]} */
export const feedbackLoops = [
  { id: "low-score-reduces-opportunity", label: "낮은 점수가 기회를 줄여 점수를 더 낮춘다", description: "평가가 현실을 설명하는 대신 현실을 만들어낸다.", domains: ["finance", "labor"], functions: ["score", "exclude"], rights: ["labor", "citizenship"], tones: ["meritocracy", "dataism"], plausibility: 0.9, novelty: 0.44, madness: 0.54 },
  { id: "migrant-politics-weakens-policy", label: "이주자의 정치력이 감소해 이주 정책이 강화된다", description: "밀려난 사람일수록 자신에게 적용되는 규칙에 덜 개입한다.", domains: ["migration", "governance"], functions: ["relocate", "enforce"], rights: ["mobility", "citizenship"], tones: ["collectivism", "risk-management"], plausibility: 0.78, novelty: 0.57, madness: 0.56 },
  { id: "expert-loss-increases-ai-dependence", label: "인간 전문가 감소가 AI 의존을 높인다", description: "자동화가 인간 역량을 줄이고, 줄어든 역량이 자동화를 정당화한다.", domains: ["labor", "education"], functions: ["automate", "optimize"], rights: ["labor", "human-contact"], tones: ["technocracy", "dataism"], plausibility: 0.86, novelty: 0.52, madness: 0.52 },
  { id: "surveillance-reduces-expression", label: "감시가 솔직한 표현을 줄여 위험 판정을 흐린다", description: "감정 통제가 더 부정확한 감정 데이터를 만든다.", domains: ["privacy", "community"], functions: ["monitor", "predict"], rights: ["privacy", "human-contact"], tones: ["risk-management", "dataism"], plausibility: 0.82, novelty: 0.6, madness: 0.55 },
  { id: "isolation-damages-social-function", label: "격리가 사회적 기능을 떨어뜨려 격리를 정당화한다", description: "고립 정책이 고립의 근거를 계속 생산한다.", domains: ["community", "healthcare"], functions: ["separate", "monitor"], rights: ["human-contact", "mobility"], tones: ["paternalism", "risk-management"], plausibility: 0.78, novelty: 0.57, madness: 0.56 },
  { id: "replica-experience-outperforms-original", label: "복제 인격의 경험 축적이 원본보다 우수해진다", description: "복제본이 더 많은 데이터를 가져 원본의 권리를 압박한다.", domains: ["identity", "digital-life"], functions: ["replicate", "score"], rights: ["identity", "memory"], tones: ["dataism", "marketization"], plausibility: 0.58, novelty: 0.8, madness: 0.72 },
  { id: "prediction-creates-reality", label: "정책 예측이 스스로 현실을 만들어낸다", description: "위험하다고 분류된 곳이 실제로 위험해진다.", domains: ["governance", "finance"], functions: ["predict", "enforce"], rights: ["residence", "citizenship"], tones: ["technocracy", "risk-management"], plausibility: 0.84, novelty: 0.56, madness: 0.55 },
  { id: "insurance-exclusion-worsens-health", label: "보험에서 배제된 결과가 다음 배제의 근거가 된다", description: "지원에서 밀려난 기록이 다시 위험 판정의 근거로 돌아오는 구조가 된다.", domains: ["healthcare", "finance"], functions: ["insure", "exclude"], rights: ["healthcare"], tones: ["risk-management", "marketization"], plausibility: 0.88, novelty: 0.48, madness: 0.55 },
  { id: "regional-population-loss-justifies-relocation", label: "지역 소멸 대응이 거주지 강제 배정을 정당화한다", description: "사람이 떠난 지역일수록 더 많은 거주지 강제 배정이 필요하다는 논리가 만들어진다.", domains: ["migration", "housing"], functions: ["relocate", "allocate"], rights: ["residence", "mobility"], tones: ["collectivism", "pioneerism"], plausibility: 0.74, novelty: 0.62, madness: 0.57 },
  { id: "low-birth-score-shrinks-support", label: "낮은 출산점수가 지원 축소로 이어져 출산이 더 어려워진다", description: "지원 기준이 문제를 해결하지 않고 문제의 증거를 키운다.", domains: ["reproduction", "finance"], functions: ["score", "incentivize"], rights: ["reproduction"], tones: ["generational-conflict", "collectivism"], plausibility: 0.78, novelty: 0.58, madness: 0.56 },
  { id: "automation-removes-training", label: "자동화가 훈련을 없애 자동화 의존을 높인다", description: "배울 기회가 사라져 인간 대안이 더 약해진다.", domains: ["labor", "education"], functions: ["automate", "exclude"], rights: ["labor", "education"], tones: ["technocracy", "meritocracy"], plausibility: 0.86, novelty: 0.5, madness: 0.49 },
  { id: "reputation-score-replaces-relationships", label: "평판 점수가 인간관계를 점수 관리 행위로 바꾼다", description: "관계가 깊어질수록 더 평가 가능한 거래가 된다.", domains: ["community", "digital-life"], functions: ["score", "monitor"], rights: ["human-contact", "privacy"], tones: ["dataism", "marketization"], plausibility: 0.82, novelty: 0.6, madness: 0.57 },
];

/** @type {SatireOption[]} */
export const victimInternalizations = [
  { id: "subjects-call-themselves-pioneers", label: "강제로 배정된 사람들이 자신을 개척자라 부르게 된다", description: "강제로 배정된 위치가 선도적 역할이라는 정체성으로 다시 설명된다.", domains: ["identity", "migration"], functions: ["incentivize", "relocate"], rights: ["identity", "mobility"], tones: ["pioneerism", "welfare-language"], plausibility: 0.74, novelty: 0.56, madness: 0.55 },
  { id: "disadvantaged-defend-fairness", label: "불이익을 받는 사람이 제도를 공정하다고 옹호한다", description: "제도의 분류 기준을 내면화해 자신의 손실을 합리적 결과로 해석한다.", domains: ["governance", "finance"], functions: ["score", "exclude"], rights: ["citizenship"], tones: ["meritocracy", "dataism"], plausibility: 0.78, novelty: 0.5, madness: 0.54 },
  { id: "low-score-as-moral-failure", label: "낮은 점수를 자신의 도덕적 실패로 받아들인다", description: "구조적 불이익이 개인의 도덕성과 개선 노력 문제로 축소된다.", domains: ["identity", "finance"], functions: ["score", "incentivize"], rights: ["identity", "citizenship"], tones: ["meritocracy"], plausibility: 0.84, novelty: 0.45, madness: 0.53 },
  { id: "no-exemption-as-contribution", label: "면제받지 못한 사람이 그 사실을 사회 기여의 증거로 자랑한다", description: "불이익을 견디는 일이 책임감의 증거처럼 설명된다.", domains: ["community", "governance"], functions: ["incentivize", "exclude"], rights: ["citizenship"], tones: ["collectivism", "welfare-language"], plausibility: 0.72, novelty: 0.58, madness: 0.56 },
  { id: "surveillance-as-safety-proof", label: "감시받는 상태를 안전하다는 증거로 여긴다", description: "자유의 축소가 보호받고 있다는 감각으로 번역된다.", domains: ["privacy", "healthcare"], functions: ["monitor", "enforce"], rights: ["privacy"], tones: ["paternalism", "risk-management"], plausibility: 0.8, novelty: 0.5, madness: 0.52 },
  { id: "human-service-abandonment-as-progress", label: "인간 서비스를 포기하는 것을 진보적 선택으로 포장한다", description: "사람이 없는 돌봄을 더 합리적이고 현대적인 것으로 받아들인다.", domains: ["healthcare", "community"], functions: ["automate", "personalize"], rights: ["human-contact"], tones: ["technocracy", "welfare-language"], plausibility: 0.8, novelty: 0.54, madness: 0.52 },
  { id: "rights-limits-as-future-sacrifice", label: "권리 제한을 미래 세대를 위한 의무로 받아들인다", description: "현재의 권리 제한이 미래를 위한 도덕적 의무처럼 설명된다.", domains: ["climate", "reproduction"], functions: ["ration", "incentivize"], rights: ["environment", "reproduction"], tones: ["ecological-morality", "collectivism"], plausibility: 0.76, novelty: 0.55, madness: 0.54 },
  { id: "data-submission-as-civic-duty", label: "데이터 제공을 시민의 의무로 받아들인다", description: "사생활 포기가 공동체 기여로 바뀐다.", domains: ["privacy", "governance"], functions: ["monitor", "score"], rights: ["privacy", "citizenship"], tones: ["dataism", "collectivism"], plausibility: 0.82, novelty: 0.5, madness: 0.53 },
  { id: "forced-migration-as-opportunity", label: "거주지 강제 배정을 새로운 기회라고 홍보한다", description: "거주 선택권이 줄어든 상황이 개척과 성장의 서사로 바뀐다.", domains: ["migration", "housing"], functions: ["relocate", "incentivize"], rights: ["mobility", "residence"], tones: ["pioneerism", "welfare-language"], plausibility: 0.76, novelty: 0.56, madness: 0.55 },
  { id: "yielding-to-replica-as-efficiency", label: "복제 인격에게 자리를 내주는 것을 효율적 양계라 부른다", description: "원본의 후퇴가 더 나은 데이터 인격을 위한 합리화가 된다.", domains: ["identity", "digital-life"], functions: ["replicate", "optimize"], rights: ["identity", "memory"], tones: ["dataism", "utilitarianism"], plausibility: 0.5, novelty: 0.82, madness: 0.76 },
  { id: "sacrifice-as-transparency", label: "권리 포기를 투명한 선택으로 미화한다", description: "숨길 권리의 축소가 떳떳함의 증거처럼 불린다.", domains: ["privacy", "identity"], functions: ["monitor", "exclude"], rights: ["privacy", "identity"], tones: ["dataism", "paternalism"], plausibility: 0.76, novelty: 0.58, madness: 0.56 },
  { id: "discrimination-as-self-improvement", label: "차별적 등급을 자기계발 목표로 내면화한다", description: "낮은 등급이 개선 가능한 개인 과제로 바뀐다.", domains: ["education", "labor"], functions: ["score", "incentivize"], rights: ["labor", "identity"], tones: ["meritocracy", "welfare-language"], plausibility: 0.82, novelty: 0.52, madness: 0.55 },
];

/** @type {SatireOption[]} */
export const irreversibilities = [
  { id: "earth-return-right-lost", label: "지구 귀환권이 상실된다", description: "한 번 떠난 거주지는 다시 돌아갈 권리를 보장하지 않는다.", domains: ["migration", "environment"], functions: ["relocate", "exclude"], rights: ["residence", "mobility"], tones: ["pioneerism", "risk-management"], plausibility: 0.56, novelty: 0.7, madness: 0.66 },
  { id: "deleted-memory-unrecoverable", label: "삭제된 기억은 복구할 수 없다", description: "치료나 보험을 위해 지운 경험이 영구 손실된다.", domains: ["identity", "privacy"], functions: ["edit", "insure"], rights: ["memory", "identity"], tones: ["risk-management", "marketization"], plausibility: 0.66, novelty: 0.72, madness: 0.68 },
  { id: "replica-legal-priority", label: "복제 인격이 원본보다 법적 우선권을 갖는다", description: "더 안정적이고 유용한 복제본이 원본의 권리를 앞선다.", domains: ["identity", "digital-life"], functions: ["replicate", "score"], rights: ["identity", "memory"], tones: ["dataism", "utilitarianism"], plausibility: 0.46, novelty: 0.84, madness: 0.82 },
  { id: "low-identity-grade-inherited", label: "낮은 신분 등급이 자녀에게 승계된다", description: "한 세대의 평가가 다음 세대의 시민 자격을 결정한다.", domains: ["identity", "reproduction"], functions: ["inherit", "score"], rights: ["identity", "citizenship"], tones: ["meritocracy", "dataism"], plausibility: 0.62, novelty: 0.73, madness: 0.75 },
  { id: "national-biometric-data-not-retrievable", label: "전국민 생체데이터는 회수할 수 없다", description: "한 번 수집된 신체 데이터가 제도 밖으로 돌아오지 않는다.", domains: ["privacy", "healthcare"], functions: ["monitor", "trade"], rights: ["privacy", "deletion"], tones: ["dataism", "risk-management"], plausibility: 0.84, novelty: 0.55, madness: 0.62 },
  { id: "birth-permit-loss-permanent", label: "출산 허가를 잃으면 사실상 불가능하다", description: "제도적 보류가 생물학적 시간과 만나 영구 박탈이 된다.", domains: ["reproduction", "governance"], functions: ["license", "exclude"], rights: ["reproduction"], tones: ["risk-management", "collectivism"], plausibility: 0.58, novelty: 0.7, madness: 0.78 },
  { id: "auto-assigned-residence-lifetime", label: "자동배정 거주지는 평생 변경할 수 없다", description: "알고리즘의 초기 결정이 삶의 지리적 궤도를 고정한다.", domains: ["housing", "migration"], functions: ["allocate", "relocate"], rights: ["residence", "mobility"], tones: ["technocracy", "utilitarianism"], plausibility: 0.54, novelty: 0.68, madness: 0.7 },
  { id: "human-counseling-loss-permanent", label: "인간 상담 자격을 잃으면 AI 상담만 이용해야 한다", description: "한 번 낮아진 서비스 등급이 인간 접촉을 영구히 닫는다.", domains: ["healthcare", "community"], functions: ["personalize", "exclude"], rights: ["human-contact", "healthcare"], tones: ["marketization", "welfare-language"], plausibility: 0.7, novelty: 0.64, madness: 0.64 },
  { id: "afterlife-control-waiver-permanent-replica", label: "사후 통제권을 포기하면 영구 복제된다", description: "죽은 뒤 삭제를 요청할 수 없는 데이터 인격이 남는다.", domains: ["identity", "privacy"], functions: ["replicate", "inherit"], rights: ["identity", "deletion"], tones: ["dataism", "marketization"], plausibility: 0.62, novelty: 0.78, madness: 0.76 },
  { id: "insurance-grade-record-undeletable", label: "보험 등급 하락 기록은 삭제되지 않는다", description: "한 번의 위험 판정이 모든 미래 계약을 따라다닌다.", domains: ["healthcare", "finance"], functions: ["insure", "score"], rights: ["healthcare", "deletion"], tones: ["risk-management", "marketization"], plausibility: 0.82, novelty: 0.5, madness: 0.58 },
  { id: "body-upgrade-refusal-limits-identity", label: "신체 개조 거부를 신분권 갱신의 결격 사유로 삼는다", description: "기술 선택 여부가 시민 서비스 접근 기준으로 해석되는 구조가 된다.", domains: ["healthcare", "identity"], functions: ["license", "optimize"], rights: ["identity", "healthcare"], tones: ["technocracy", "meritocracy"], plausibility: 0.56, novelty: 0.72, madness: 0.72 },
  { id: "exit-system-loses-basic-rights", label: "제도에서 탈퇴하면 기본소득과 의료권을 동시에 잃는다", description: "탈퇴권은 있지만 생존 조건이 함께 끊긴다.", domains: ["governance", "finance"], functions: ["exclude", "enforce"], rights: ["healthcare", "citizenship"], tones: ["welfare-language", "technocracy"], plausibility: 0.76, novelty: 0.6, madness: 0.68 },
];

export const allCategories = {
  pressures,
  targets,
  technologies,
  transformations,
  ideologies,
  actors,
  metrics,
  mechanisms,
  benefits,
  careNarratives,
  classDistortions,
  feedbackLoops,
  victimInternalizations,
  irreversibilities,
};

const requiredFields = [
  "id",
  "label",
  "description",
  "domains",
  "functions",
  "rights",
  "tones",
  "plausibility",
  "novelty",
  "madness",
];

const numericFields = ["plausibility", "novelty", "madness"];

function isKebabCase(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validateOption(categoryId, option, seenIds) {
  const errors = [];

  if (!option || typeof option !== "object" || Array.isArray(option)) {
    return [`${categoryId}: option must be an object`];
  }

  for (const field of requiredFields) {
    if (!(field in option)) {
      errors.push(`${categoryId}/${option.id || "unknown"}: missing required field "${field}"`);
    }
  }

  if (typeof option.id === "string") {
    if (!isKebabCase(option.id)) {
      errors.push(`${categoryId}/${option.id}: id must be kebab-case`);
    }
    if (seenIds.has(option.id)) {
      errors.push(`${categoryId}/${option.id}: duplicate id in category`);
    }
    seenIds.add(option.id);
  }

  for (const field of ["domains", "functions", "rights", "tones", "needs", "enables", "mechanisms"]) {
    if (field in option && !Array.isArray(option[field])) {
      errors.push(`${categoryId}/${option.id}: "${field}" must be an array`);
    }
  }

  for (const field of numericFields) {
    if (typeof option[field] !== "number" || option[field] < 0 || option[field] > 1) {
      errors.push(`${categoryId}/${option.id}: "${field}" must be a number from 0 to 1`);
    }
  }

  return errors;
}

export function validateData(categories = allCategories) {
  const errors = [];
  const definedCategoryIds = new Set(categoryDefinitions.map((category) => category.id));

  for (const definition of categoryDefinitions) {
    if (!["core", "detail", "amplifier"].includes(definition.group)) {
      errors.push(`${definition.id}: invalid group "${definition.group}"`);
    }
    if (typeof definition.required !== "boolean") {
      errors.push(`${definition.id}: required must be boolean`);
    }
  }

  for (const categoryId of Object.keys(categories)) {
    if (!definedCategoryIds.has(categoryId)) {
      errors.push(`${categoryId}: missing category definition`);
    }
  }

  for (const definition of categoryDefinitions) {
    const items = categories[definition.id];
    if (!Array.isArray(items)) {
      errors.push(`${definition.id}: category must be an array`);
      continue;
    }

    const seenIds = new Set();
    for (const option of items) {
      errors.push(...validateOption(definition.id, option, seenIds));
    }
  }

  return errors;
}
