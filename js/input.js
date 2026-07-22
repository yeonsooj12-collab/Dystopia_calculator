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

function historyOption(id, label, description, tags = {}) {
  return {
    id,
    label,
    description,
    domains: tags.domains || ["governance"],
    functions: tags.functions || [],
    rights: tags.rights || [],
    tones: tags.tones || [],
    plausibility: tags.plausibility ?? 0.8,
    novelty: tags.novelty ?? 0.45,
    madness: tags.madness ?? 0.35,
    needs: tags.needs || [],
    enables: tags.enables || [],
    mechanisms: tags.mechanisms || [],
  };
}

const HISTORY_CATEGORY_OPTIONS = {
  pressure: [
    historyOption("fiscal-shortage", "재정 부족", "국가나 공동체가 기존 지출을 감당하기 어려워지는 조건.", { domains: ["finance", "governance"], functions: ["reduce-cost", "allocate"], tones: ["risk-management"], needs: ["reduce-cost", "allocate"] }),
    historyOption("population-change", "인구 변화", "인구 증가, 감소, 고령화, 도시 집중처럼 사회 구성 자체가 바뀌는 조건.", { domains: ["aging", "migration", "housing"], functions: ["allocate", "relocate"], needs: ["allocate"] }),
    historyOption("food-energy-shortage", "식량·에너지 부족", "생존 자원의 부족이 배급, 가격, 이동, 노동 조건을 압박하는 상황.", { domains: ["environment", "finance"], functions: ["ration", "allocate"], tones: ["risk-management"], needs: ["ration"] }),
    historyOption("epidemic", "전염병", "질병 확산이 검역, 이동 제한, 낙인, 공중보건 제도를 강화하는 조건.", { domains: ["healthcare", "migration"], functions: ["monitor", "separate"], rights: ["mobility", "healthcare"], needs: ["monitor"] }),
    historyOption("war-aftermath", "전쟁 후유증", "전쟁 이후 부채, 동원 해제, 난민, 복구, 기억 정치가 겹치는 조건.", { domains: ["governance", "migration"], functions: ["relocate", "allocate"], needs: ["allocate"] }),
    historyOption("technology-change", "기술 변화", "새로운 생산·통신·군사 기술이 노동, 권력, 지식 질서를 바꾸는 조건.", { domains: ["labor", "digital-life"], functions: ["automate", "monitor"], needs: ["automate"] }),
    historyOption("labor-shortage", "노동력 부족", "전쟁, 이주, 인구 변화, 산업 전환으로 필요한 노동을 확보하기 어려운 조건.", { domains: ["labor", "migration"], functions: ["incentivize", "enforce"], needs: ["incentivize"] }),
    historyOption("regional-inequality", "지역 격차", "중심과 주변, 도시와 농촌, 본국과 식민지 사이의 자원 차이가 커지는 조건.", { domains: ["housing", "migration", "governance"], functions: ["relocate", "allocate"], needs: ["relocate"] }),
    historyOption("legitimacy-crisis", "정통성 위기", "통치자가 왜 다스릴 자격이 있는지 설득해야 하는 조건.", { domains: ["governance", "identity"], functions: ["enforce", "incentivize"], tones: ["collectivism"], needs: ["enforce"] }),
    historyOption("price-inflation", "물가 상승·화폐 불안", "가격, 임금, 세금, 저축의 기준이 흔들리며 신뢰와 생계가 동시에 압박받는 조건.", { domains: ["finance", "labor"], functions: ["trade", "allocate"], tones: ["risk-management"], needs: ["trade"] }),
    historyOption("state-centralization", "국가 중앙집권", "지방 권한, 관습, 공동체 질서가 중앙의 법·세금·군사 체계와 충돌하는 조건.", { domains: ["governance", "community"], functions: ["enforce", "monitor"], needs: ["enforce"] }),
    historyOption("environmental-shock", "환경 충격", "가뭄, 홍수, 기후 변동, 토지 황폐화가 식량·이주·갈등을 밀어붙이는 조건.", { domains: ["environment", "migration"], functions: ["ration", "relocate"], tones: ["risk-management"], needs: ["ration"] }),
  ],
  technology: [
    historyOption("war-threat", "전쟁 위협", "외부 군사 압박이 내부 동원, 검열, 징세, 시민권 논리를 바꾸는 조건.", { domains: ["governance"], functions: ["enforce", "monitor"], tones: ["risk-management"], enables: ["enforce"] }),
    historyOption("great-power-pressure", "제국·강대국 압박", "강한 외부 권력이 무역, 군사, 법, 영토 질서에 영향을 주는 조건.", { domains: ["governance", "finance"], functions: ["trade", "enforce"], enables: ["trade"] }),
    historyOption("trade-dependence", "무역 의존", "필수 물자와 재정이 외부 시장에 크게 묶이는 조건.", { domains: ["finance", "environment"], functions: ["trade", "ration"], enables: ["trade"] }),
    historyOption("sanctions-blockade", "국제 제재·봉쇄", "외부 차단이 물자 부족, 밀수, 국내 통제를 강화하는 조건.", { domains: ["finance", "governance"], functions: ["ration", "monitor"], enables: ["ration"] }),
    historyOption("resource-competition", "자원 경쟁", "토지, 물, 광물, 항로 같은 자원을 둘러싼 경쟁이 커지는 조건.", { domains: ["environment", "finance"], functions: ["allocate", "trade"], enables: ["allocate"] }),
    historyOption("migration-refugees", "난민·이주", "사람의 이동이 노동, 국경, 시민권, 정체성 문제로 이어지는 조건.", { domains: ["migration", "labor"], functions: ["relocate", "license"], rights: ["mobility", "citizenship"], enables: ["relocate"] }),
    historyOption("ideology-spread", "종교·이념 확산", "신앙이나 사상이 국경을 넘어 제도와 정당성에 영향을 주는 조건.", { domains: ["identity", "governance"], functions: ["incentivize", "enforce"], enables: ["incentivize"] }),
    historyOption("border-change", "국경 변화", "영토 편입, 분할, 독립, 점령으로 소속과 권리가 흔들리는 조건.", { domains: ["migration", "identity"], functions: ["license", "relocate"], rights: ["citizenship", "mobility"], enables: ["license"] }),
    historyOption("printing-public-sphere", "인쇄·대중매체 확산", "문자, 신문, 팸플릿, 방송 같은 매체가 여론과 지식 권위를 바꾸는 조건.", { domains: ["education", "identity", "governance"], functions: ["incentivize", "monitor"], enables: ["incentivize"] }),
    historyOption("transport-infrastructure", "교통·물류망 확대", "도로, 철도, 항만, 운하, 해운망이 국가 통합, 시장, 이주 속도를 바꾸는 조건.", { domains: ["migration", "finance", "labor"], functions: ["relocate", "trade"], enables: ["trade", "relocate"] }),
    historyOption("money-credit-system", "화폐·신용 체계 변화", "동전, 지폐, 은행, 채권, 신용 기록이 세금과 거래, 신뢰의 방식을 바꾸는 조건.", { domains: ["finance", "governance"], functions: ["trade", "score"], enables: ["trade", "score"] }),
    historyOption("writing-archive", "문자·기록 체계", "문서, 장부, 인장, 보관소가 기억과 권리, 세금, 계약의 증거 방식을 바꾸는 조건.", { domains: ["education", "governance", "identity"], functions: ["monitor", "license"], enables: ["monitor", "license"] }),
    historyOption("public-health-infrastructure", "상하수도·공중보건 인프라", "도시 위생, 물 공급, 병원, 방역 체계가 국가와 주민의 일상 접점을 넓히는 조건.", { domains: ["healthcare", "housing", "governance"], functions: ["monitor", "separate"], enables: ["monitor"] }),
  ],
  actor: [
    historyOption("central-state", "왕권·중앙정부", "세금, 법, 군사력, 관료제를 통해 사회를 재편하는 행위자.", { domains: ["governance"], functions: ["enforce", "allocate"], tones: ["risk-management"] }),
    historyOption("bureaucracy", "관료제", "등록, 문서, 절차, 심사를 통해 통치를 일상화하는 행위자.", { domains: ["governance"], functions: ["monitor", "license"], tones: ["technocracy"] }),
    historyOption("military", "군부", "안보와 동원을 명분으로 자원과 사람을 조직하는 행위자.", { domains: ["governance", "labor"], functions: ["enforce", "relocate"], tones: ["risk-management"] }),
    historyOption("local-elites", "지방 엘리트", "지역의 토지, 노동, 관습, 네트워크를 장악한 행위자.", { domains: ["housing", "community"], functions: ["allocate", "enforce"], tones: ["meritocracy"] }),
    historyOption("merchants-companies", "상인·기업", "자본, 물류, 계약, 시장 접근권을 통해 제도를 흔드는 행위자.", { domains: ["finance", "labor"], functions: ["trade", "license"], tones: ["marketization"] }),
    historyOption("religious-authority", "종교 권위", "신앙과 도덕 질서를 통해 복종, 저항, 정당성을 조직하는 행위자.", { domains: ["identity", "community"], functions: ["incentivize", "enforce"], tones: ["paternalism"] }),
    historyOption("colonial-administration", "식민 행정", "외부 권력이 분류, 토지, 노동, 법을 재편하는 행위자.", { domains: ["governance", "migration"], functions: ["monitor", "enforce"], tones: ["technocracy"] }),
    historyOption("social-movement", "사회운동", "기존 질서에 맞서 권리, 대표, 생존 조건을 요구하는 행위자.", { domains: ["community", "labor"], functions: ["incentivize"], rights: ["citizenship", "labor"], tones: ["collectivism"] }),
    historyOption("household-family", "가족·가구", "생계, 돌봄, 상속, 혼인, 이주 결정을 일상에서 조정하는 행위자.", { domains: ["community", "reproduction", "labor"], functions: ["allocate", "incentivize"], tones: ["paternalism"] }),
    historyOption("guild-union", "동업조합·노동조합", "직업 규율, 숙련, 임금, 시장 접근, 단체 행동을 조직하는 행위자.", { domains: ["labor", "finance"], functions: ["license", "incentivize"], rights: ["labor"], tones: ["collectivism"] }),
    historyOption("press-intellectuals", "언론·지식인", "문제의 이름을 붙이고 여론, 개혁 담론, 정당성 논쟁을 만드는 행위자.", { domains: ["education", "identity", "governance"], functions: ["incentivize", "monitor"], tones: ["technocracy"] }),
  ],
  target: [
    historyOption("peasants", "농민", "토지, 세금, 노동 동원, 식량 가격 변화에 크게 영향을 받는 집단.", { domains: ["labor", "environment"], functions: ["allocate", "enforce"], rights: ["labor"] }),
    historyOption("urban-workers", "도시 노동자", "임금, 주거, 공장 규율, 도시 행정 변화에 노출되는 집단.", { domains: ["labor", "housing"], functions: ["monitor", "incentivize"], rights: ["labor", "residence"] }),
    historyOption("migrants", "이주민", "국경, 노동시장, 거주 자격, 낯선 공동체 규범 사이에 놓인 집단.", { domains: ["migration", "labor"], functions: ["license", "relocate"], rights: ["mobility", "citizenship"] }),
    historyOption("religious-minority", "소수 종교 집단", "다수의 신앙과 국가 질서 사이에서 권리와 충성심을 의심받는 집단.", { domains: ["identity", "community"], functions: ["exclude", "license"], rights: ["citizenship"] }),
    historyOption("ethnic-minority", "특정 민족 집단", "민족 분류, 국경, 동화 정책, 배제의 영향을 받는 집단.", { domains: ["identity", "migration"], functions: ["exclude", "relocate"], rights: ["citizenship", "mobility"] }),
    historyOption("women", "여성", "가족, 노동, 재산, 교육, 시민권 제도 변화에 다르게 노출되는 집단.", { domains: ["labor", "reproduction"], functions: ["license", "allocate"], rights: ["reproduction", "labor"] }),
    historyOption("debtors", "채무자", "부채, 담보, 노동 의무, 신용 질서에 묶이는 집단.", { domains: ["finance", "labor"], functions: ["trade", "enforce"], rights: ["labor", "citizenship"] }),
    historyOption("colonized-people", "식민지 주민", "외부 통치가 토지, 노동, 법, 교육, 정체성을 재편하는 조건에 놓인 집단.", { domains: ["governance", "migration"], functions: ["enforce", "monitor"], rights: ["citizenship", "mobility"] }),
    historyOption("noncitizens", "비시민·무국적자", "소속이 불안정해 이동, 노동, 보호, 법적 권리가 조건부가 되는 집단.", { domains: ["migration", "identity"], functions: ["license", "exclude"], rights: ["citizenship", "mobility"] }),
    historyOption("students-youth", "학생·청년", "교육, 징병, 취업, 정치 동원, 세대 규범 변화의 영향을 크게 받는 집단.", { domains: ["education", "labor", "identity"], functions: ["incentivize", "monitor"], rights: ["citizenship", "labor"] }),
    historyOption("artisans-small-producers", "장인·소생산자", "기술 변화, 시장 확대, 길드 해체, 공장제 전환 사이에서 생계 방식이 흔들리는 집단.", { domains: ["labor", "finance"], functions: ["trade", "license"], rights: ["labor"] }),
    historyOption("borderland-communities", "접경지 주민", "국경, 전쟁, 교역, 언어, 충성 요구가 겹치는 지역에서 소속이 흔들리는 집단.", { domains: ["migration", "identity", "governance"], functions: ["license", "relocate"], rights: ["citizenship", "mobility"] }),
    historyOption("consumers-households", "소비자·가구", "가격, 배급, 광고, 가계 예산, 생활 규범 변화가 일상 선택을 바꾸는 집단.", { domains: ["finance", "community"], functions: ["trade", "allocate"], rights: ["residence"] }),
    historyOption("religious-communities", "종교 공동체", "의례, 교육, 자선, 규범, 정체성을 통해 국가와 시장 변화에 반응하는 집단.", { domains: ["identity", "community", "education"], functions: ["incentivize", "license"], rights: ["citizenship"] }),
    historyOption("artists-performers", "예술가·공연자", "후원, 검열, 대중 취향, 매체 변화 속에서 표현의 조건이 바뀌는 집단.", { domains: ["identity", "education", "community"], functions: ["incentivize", "monitor"], rights: ["identity"] }),
  ],
  metric: [
    historyOption("status", "신분", "태어난 위치나 법적 지위에 따라 의무와 권리를 나누는 기준.", { domains: ["identity"], functions: ["license", "exclude"], rights: ["citizenship"] }),
    historyOption("class", "계급", "재산, 노동, 생산관계에 따라 사람을 나누는 기준.", { domains: ["labor", "finance"], functions: ["score", "allocate"], rights: ["labor"] }),
    historyOption("property", "재산", "토지, 자산, 소유 여부로 권리와 책임을 배분하는 기준.", { domains: ["finance", "housing"], functions: ["trade", "allocate"], rights: ["residence"] }),
    historyOption("tax-capacity", "납세 능력", "국가 재정에 기여할 수 있는 정도로 사람을 분류하는 기준.", { domains: ["finance", "governance"], functions: ["score", "allocate"], rights: ["citizenship"] }),
    historyOption("religion", "종교", "신앙 소속과 의례 참여를 권리와 신뢰의 기준으로 삼는 방식.", { domains: ["identity", "community"], functions: ["license", "exclude"], rights: ["citizenship"] }),
    historyOption("ethnicity", "민족", "언어, 혈통, 문화, 출신을 행정 분류로 고정하는 기준.", { domains: ["identity", "migration"], functions: ["exclude", "relocate"], rights: ["citizenship"] }),
    historyOption("residence", "거주지", "어디 사는지를 세금, 권리, 동원, 감시의 기준으로 삼는 방식.", { domains: ["housing", "migration"], functions: ["allocate", "monitor"], rights: ["residence", "mobility"] }),
    historyOption("citizenship", "시민권", "법적 소속 여부로 보호, 참여, 이동, 노동 권리를 나누는 기준.", { domains: ["identity", "governance"], functions: ["license", "exclude"], rights: ["citizenship"] }),
    historyOption("health-risk", "건강 상태·위험도", "질병, 장애, 위험 가능성으로 이동과 보호를 조정하는 기준.", { domains: ["healthcare"], functions: ["predict", "separate"], rights: ["healthcare", "mobility"] }),
    historyOption("productivity", "생산성", "경제나 전쟁에 얼마나 기여하는지로 사람을 평가하는 기준.", { domains: ["labor", "finance"], functions: ["score", "incentivize"], rights: ["labor"] }),
    historyOption("literacy-education", "문해·교육 수준", "읽고 쓰는 능력과 학교 이력이 행정, 직업, 시민 자격의 기준이 되는 방식.", { domains: ["education", "labor", "governance"], functions: ["score", "license"], rights: ["citizenship", "labor"] }),
    historyOption("gender-family-status", "성별·가족 지위", "성별, 혼인, 출산, 가장 여부가 권리와 의무를 나누는 기준.", { domains: ["reproduction", "identity", "labor"], functions: ["license", "allocate"], rights: ["reproduction", "labor"] }),
    historyOption("loyalty-reputation", "충성·평판", "정치적 신뢰, 도덕성, 소문, 평판이 권리와 기회를 가르는 기준.", { domains: ["identity", "governance"], functions: ["score", "monitor"], rights: ["citizenship"] }),
    historyOption("language-cultural-practice", "언어·문화 관습", "말, 문자, 의례, 복장, 식습관이 소속과 차이를 판별하는 기준이 되는 방식.", { domains: ["identity", "education", "community"], functions: ["license", "monitor"], rights: ["identity"] }),
    historyOption("age-life-stage", "나이·생애 단계", "아동, 청년, 성인, 노년 같은 생애 단계가 교육, 노동, 병역, 돌봄 의무를 나누는 기준.", { domains: ["aging", "labor", "education"], functions: ["allocate", "license"], rights: ["labor", "citizenship"] }),
  ],
  mechanism: [
    historyOption("taxation", "세금", "부담과 소속을 수치로 만들고 국가 재정을 확보하는 수단.", { domains: ["finance", "governance"], functions: ["allocate", "enforce"], mechanisms: ["allocate", "enforce"] }),
    historyOption("population-register", "호적·인구 등록", "사람을 이름, 가족, 거주지, 신분으로 기록해 통치하는 수단.", { domains: ["identity", "governance"], functions: ["monitor", "license"], mechanisms: ["monitor"] }),
    historyOption("land-survey", "토지 조사", "토지 소유, 수확, 세금, 권리를 재계산하는 수단.", { domains: ["housing", "finance"], functions: ["monitor", "allocate"], mechanisms: ["monitor"] }),
    historyOption("conscription", "징병", "국가가 사람의 신체와 시간을 군사 목적으로 동원하는 수단.", { domains: ["labor", "governance"], functions: ["enforce", "allocate"], mechanisms: ["enforce"] }),
    historyOption("quarantine", "검역", "질병과 위험을 이유로 이동과 접촉을 제한하는 수단.", { domains: ["healthcare", "migration"], functions: ["separate", "monitor"], mechanisms: ["separate"] }),
    historyOption("rationing", "배급", "희소 자원을 순번, 자격, 필요에 따라 배분하는 수단.", { domains: ["environment", "finance"], functions: ["ration", "allocate"], mechanisms: ["ration"] }),
    historyOption("education", "교육", "지식과 언어, 규율, 소속감을 장기적으로 형성하는 수단.", { domains: ["education", "identity"], functions: ["incentivize", "monitor"], mechanisms: ["incentivize"] }),
    historyOption("propaganda", "선전", "정책의 명분과 적대 이미지를 반복해 여론을 조직하는 수단.", { domains: ["governance", "identity"], functions: ["incentivize"], tones: ["collectivism"], mechanisms: ["incentivize"] }),
    historyOption("surveillance", "감시", "위험, 저항, 이동, 노동을 관찰하고 예측하는 수단.", { domains: ["privacy", "governance"], functions: ["monitor", "predict"], rights: ["privacy"], mechanisms: ["monitor"] }),
    historyOption("debt", "부채", "미래의 노동과 선택을 현재의 계약으로 묶는 수단.", { domains: ["finance", "labor"], functions: ["trade", "enforce"], mechanisms: ["trade"] }),
    historyOption("law-punishment", "법원·처벌", "규범 위반을 판정하고 복종의 경계를 만드는 수단.", { domains: ["governance"], functions: ["license", "enforce"], mechanisms: ["enforce"] }),
    historyOption("forced-movement", "강제 이동", "인구를 영토, 노동, 안보, 개발 목적에 맞춰 재배치하는 수단.", { domains: ["migration", "housing"], functions: ["relocate", "enforce"], rights: ["mobility", "residence"], mechanisms: ["relocate"] }),
    historyOption("census-statistics", "센서스·통계", "사람과 자원을 숫자로 세어 세금, 동원, 복지, 차별의 근거를 만드는 수단.", { domains: ["governance", "identity"], functions: ["monitor", "score"], mechanisms: ["monitor", "score"] }),
    historyOption("passport-documents", "통행증·신분 문서", "이동, 체류, 노동, 소속을 종이와 기록으로 증명하게 만드는 수단.", { domains: ["migration", "identity"], functions: ["license", "monitor"], rights: ["mobility", "citizenship"], mechanisms: ["license"] }),
    historyOption("price-control", "가격 통제", "물가와 임금을 정하거나 제한해 생계와 시장 질서를 관리하는 수단.", { domains: ["finance", "labor"], functions: ["ration", "allocate"], mechanisms: ["ration", "allocate"] }),
    historyOption("school-curriculum", "학교 교육과정", "역사, 언어, 규율, 시민성, 직업 윤리를 교실 안에서 반복해 익히게 하는 수단.", { domains: ["education", "identity", "governance"], functions: ["incentivize", "monitor"], mechanisms: ["incentivize"] }),
    historyOption("urban-planning", "도시 계획", "도로, 광장, 주거지, 위생 시설, 상업 공간을 배치해 생활 동선과 감시 가능성을 바꾸는 수단.", { domains: ["housing", "governance", "community"], functions: ["allocate", "monitor"], mechanisms: ["allocate", "monitor"] }),
    historyOption("ritual-calendar", "의례·달력 규정", "축제, 휴일, 추모일, 예배일, 국가 기념일을 통해 시간 감각과 소속을 조직하는 수단.", { domains: ["identity", "community"], functions: ["incentivize", "monitor"], mechanisms: ["incentivize"] }),
  ],
  ideology: [
    historyOption("order", "질서", "혼란을 막는다는 명분으로 통제와 위계를 정당화하는 언어.", { domains: ["governance"], functions: ["enforce"], tones: ["risk-management"] }),
    historyOption("security", "안보", "외부 위협과 내부 위험을 이유로 권리 제한을 정당화하는 언어.", { domains: ["governance"], functions: ["monitor", "enforce"], tones: ["risk-management"] }),
    historyOption("public-good", "공익", "개인의 손실을 전체의 이익과 필요로 설명하는 언어.", { domains: ["governance"], functions: ["allocate"], tones: ["utilitarianism"] }),
    historyOption("civilization", "문명화", "다른 집단을 미성숙하거나 뒤처진 상태로 규정하는 언어.", { domains: ["identity", "governance"], functions: ["incentivize", "exclude"], tones: ["paternalism"] }),
    historyOption("efficiency", "효율", "논쟁과 다양성을 비용으로 보고 빠른 처리를 우선하는 언어.", { domains: ["finance", "governance"], functions: ["optimize"], tones: ["technocracy", "utilitarianism"] }),
    historyOption("hygiene", "위생", "청결과 건강을 이유로 공간, 몸, 접촉을 관리하는 언어.", { domains: ["healthcare", "housing"], functions: ["monitor", "separate"], tones: ["paternalism"] }),
    historyOption("faith", "신앙", "초월적 질서나 도덕을 통해 권력과 의무를 설명하는 언어.", { domains: ["identity", "community"], functions: ["incentivize"], tones: ["paternalism"] }),
    historyOption("progress", "진보", "새로운 제도나 기술이 더 나은 미래로 가는 길이라고 말하는 언어.", { domains: ["digital-life", "education"], functions: ["optimize"], tones: ["technocracy"] }),
    historyOption("freedom", "자유", "선택권을 준다는 말로 비용과 책임을 개인에게 넘기는 언어.", { domains: ["finance", "identity"], functions: ["trade"], tones: ["marketization"] }),
    historyOption("equality", "평등", "동일한 규칙을 적용한다는 말로 다른 출발 조건을 가리는 언어.", { domains: ["governance", "community"], functions: ["allocate"], tones: ["collectivism"] }),
    historyOption("national-survival", "국가 생존", "공동체의 존속을 이유로 동원과 희생을 요구하는 언어.", { domains: ["governance"], functions: ["enforce"], tones: ["collectivism"] }),
    historyOption("economic-growth", "경제 성장", "생산과 축적을 위해 노동, 토지, 삶의 리듬을 재편하는 언어.", { domains: ["finance", "labor"], functions: ["incentivize"], tones: ["marketization"] }),
    historyOption("tradition", "전통", "오래된 관습과 질서를 지킨다는 말로 변화나 차등을 설명하는 언어.", { domains: ["identity", "community"], functions: ["incentivize"], tones: ["paternalism"] }),
    historyOption("merit", "능력주의", "시험, 성과, 근면, 자격을 근거로 차등을 정당화하는 언어.", { domains: ["education", "labor"], functions: ["score", "license"], tones: ["meritocracy"] }),
    historyOption("humanitarianism", "인도주의", "보호와 구제를 말하면서 개입, 감시, 분류의 권한을 넓히는 언어.", { domains: ["healthcare", "governance", "community"], functions: ["allocate", "monitor"], tones: ["welfare-language", "paternalism"] }),
  ],
  transformation: [
    historyOption("rights-expansion", "권리 확대", "새로운 집단이 보호, 참여, 교육, 이동의 권리를 얻는 변화.", { domains: ["governance"], functions: ["license"], rights: ["citizenship"] }),
    historyOption("rights-restriction", "권리 제한", "안전, 질서, 비용을 이유로 권리 접근이 좁아지는 변화.", { domains: ["governance"], functions: ["exclude", "license"], rights: ["citizenship", "mobility"] }),
    historyOption("property-redistribution", "재산 재분배", "토지, 세금, 부채, 보상을 통해 소유 구조가 바뀌는 변화.", { domains: ["finance", "housing"], functions: ["allocate", "trade"], rights: ["residence"] }),
    historyOption("labor-mobilization", "노동 동원", "특정 집단의 시간과 신체가 국가, 시장, 공동체 목적에 배치되는 변화.", { domains: ["labor", "governance"], functions: ["enforce", "incentivize"], rights: ["labor"] }),
    historyOption("forced-migration", "강제 이동", "사람이 살 곳과 이동 경로가 행정적으로 정해지는 변화.", { domains: ["migration", "housing"], functions: ["relocate", "enforce"], rights: ["mobility", "residence"] }),
    historyOption("assimilation-policy", "동화 정책", "언어, 교육, 종교, 이름, 생활양식이 특정 기준에 맞춰지는 변화.", { domains: ["identity", "education"], functions: ["incentivize", "monitor"], rights: ["identity"] }),
    historyOption("surveillance-expansion", "감시 강화", "기록, 신고, 관찰, 검열이 넓어지는 변화.", { domains: ["privacy", "governance"], functions: ["monitor", "predict"], rights: ["privacy"] }),
    historyOption("welfare-expansion", "복지 확대", "보호와 지원이 늘어나지만 자격 심사와 조건도 함께 커질 수 있는 변화.", { domains: ["healthcare", "finance"], functions: ["allocate", "monitor"], rights: ["healthcare"] }),
    historyOption("marketization", "시장화", "권리나 공공재가 가격, 계약, 경쟁의 언어로 바뀌는 변화.", { domains: ["finance"], functions: ["trade", "license"], tones: ["marketization"] }),
    historyOption("citizenship-redefinition", "시민권 재정의", "누가 구성원인지, 어떤 권리와 의무를 갖는지가 다시 정해지는 변화.", { domains: ["identity", "governance"], functions: ["license", "exclude"], rights: ["citizenship"] }),
    historyOption("border-reorganization", "국경 재편", "영토와 소속의 경계가 바뀌며 권리와 기억이 다시 배열되는 변화.", { domains: ["migration", "identity"], functions: ["relocate", "license"], rights: ["mobility", "citizenship"] }),
    historyOption("repression", "저항 탄압", "불복종과 항의를 처벌하거나 봉쇄하는 변화.", { domains: ["governance", "community"], functions: ["enforce", "monitor"], rights: ["citizenship"] }),
    historyOption("administrative-standardization", "행정 표준화", "지역별 관습과 예외가 문서, 법, 단위, 절차의 공통 기준으로 바뀌는 변화.", { domains: ["governance", "finance"], functions: ["monitor", "license"], rights: ["citizenship"] }),
    historyOption("public-education-expansion", "공교육 확대", "국가와 공동체가 언어, 지식, 규율, 소속감을 학교를 통해 재구성하는 변화.", { domains: ["education", "identity"], functions: ["incentivize", "monitor"], rights: ["citizenship"] }),
    historyOption("commons-privatization", "공유지·공동자원 사유화", "공동으로 쓰던 토지, 숲, 물, 지식, 인프라가 소유와 계약의 질서로 바뀌는 변화.", { domains: ["environment", "finance", "housing"], functions: ["trade", "exclude"], rights: ["residence"] }),
  ],
  careNarrative: [
    historyOption("rebellion", "반란", "폭력적·집단적 봉기를 통해 질서에 맞서는 반응.", { domains: ["community", "governance"], functions: ["enforce"], tones: ["collectivism"] }),
    historyOption("strike", "파업", "노동을 멈춰 교섭력과 권리를 요구하는 반응.", { domains: ["labor"], functions: ["incentivize"], rights: ["labor"] }),
    historyOption("lawsuit", "소송", "법적 절차로 제도의 경계와 권리를 다투는 반응.", { domains: ["governance"], functions: ["license"], rights: ["citizenship"] }),
    historyOption("religious-resistance", "종교적 저항", "신앙과 의례를 통해 국가나 시장의 요구를 거부하는 반응.", { domains: ["identity", "community"], functions: ["incentivize"] }),
    historyOption("flight-migration", "도피·이주", "권력의 손이 닿는 곳을 벗어나 생존 조건을 찾는 반응.", { domains: ["migration"], functions: ["relocate"], rights: ["mobility"] }),
    historyOption("black-market", "암시장", "공식 배급과 통제를 우회해 생존과 거래를 이어가는 반응.", { domains: ["finance"], functions: ["trade"], tones: ["marketization"] }),
    historyOption("rumor-humor", "소문·농담", "공개적으로 말하기 어려운 불만이 이야기와 농담으로 도는 반응.", { domains: ["community", "identity"], functions: ["incentivize"] }),
    historyOption("petition", "청원", "기존 권력의 언어를 빌려 시정과 예외를 요구하는 반응.", { domains: ["governance"], functions: ["license"], rights: ["citizenship"] }),
    historyOption("reform-movement", "개혁 운동", "제도의 틀 안팎에서 장기적 변화를 요구하는 반응.", { domains: ["community", "education"], functions: ["incentivize"], rights: ["citizenship"] }),
    historyOption("international-criticism", "국제 비판", "외부 여론, 외교, 단체가 제도의 정당성을 압박하는 반응.", { domains: ["governance"], functions: ["incentivize"] }),
    historyOption("bureaucratic-resistance", "내부 관료 반발", "집행 현장의 관료가 정책을 지연, 수정, 우회하는 반응.", { domains: ["governance"], functions: ["monitor"] }),
    historyOption("institutional-failure", "제도 실패", "정책이 의도와 다르게 작동하거나 역효과를 낳는 균열.", { domains: ["governance", "finance"], functions: ["predict"], tones: ["risk-management"] }),
    historyOption("mutual-aid", "상호부조", "국가나 시장 밖에서 공동체가 생계, 돌봄, 위험을 함께 나누는 반응.", { domains: ["community", "finance"], functions: ["allocate", "incentivize"], tones: ["collectivism"] }),
    historyOption("cultural-revival", "문화 부흥·정체성 회복", "언어, 의례, 예술, 기억을 통해 지워진 소속과 존엄을 되찾는 반응.", { domains: ["identity", "community", "education"], functions: ["incentivize"], rights: ["identity"] }),
    historyOption("satire-literature", "비판 문학·예술 표현", "공개 정치가 막힌 상황에서 예술과 이야기로 권력의 모순을 드러내는 반응.", { domains: ["identity", "community"], functions: ["incentivize"], tones: ["collectivism"] }),
    historyOption("everyday-adaptation", "일상생활의 적응", "식사, 주거, 시간표, 가족 역할, 소비 방식이 새 조건에 맞춰 조금씩 바뀌는 반응.", { domains: ["community", "housing", "finance"], functions: ["allocate", "trade"], tones: ["welfare-language"] }),
    historyOption("popular-culture", "대중문화", "노래, 연극, 영화, 만화, 유행어가 사회 변화의 불안과 욕망을 드러내는 반응.", { domains: ["identity", "community", "education"], functions: ["incentivize"], tones: ["collectivism"] }),
    historyOption("memory-commemoration", "기억·기념", "기념비, 추모식, 교과서, 박물관이 과거를 해석하고 현재의 소속을 만드는 반응.", { domains: ["identity", "governance", "education"], functions: ["incentivize", "monitor"], rights: ["identity"] }),
    historyOption("material-culture", "물질문화", "의복, 도구, 음식, 주거 양식, 소비재가 권력과 생활 조건의 변화를 몸으로 보여주는 반응.", { domains: ["identity", "community", "finance"], functions: ["trade", "incentivize"], tones: ["marketization"] }),
  ],
};

const CORE_KEYS = ["pressure", "target", "technology", "transformation", "ideology"];
const DETAIL_KEYS = ["actor", "metric", "mechanism", "benefit", "careNarrative"];
const AMPLIFIER_KEYS = ["classDistortion", "feedbackLoop", "victimInternalization", "irreversibility"];
const ALL_KEYS = [...CORE_KEYS, ...DETAIL_KEYS, ...AMPLIFIER_KEYS];

const EMPTY_INPUT = Object.freeze({ mode: "preset", optionId: "", optionIds: [], customText: "" });

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

function averageNumber(values, fallback) {
  const valid = values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  if (valid.length === 0) return fallback;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
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
  return globalThis.HistoryLensEngine || globalThis.SatireIdeaEngine || null;
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
  if (Array.isArray(HISTORY_CATEGORY_OPTIONS[categoryKey])) return [...HISTORY_CATEGORY_OPTIONS[categoryKey]];
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
  const visibleOption = getCategoryOptions(categoryKey).find((option) => option.id === optionId);
  if (visibleOption) return visibleOption;
  const dataKey = CATEGORY_KEY_MAP[categoryKey];
  const legacyOptions = dataKey ? allCategories[dataKey] : null;
  return Array.isArray(legacyOptions) ? legacyOptions.find((option) => option.id === optionId) || null : null;
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

export function createPresetMultiSelection(categoryKey, optionIds = []) {
  const options = uniqueStrings(optionIds)
    .map((optionId) => findPresetOption(categoryKey, optionId))
    .filter(Boolean);
  if (options.length === 0) return null;
  if (options.length === 1) return createPresetSelection(categoryKey, options[0].id);
  const label = options.map((option) => option.label).join(", ");
  const option = {
    id: options.map((item) => item.id).join("+"),
    label,
    description: `여러 보기를 함께 선택: ${options.map((item) => item.description).filter(Boolean).join(" / ")}`,
    source: "preset",
    rawText: label,
    domains: uniqueStrings(options.flatMap((item) => item.domains || [])),
    functions: uniqueStrings(options.flatMap((item) => item.functions || [])),
    rights: uniqueStrings(options.flatMap((item) => item.rights || [])),
    tones: uniqueStrings(options.flatMap((item) => item.tones || [])),
    needs: uniqueStrings(options.flatMap((item) => item.needs || [])),
    enables: uniqueStrings(options.flatMap((item) => item.enables || [])),
    mechanisms: uniqueStrings(options.flatMap((item) => item.mechanisms || [])),
    plausibility: averageNumber(options.map((item) => item.plausibility), 0.8),
    novelty: averageNumber(options.map((item) => item.novelty), 0.45),
    madness: averageNumber(options.map((item) => item.madness), 0.35),
    selectedOptions: options.map((item) => ({ id: item.id, label: item.label })),
  };
  return { mode: "preset", categoryKey, optionId: options[0].id, optionIds: options.map((item) => item.id), customText: "", option };
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
  const optionIds = uniqueStrings(Array.isArray(input.optionIds) ? input.optionIds : []);
  const presetIds = optionIds.length > 0 ? optionIds : optionId ? [optionId] : [];
  if (mode === "custom" && customText) {
    const option = createEnrichedCustomOption(categoryKey, customText, input.metadata);
    return option ? { mode: "custom", categoryKey, optionId: "", customText: option.label, option } : null;
  }
  if (mode === "preset") return createPresetMultiSelection(categoryKey, presetIds);
  if (customText) {
    const option = createEnrichedCustomOption(categoryKey, customText, input.metadata);
    return option ? { mode: "custom", categoryKey, optionId: "", customText: option.label, option } : null;
  }
  if (presetIds.length > 0) return createPresetMultiSelection(categoryKey, presetIds);
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
    throw new Error("HistoryLensEngine.evaluateConcept is required.");
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
  const hasAnyInput = resolved.customCount + resolved.presetCount > 0;
  const missingCore = [];
  const warnings = [];
  const info = [];
  if (!hasAnyInput) info.push("조건을 하나 이상 입력하면 세계사 비교 질문을 만들 수 있습니다.");
  if (resolved.customCount >= 1) warnings.push("직접 입력 항목은 판단 근거가 제한적일 수 있습니다.");
  const customTexts = ALL_KEYS.map((key) => normalizeText(formState[key] && formState[key].customText)).filter(Boolean);
  if (customTexts.some((text, index) => customTexts.indexOf(text) !== index)) {
    warnings.push("동일한 직접 입력이 여러 항목에 반복됩니다.");
  }
  if (AMPLIFIER_KEYS.filter((key) => resolved.amplifier[key]).length >= 3) {
    warnings.push("작동과 결과 요소가 3개 이상이면 비교 쟁점이 산만해질 수 있습니다.");
  }
  return { isCoreComplete: hasAnyInput, missingCore, warnings, info };
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
    const optionIds = uniqueStrings(Array.isArray(value.optionIds) ? value.optionIds : []);
    if (optionIds.length === 0 && typeof value.optionId === "string" && value.optionId !== "") optionIds.push(value.optionId);
    const item = {
      mode: value.mode === "custom" ? "custom" : "preset",
      optionId: typeof value.optionId === "string" ? value.optionId : optionIds[0] || "",
      optionIds,
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
    const optionIds = uniqueStrings(Array.isArray(value.optionIds) ? value.optionIds : []);
    if (optionIds.length === 0 && typeof value.optionId === "string" && value.optionId !== "") optionIds.push(value.optionId);
    const item = {
      mode: value.mode === "custom" ? "custom" : "preset",
      optionId: typeof value.optionId === "string" ? value.optionId : optionIds[0] || "",
      optionIds,
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
