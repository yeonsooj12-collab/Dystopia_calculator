// engine.js
// DOM에 의존하지 않는 호환성 평가 함수 모음이다.

(function attachEngine(root) {
  const DEFAULT_PAIR_WEIGHTS = {
    domains: 0.25,
    functions: 0.2,
    rights: 0.3,
    tones: 0.15,
    directional: 0.1,
  };

  const CORE_KEYS = ["pressure", "target", "technology", "transformation", "ideology"];
  const DETAIL_KEYS = ["actor", "metric", "mechanism", "benefit", "careNarrative"];
  const AMPLIFIER_KEYS = ["classDistortion", "feedbackLoop", "victimInternalization", "irreversibility"];

  const ID_CATEGORY_MAP = {
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

  const CORE_PAIR_DEFINITIONS = [
    ["pressure", "target", 1],
    ["pressure", "technology", 1.4],
    ["pressure", "transformation", 1.5],
    ["pressure", "ideology", 1],
    ["target", "technology", 1],
    ["target", "transformation", 1.3],
    ["technology", "transformation", 1.5],
    ["transformation", "ideology", 1.2],
  ];

  const CORE_LABELS = {
    pressure: "사회 압력",
    target: "영향을 받는 집단",
    technology: "외부 조건",
    transformation: "실제 변화",
    ideology: "정당화 언어",
  };

  const DETAIL_LABELS = {
    actor: "주도 행위자",
    metric: "분류 기준",
    mechanism: "통치 수단",
    benefit: "공식 효용",
    careNarrative: "저항·균열",
  };

  const AMPLIFIER_LABELS = {
    classDistortion: "계층 왜곡",
    feedbackLoop: "피드백 루프",
    victimInternalization: "제도 논리의 자기내면화",
    irreversibility: "비가역성",
  };

  const SEMANTIC_BRIDGES = [
    ["aging", "healthcare"],
    ["aging", "finance"],
    ["aging", "housing"],
    ["labor", "finance"],
    ["labor", "education"],
    ["labor", "governance"],
    ["healthcare", "privacy"],
    ["healthcare", "finance"],
    ["housing", "migration"],
    ["housing", "finance"],
    ["reproduction", "healthcare"],
    ["reproduction", "governance"],
    ["climate", "environment"],
    ["climate", "migration"],
    ["identity", "privacy"],
    ["identity", "digital-life"],
    ["governance", "privacy"],
    ["governance", "citizenship"],
    ["community", "human-contact"],
    ["allocate", "ration"],
    ["score", "predict"],
    ["monitor", "predict"],
    ["license", "enforce"],
    ["relocate", "allocate"],
    ["trade", "marketization"],
    ["replicate", "digital-life"],
    ["edit", "memory"],
    ["insure", "healthcare"],
    ["optimize", "automate"],
    ["residence", "relocate"],
    ["residence", "allocate"],
    ["healthcare", "insure"],
    ["privacy", "monitor"],
    ["citizenship", "license"],
    ["mobility", "relocate"],
    ["memory", "edit"],
    ["deletion", "edit"],
    ["reproduction", "license"],
    ["human-contact", "automate"],
  ];

  const BRIDGE_MAP = buildBridgeMap(SEMANTIC_BRIDGES);

  function buildBridgeMap(pairs) {
    const map = {};
    for (const [left, right] of pairs) {
      if (!map[left]) map[left] = new Set();
      if (!map[right]) map[right] = new Set();
      map[left].add(right);
      map[right].add(left);
    }
    return map;
  }

  function asArray(value) {
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  }

  function unique(values) {
    return [...new Set(asArray(values))];
  }

  function clamp(value, min = 0, max = 100) {
    const number = Number.isFinite(value) ? value : 0;
    return Math.min(max, Math.max(min, number));
  }

  function roundScore(value) {
    return Math.round(clamp(value));
  }

  function average(values) {
    const valid = values.filter((value) => Number.isFinite(value));
    if (valid.length === 0) return 0;
    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
  }

  function confidenceFromCoverage(coverage, medium = 0.35, high = 0.7) {
    if (coverage >= high) return "high";
    if (coverage >= medium) return "medium";
    return "low";
  }

  function selectedOptionsFromSelection(selection) {
    if (!selection || typeof selection !== "object") return [];
    return Object.values(selection).filter((item) => item && typeof item === "object");
  }

  function pairName(leftKey, rightKey) {
    return `${CORE_LABELS[leftKey] || leftKey} ↔ ${CORE_LABELS[rightKey] || rightKey}`;
  }

  function makeStrength(pair) {
    return `${pair.name} 연결 근거가 충분합니다.`;
  }

  function makeWeakness(pair) {
    return `${pair.name} 연결이 약한 편입니다.`;
  }

  /**
   * 두 문자열 배열의 중복 없는 교집합을 반환한다.
   * @param {unknown} a
   * @param {unknown} b
   * @returns {string[]}
   */
  function intersectTags(a, b) {
    const left = new Set(unique(a));
    return unique(b).filter((tag) => left.has(tag));
  }

  /**
   * 두 태그 배열의 Jaccard 유사도를 0~1로 반환한다.
   * @param {unknown} a
   * @param {unknown} b
   * @returns {number}
   */
  function overlapScore(a, b) {
    const left = unique(a);
    const right = unique(b);
    if (left.length === 0 && right.length === 0) return 0;
    const union = new Set([...left, ...right]);
    if (union.size === 0) return 0;
    return intersectTags(left, right).length / union.size;
  }

  /**
   * 작은 태그 집합이 큰 태그 집합에 포함될 때 과도하게 낮아지지 않는 겹침 점수다.
   * @param {unknown} a
   * @param {unknown} b
   * @returns {number|null}
   */
  function adjustedOverlapScore(a, b) {
    const left = unique(a);
    const right = unique(b);
    if (left.length === 0 || right.length === 0) return null;
    const intersectionCount = intersectTags(left, right).length;
    if (intersectionCount === 0) return 0;
    return intersectionCount / Math.min(left.length, right.length);
  }

  /**
   * 직접 일치하지 않는 태그 사이의 약한 의미 연결 점수를 계산한다.
   * @param {unknown} tagsA
   * @param {unknown} tagsB
   * @param {Record<string, Set<string>>=} bridgeMap
   * @returns {{score:number|null,matches:object[]}}
   */
  function semanticBridgeScore(tagsA, tagsB, bridgeMap = BRIDGE_MAP) {
    const left = unique(tagsA);
    const right = unique(tagsB);
    if (left.length === 0 || right.length === 0) return { score: null, matches: [] };
    if (intersectTags(left, right).length > 0) return { score: 0, matches: [] };

    const matches = [];
    for (const a of left) {
      for (const b of right) {
        if (bridgeMap[a] && bridgeMap[a].has(b)) matches.push({ from: a, to: b });
      }
    }

    if (matches.length === 0) return { score: 0, matches: [] };
    return { score: matches.length >= 2 ? 0.55 : 0.35, matches };
  }

  /**
   * required 중 offered가 충족하는 비율을 0~1로 반환한다.
   * @param {unknown} required
   * @param {unknown} offered
   * @returns {number}
   */
  function directionalScore(required, offered) {
    const requiredTags = unique(required);
    const offeredTags = unique(offered);
    if (requiredTags.length === 0 || offeredTags.length === 0) return 0;
    return intersectTags(requiredTags, offeredTags).length / requiredTags.length;
  }

  function getDirectionalComparisons(optionA, optionB) {
    const comparisons = [
      { source: optionA, target: optionB, from: "needs", to: "enables" },
      { source: optionB, target: optionA, from: "needs", to: "enables" },
      { source: optionA, target: optionB, from: "needs", to: "mechanisms" },
      { source: optionB, target: optionA, from: "needs", to: "mechanisms" },
    ];
    return comparisons.filter(
      (comparison) =>
        asArray(comparison.source && comparison.source[comparison.from]).length > 0 &&
        asArray(comparison.target && comparison.target[comparison.to]).length > 0,
    );
  }

  function scoreDimension(optionA, optionB, fieldName) {
    const left = unique(optionA[fieldName]);
    const right = unique(optionB[fieldName]);
    if (left.length === 0 || right.length === 0) {
      return { score: null, directMatches: [], semanticMatches: [] };
    }
    const directMatches = intersectTags(left, right);
    const directScore = adjustedOverlapScore(left, right);
    if (directScore && directScore > 0) return { score: directScore, directMatches, semanticMatches: [] };
    const bridge = semanticBridgeScore(left, right);
    return {
      score: bridge.score && bridge.score > 0 ? bridge.score : 0,
      directMatches,
      semanticMatches: bridge.matches,
    };
  }

  function scoreDirectional(optionA, optionB) {
    const directionalComparisons = getDirectionalComparisons(optionA, optionB);
    if (directionalComparisons.length === 0) {
      return { score: null, results: [], hasData: false, hasMatch: false };
    }
    const results = directionalComparisons.map((comparison) => {
      const required = asArray(comparison.source[comparison.from]);
      const offered = asArray(comparison.target[comparison.to]);
      return {
        from: comparison.from,
        to: comparison.to,
        matched: intersectTags(required, offered),
        score: directionalScore(required, offered),
      };
    });
    return {
      score: average(results.map((item) => item.score)),
      results,
      hasData: true,
      hasMatch: results.some((item) => item.matched.length > 0),
    };
  }

  function weightedAvailableScore(components, weights) {
    const entries = Object.entries(weights).filter(([key]) => Number.isFinite(components[key]));
    if (entries.length === 0) return null;
    const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
    if (totalWeight <= 0) return null;
    return entries.reduce((sum, [key, weight]) => sum + components[key] * weight, 0) / totalWeight;
  }

  /**
   * 두 선택지 객체의 호환성과 판단 근거의 충분성을 함께 평가한다.
   * @param {object|null} optionA
   * @param {object|null} optionB
   * @param {{weights?: Partial<typeof DEFAULT_PAIR_WEIGHTS>}=} config
   * @returns {{score:number,components:object,matches:object,warnings:string[],evidence:object}}
   */
  function scorePair(optionA, optionB, config = {}) {
    const weights = { ...DEFAULT_PAIR_WEIGHTS, ...(config.weights || {}) };
    const a = optionA && typeof optionA === "object" ? optionA : {};
    const b = optionB && typeof optionB === "object" ? optionB : {};
    const componentDetails = {
      domains: scoreDimension(a, b, "domains"),
      functions: scoreDimension(a, b, "functions"),
      rights: scoreDimension(a, b, "rights"),
      tones: scoreDimension(a, b, "tones"),
    };
    const directional = scoreDirectional(a, b);

    const components = {
      domains: componentDetails.domains.score,
      functions: componentDetails.functions.score,
      rights: componentDetails.rights.score,
      tones: componentDetails.tones.score,
      directional: directional.score,
    };

    const matches = {
      domains: componentDetails.domains.directMatches,
      functions: componentDetails.functions.directMatches,
      rights: componentDetails.rights.directMatches,
      tones: componentDetails.tones.directMatches,
      directional: directional.results.map(({ from, to, matched }) => ({ from, to, matched })),
      semantic: {
        domains: componentDetails.domains.semanticMatches,
        functions: componentDetails.functions.semanticMatches,
        rights: componentDetails.rights.semanticMatches,
        tones: componentDetails.tones.semanticMatches,
      },
    };

    const dimensionNames = ["domains", "functions", "rights", "tones", "directional"];
    const availableDimensions = dimensionNames.filter((key) => {
      if (key === "directional") {
        return (
          asArray(a.needs).length > 0 ||
          asArray(b.needs).length > 0 ||
          asArray(a.enables).length > 0 ||
          asArray(b.enables).length > 0 ||
          asArray(a.mechanisms).length > 0 ||
          asArray(b.mechanisms).length > 0
        );
      }
      return asArray(a[key]).length > 0 || asArray(b[key]).length > 0;
    }).length;
    const comparedKeys = dimensionNames.filter((key) => Number.isFinite(components[key]));
    const matchedKeys = comparedKeys.filter((key) => {
      if (key === "directional") return directional.hasMatch;
      return (
        matches[key].length > 0 ||
        (matches.semantic[key] && matches.semantic[key].length > 0)
      );
    });
    const missingDimensions = dimensionNames.filter((key) => !Number.isFinite(components[key]));
    const coverage = comparedKeys.length / dimensionNames.length;
    const evidence = {
      availableDimensions,
      comparedDimensions: comparedKeys.length,
      matchedDimensions: matchedKeys.length,
      missingDimensions,
      coverage,
      confidence: confidenceFromCoverage(coverage),
    };

    const weightedScore = weightedAvailableScore(components, weights);
    const score = weightedScore === null ? 50 : roundScore(weightedScore * 100);
    if (weightedScore === null) evidence.confidence = "low";

    const warnings = [];
    if (weightedScore === null) {
      warnings.push("연결성을 판단할 태그가 부족합니다.");
    }
    if (Number.isFinite(components.domains) && components.domains === 0) {
      warnings.push("공통 domain이 없습니다.");
    }
    if (Number.isFinite(components.rights) && components.rights === 0) {
      warnings.push("공통 right가 없습니다.");
    }
    if (directional.hasData && !directional.hasMatch) {
      warnings.push("방향성 연결이 없습니다.");
    }

    return { score, components, matches, warnings, evidence };
  }

  /**
   * 핵심 변수 5개의 호환성을 평가한다.
   * @param {object} selection
   * @returns {object}
   */
  function evaluateCoreSelection(selection = {}) {
    const missingRequired = CORE_KEYS.filter((key) => !selection[key]).map((key) => CORE_LABELS[key]);
    const pairScores = [];

    for (const [leftKey, rightKey, weight] of CORE_PAIR_DEFINITIONS) {
      if (!selection[leftKey] || !selection[rightKey]) continue;
      const result = scorePair(selection[leftKey], selection[rightKey]);
      pairScores.push({
        name: pairName(leftKey, rightKey),
        keys: [leftKey, rightKey],
        score: result.score,
        weight,
        components: result.components,
        matches: result.matches,
        warnings: result.warnings,
        evidence: result.evidence,
        confidence: result.evidence.confidence,
      });
    }

    const totalWeight = pairScores.reduce((sum, pair) => sum + pair.weight, 0);
    const score =
      totalWeight > 0
        ? roundScore(pairScores.reduce((sum, pair) => sum + pair.score * pair.weight, 0) / totalWeight)
        : 0;
    const evidenceCoverage = pairScores.length > 0 ? average(pairScores.map((pair) => pair.evidence.coverage)) : 0;
    const confidence = confidenceFromCoverage(evidenceCoverage, 0.4, 0.7);

    return {
      score,
      pairScores,
      strengths: pairScores
        .filter((pair) => pair.confidence !== "low" && pair.score >= 65)
        .map(makeStrength),
      weaknesses: pairScores
        .filter((pair) => pair.confidence !== "low" && pair.score < 35)
        .map(makeWeakness),
      missingRequired,
      confidence,
      evidenceCoverage,
      uncertainPairs: pairScores.filter((pair) => pair.confidence === "low").map((pair) => pair.name),
    };
  }

  function evaluateOneDetail(detailKey, detailOption, coreSelection) {
    if (!detailOption) return { skipped: true, score: 0, confidence: "low", evidenceCoverage: 0 };
    const compared = selectedOptionsFromSelection(coreSelection).map((coreOption) => {
      const result = scorePair(detailOption, coreOption);
      return {
        coreId: coreOption.id || "",
        coreLabel: coreOption.label || "",
        score: result.score,
        components: result.components,
        evidence: result.evidence,
        confidence: result.evidence.confidence,
      };
    });
    if (compared.length === 0) return { skipped: true, score: 0, confidence: "low", evidenceCoverage: 0 };
    const bestMatch = compared.reduce((best, item) => (item.score > best.score ? item : best), compared[0]);
    const evidenceCoverage = average(compared.map((item) => item.evidence.coverage));
    const confidence = confidenceFromCoverage(evidenceCoverage, 0.4, 0.7);
    return {
      skipped: false,
      label: DETAIL_LABELS[detailKey],
      optionId: detailOption.id || "",
      optionLabel: detailOption.label || "",
      score: roundScore(average(compared.map((item) => item.score))),
      bestMatch,
      compared,
      confidence,
      evidenceCoverage,
      reason: confidence === "low" ? "구체화 요소의 연결 근거가 부족합니다." : "",
    };
  }

  /**
   * 구체화 요소가 핵심 조합과 얼마나 맞는지 평가한다.
   * @param {object} coreSelection
   * @param {object} detailSelection
   * @returns {object}
   */
  function evaluateDetailFit(coreSelection = {}, detailSelection = {}) {
    const details = {};
    for (const key of DETAIL_KEYS) details[key] = evaluateOneDetail(key, detailSelection[key], coreSelection);
    const activeDetails = Object.values(details).filter((detail) => !detail.skipped);
    const score = activeDetails.length > 0 ? roundScore(average(activeDetails.map((detail) => detail.score))) : 0;
    const evidenceCoverage = activeDetails.length > 0 ? average(activeDetails.map((detail) => detail.evidenceCoverage)) : 0;
    const confidence = activeDetails.length > 0 ? confidenceFromCoverage(evidenceCoverage, 0.4, 0.7) : "low";
    const weaknesses = Object.entries(details)
      .filter(([, detail]) => !detail.skipped && detail.confidence !== "low" && detail.score < 35)
      .map(([key]) => `${DETAIL_LABELS[key]} 연결이 약한 편입니다.`);
    return { score, details, weaknesses, confidence, evidenceCoverage, selectedCount: activeDetails.length };
  }

  function preferredCoreOptions(coreSelection) {
    const preferred = ["transformation", "target", "ideology"].map((key) => coreSelection[key]).filter(Boolean);
    return preferred.length > 0 ? preferred : selectedOptionsFromSelection(coreSelection);
  }

  function evaluateOneAmplifier(key, amplifierOption, coreSelection) {
    if (!amplifierOption) return { skipped: true, score: 0, confidence: "low", evidenceCoverage: 0 };
    const coreOptions = preferredCoreOptions(coreSelection);
    if (coreOptions.length === 0) return { skipped: true, score: 0, confidence: "low", evidenceCoverage: 0 };
    const compared = coreOptions.map((coreOption) => {
      const result = scorePair(amplifierOption, coreOption);
      return {
        coreId: coreOption.id || "",
        coreLabel: coreOption.label || "",
        score: result.score,
        components: result.components,
        evidence: result.evidence,
        confidence: result.evidence.confidence,
      };
    });
    const bestMatch = compared.reduce((best, item) => (item.score > best.score ? item : best), compared[0]);
    const evidenceCoverage = average(compared.map((item) => item.evidence.coverage));
    const confidence = confidenceFromCoverage(evidenceCoverage, 0.4, 0.7);
    return {
      skipped: false,
      label: AMPLIFIER_LABELS[key],
      optionId: amplifierOption.id || "",
      optionLabel: amplifierOption.label || "",
      score: roundScore(average(compared.map((item) => item.score))),
      bestMatch,
      compared,
      confidence,
      evidenceCoverage,
    };
  }

  /**
   * 보조 요소와 핵심 조합의 적합도를 평가한다.
   * @param {object} coreSelection
   * @param {object} amplifierSelection
   * @returns {object}
   */
  function evaluateAmplifierFit(coreSelection = {}, amplifierSelection = {}) {
    const amplifiers = {};
    for (const key of AMPLIFIER_KEYS) amplifiers[key] = evaluateOneAmplifier(key, amplifierSelection[key], coreSelection);
    const activeAmplifiers = Object.values(amplifiers).filter((item) => !item.skipped);
    const selectedCount = activeAmplifiers.length;
    const scatterPenalty = selectedCount >= 4 ? 25 : selectedCount === 3 ? 12 : 0;
    const rawScore = selectedCount > 0 ? roundScore(average(activeAmplifiers.map((item) => item.score))) : 0;
    const evidenceCoverage = selectedCount > 0 ? average(activeAmplifiers.map((item) => item.evidenceCoverage)) : 0;
    const confidence = selectedCount > 0 ? confidenceFromCoverage(evidenceCoverage, 0.4, 0.7) : "low";
    const warnings = [];
    if (selectedCount > 2) warnings.push("작동과 결과 요소가 너무 많습니다.");
    return {
      rawScore,
      score: roundScore(Math.max(0, rawScore - scatterPenalty)),
      selectedCount,
      scatterPenalty,
      amplifiers,
      warnings,
      confidence,
      evidenceCoverage,
    };
  }

  function selectedOptionsFromConcept(input = {}) {
    return [
      ...selectedOptionsFromSelection(input.core),
      ...selectedOptionsFromSelection(input.detail),
      ...selectedOptionsFromSelection(input.amplifier),
    ];
  }

  function averageOptionMetric(options, metricName) {
    if (options.length === 0) return 0;
    return roundScore(average(options.map((option) => clamp(option[metricName] * 100))));
  }

  function hasAnySelection(selection) {
    return selectedOptionsFromSelection(selection).length > 0;
  }

  function calculateCompatibility(coreEvaluation, detailEvaluation, amplifierEvaluation, detail, amplifier) {
    const groups = [{ score: coreEvaluation.score, weight: 0.6 }];
    if (hasAnySelection(detail)) groups.push({ score: detailEvaluation.score, weight: 0.25 });
    if (hasAnySelection(amplifier)) groups.push({ score: amplifierEvaluation.score, weight: 0.15 });
    const totalWeight = groups.reduce((sum, group) => sum + group.weight, 0);
    return totalWeight > 0 ? roundScore(groups.reduce((sum, group) => sum + group.score * group.weight, 0) / totalWeight) : 0;
  }

  function calculateOverallCoverage(coreEvaluation, detailEvaluation, amplifierEvaluation, detail, amplifier) {
    const groups = [{ coverage: coreEvaluation.evidenceCoverage, weight: 0.6 }];
    if (hasAnySelection(detail)) groups.push({ coverage: detailEvaluation.evidenceCoverage, weight: 0.25 });
    if (hasAnySelection(amplifier)) groups.push({ coverage: amplifierEvaluation.evidenceCoverage, weight: 0.15 });
    const totalWeight = groups.reduce((sum, group) => sum + group.weight, 0);
    return totalWeight > 0 ? groups.reduce((sum, group) => sum + group.coverage * group.weight, 0) / totalWeight : 0;
  }

  function calculateScatterRisk(coreEvaluation, amplifierEvaluation) {
    const confidentPairs = coreEvaluation.pairScores.filter((pair) => pair.confidence !== "low");
    const weakPairRatio =
      confidentPairs.length > 0
        ? confidentPairs.filter((pair) => pair.score < 35).length / confidentPairs.length
        : 0;
    return roundScore(Math.min(50, weakPairRatio * 55 + amplifierEvaluation.scatterPenalty));
  }

  function buildSummary(coreEvaluation, detailEvaluation, amplifierEvaluation, scatterRisk, confidence) {
    const summary = [];
    if (confidence === "low") {
      summary.push("직접 입력한 내용의 연결 정보를 충분히 해석하지 못해 점수가 중립적으로 계산되었습니다.");
    }
    if (confidence !== "low" && coreEvaluation.strengths.length > 0) {
      summary.push("연결 근거가 충분한 지점이 있습니다.");
    }
    if (confidence !== "low" && coreEvaluation.weaknesses.length > 0) {
      summary.push("연결이 약하게 나타나는 지점이 있습니다.");
    }
    if (coreEvaluation.pairScores.some((pair) => Object.values(pair.matches.semantic).some((items) => items.length > 0))) {
      summary.push("서로 다른 영역을 잇는 조합입니다.");
    }
    if (amplifierEvaluation.selectedCount > 2 || scatterRisk >= 45) {
      summary.push("산만함을 줄일 여지가 있습니다.");
    }
    if (detailEvaluation.score >= 65 && detailEvaluation.confidence !== "low") {
      summary.push("구체화 요소가 핵심 설정을 보강합니다.");
    }
    if (summary.length === 0) summary.push("아직 판단할 정보가 부족합니다.");
    return summary;
  }

  /**
   * 전체 입력 조합을 종합 평가한다.
   * @param {{core?:object,detail?:object,amplifier?:object}} input
   * @returns {object}
   */
  function evaluateConcept(input = {}) {
    const core = input.core || {};
    const detail = input.detail || {};
    const amplifier = input.amplifier || {};
    const coreEvaluation = evaluateCoreSelection(core);
    const detailEvaluation = evaluateDetailFit(core, detail);
    const amplifierEvaluation = evaluateAmplifierFit(core, amplifier);
    const compatibility = calculateCompatibility(coreEvaluation, detailEvaluation, amplifierEvaluation, detail, amplifier);
    const selectedOptions = selectedOptionsFromConcept({ core, detail, amplifier });
    const plausibility = averageOptionMetric(selectedOptions, "plausibility");
    const novelty = averageOptionMetric(selectedOptions, "novelty");
    const madness = averageOptionMetric(selectedOptions, "madness");
    const evidenceCoverage = calculateOverallCoverage(coreEvaluation, detailEvaluation, amplifierEvaluation, detail, amplifier);
    const confidence = confidenceFromCoverage(evidenceCoverage, 0.4, 0.7);
    const scatterRisk = calculateScatterRisk(coreEvaluation, amplifierEvaluation);
    const overallScore = roundScore(compatibility * 0.45 + plausibility * 0.25 + novelty * 0.2 + madness * 0.1);
    return {
      overallScore,
      compatibility,
      plausibility,
      novelty,
      madness,
      scatterRisk,
      confidence,
      evidenceCoverage,
      coreEvaluation,
      detailEvaluation,
      amplifierEvaluation,
      summary: buildSummary(coreEvaluation, detailEvaluation, amplifierEvaluation, scatterRisk, confidence),
    };
  }

  /**
   * 카테고리 배열에서 id와 일치하는 선택지를 찾는다.
   * @param {object[]} categoryArray
   * @param {string} id
   * @returns {object|null}
   */
  function findOptionById(categoryArray, id) {
    if (!Array.isArray(categoryArray) || typeof id !== "string") return null;
    return categoryArray.find((option) => option && option.id === id) || null;
  }

  function resolveMappedOption(allCategories, ids, key) {
    const categoryName = ID_CATEGORY_MAP[key];
    return findOptionById(allCategories && allCategories[categoryName], ids && ids[key]);
  }

  /**
   * id 입력 객체를 실제 선택지 객체 구조로 변환한다.
   * @param {object} allCategories
   * @param {object} ids
   * @returns {{core:object,detail:object,amplifier:object}}
   */
  function buildSelectionFromIds(allCategories = {}, ids = {}) {
    return {
      core: {
        pressure: resolveMappedOption(allCategories, ids, "pressure"),
        target: resolveMappedOption(allCategories, ids, "target"),
        technology: resolveMappedOption(allCategories, ids, "technology"),
        transformation: resolveMappedOption(allCategories, ids, "transformation"),
        ideology: resolveMappedOption(allCategories, ids, "ideology"),
      },
      detail: {
        actor: resolveMappedOption(allCategories, ids, "actor"),
        metric: resolveMappedOption(allCategories, ids, "metric"),
        mechanism: resolveMappedOption(allCategories, ids, "mechanism"),
        benefit: resolveMappedOption(allCategories, ids, "benefit"),
        careNarrative: resolveMappedOption(allCategories, ids, "careNarrative"),
      },
      amplifier: {
        classDistortion: resolveMappedOption(allCategories, ids, "classDistortion"),
        feedbackLoop: resolveMappedOption(allCategories, ids, "feedbackLoop"),
        victimInternalization: resolveMappedOption(allCategories, ids, "victimInternalization"),
        irreversibility: resolveMappedOption(allCategories, ids, "irreversibility"),
      },
    };
  }

  /**
   * 1단계 UI가 아직 계산 전 상태를 표시할 수 있게 하는 최소 함수다.
   * @returns {{title:string, summary:string}}
   */
  function getInitialResult() {
    return {
      title: "",
      summary: "아직 계산된 아이디어 없음",
    };
  }

  const api = {
    intersectTags,
    overlapScore,
    adjustedOverlapScore,
    semanticBridgeScore,
    directionalScore,
    scorePair,
    evaluateCoreSelection,
    evaluateDetailFit,
    evaluateAmplifierFit,
    evaluateConcept,
    findOptionById,
    buildSelectionFromIds,
    getInitialResult,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) {
    root.HistoryLensEngine = api;
    root.SatireIdeaEngine = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
