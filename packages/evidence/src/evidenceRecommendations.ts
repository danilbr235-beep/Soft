import type {
  ContentRecommendationDigestNextStep,
  ContentRecommendationDigestTone,
} from "@pmhc/learning";
import type { PriorityDomain, ProgramCategory } from "@pmhc/types";
import { officialEvidenceSources, type EvidenceSource, type EvidenceTopic } from "./evidenceSources";

export type EvidenceRecommendationReason = "digest" | "priority" | "program" | "safety" | "foundation";

export type EvidenceRecommendationContext = {
  priorityDomain: PriorityDomain;
  activeProgramCategory: ProgramCategory | null;
  reviewDigestTone?: ContentRecommendationDigestTone | null;
  reviewDigestNextStep?: ContentRecommendationDigestNextStep | null;
};

export type EvidenceRecommendation = {
  source: EvidenceSource;
  reason: EvidenceRecommendationReason;
};

export function recommendEvidenceSources(
  context: EvidenceRecommendationContext,
  sources = officialEvidenceSources,
  limit = 3,
): EvidenceRecommendation[] {
  const priorityTopics = topicsForPriority(context.priorityDomain);
  const programTopics = topicsForProgram(context.activeProgramCategory);
  const digestTopics = topicsForDigest(context.reviewDigestTone ?? null, context.reviewDigestNextStep ?? null);

  return sources
    .map((source, index) => {
      const reason = recommendationReasonFor(source, priorityTopics, programTopics, digestTopics);
      const matchCount =
        countMatches(source, digestTopics) + countMatches(source, priorityTopics) + countMatches(source, programTopics);

      return {
        source,
        reason,
        score: scoreReason(reason, source.kind, matchCount),
        index,
      };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ source, reason }) => ({ source, reason }));
}

function recommendationReasonFor(
  source: EvidenceSource,
  priorityTopics: EvidenceTopic[],
  programTopics: EvidenceTopic[],
  digestTopics: EvidenceTopic[],
): EvidenceRecommendationReason {
  if (matchesTopic(source, digestTopics)) {
    return "digest";
  }

  if (matchesTopic(source, priorityTopics)) {
    return "priority";
  }

  if (matchesTopic(source, programTopics)) {
    return "program";
  }

  if (matchesTopic(source, ["red_flags"])) {
    return "safety";
  }

  return "foundation";
}

function scoreReason(reason: EvidenceRecommendationReason, kind: EvidenceSource["kind"], matchCount: number) {
  const reasonScore = {
    digest: 45,
    priority: 40,
    program: 30,
    safety: 20,
    foundation: 10,
  }[reason];

  const kindScore = {
    guideline: 3,
    standards: 2,
    society: 1,
  }[kind];

  return reasonScore + kindScore + matchCount * 5;
}

function matchesTopic(source: EvidenceSource, topics: EvidenceTopic[]) {
  return source.topics.some((topic) => topics.includes(topic));
}

function countMatches(source: EvidenceSource, topics: EvidenceTopic[]) {
  return source.topics.filter((topic) => topics.includes(topic)).length;
}

function topicsForPriority(domain: PriorityDomain): EvidenceTopic[] {
  const topicMap: Record<PriorityDomain, EvidenceTopic[]> = {
    baseline: ["behavior_change", "erectile_function"],
    recovery: ["sleep_recovery", "red_flags"],
    confidence: ["erectile_function", "behavior_change"],
    pelvic_floor: ["pelvic_floor", "red_flags"],
    environment: ["sleep_recovery"],
    learning: ["behavior_change", "erectile_function"],
    safety: ["red_flags", "pelvic_floor", "erectile_function"],
  };

  return topicMap[domain];
}

function topicsForProgram(category: ProgramCategory | null): EvidenceTopic[] {
  if (!category) {
    return [];
  }

  const topicMap: Record<ProgramCategory, EvidenceTopic[]> = {
    recovery: ["sleep_recovery", "red_flags"],
    sleep: ["sleep_recovery"],
    pelvic_floor: ["pelvic_floor", "red_flags"],
    confidence: ["erectile_function", "behavior_change"],
    environment: ["sleep_recovery"],
    pump: ["pelvic_floor", "red_flags"],
    appearance: ["behavior_change"],
  };

  return topicMap[category];
}

function topicsForDigest(
  tone: ContentRecommendationDigestTone | null,
  nextStep: ContentRecommendationDigestNextStep | null,
): EvidenceTopic[] {
  if (tone === "recovery" || nextStep === "protect_recovery") {
    return ["sleep_recovery", "red_flags"];
  }

  if (tone === "baseline_building" || nextStep === "log_two_scores" || nextStep === "repeat_small_loop") {
    return ["behavior_change", "erectile_function"];
  }

  if (tone === "steady" || nextStep === "keep_consistency") {
    return ["behavior_change", "sleep_recovery"];
  }

  return [];
}
