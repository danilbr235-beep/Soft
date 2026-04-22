import type { ContentItem, PriorityDomain, ProgramCategory } from "@pmhc/types";

export type ContentCategory =
  | "baseline"
  | "recovery"
  | "sleep"
  | "pelvic_floor"
  | "confidence"
  | "tracking"
  | "safety"
  | "privacy"
  | "general";

export type ContentRecommendationReason = "digest" | "priority" | "program" | "safety" | "starter";
export type ContentRecommendationDigestTone = "baseline_building" | "steady" | "recovery";
export type ContentRecommendationDigestNextStep = "log_two_scores" | "keep_consistency" | "protect_recovery" | "repeat_small_loop";

export type ContentCategoryGroup = {
  category: ContentCategory;
  items: ContentItem[];
};

export type ContentRecommendationContext = {
  priorityDomain: PriorityDomain;
  activeProgramCategory: ProgramCategory | null;
  reviewDigestTone?: ContentRecommendationDigestTone | null;
  reviewDigestNextStep?: ContentRecommendationDigestNextStep | null;
};

export type ContentRecommendation = {
  item: ContentItem;
  reason: ContentRecommendationReason;
};

const knownCategories = new Set<ContentCategory>([
  "baseline",
  "recovery",
  "sleep",
  "pelvic_floor",
  "confidence",
  "tracking",
  "safety",
  "privacy",
  "general",
]);

export function contentCategoryFor(item: ContentItem): ContentCategory {
  const category = item.tags.find((tag): tag is ContentCategory => knownCategories.has(tag as ContentCategory));
  return category ?? "general";
}

export function groupContentByCategory(items: ContentItem[]): ContentCategoryGroup[] {
  const groups = new Map<ContentCategory, ContentItem[]>();

  for (const item of items) {
    const category = contentCategoryFor(item);
    groups.set(category, [...(groups.get(category) ?? []), item]);
  }

  return Array.from(groups, ([category, groupedItems]) => ({
    category,
    items: groupedItems,
  }));
}

export function recommendContentForToday(
  items: ContentItem[],
  context: ContentRecommendationContext,
  limit = 3,
): ContentRecommendation[] {
  const priorityTags = tagsForPriority(context.priorityDomain);
  const programTags = tagsForProgram(context.activeProgramCategory);
  const digestTags = tagsForDigest(context.reviewDigestTone ?? null, context.reviewDigestNextStep ?? null);

  return items
    .filter((item) => !item.completed)
    .map((item, index) => {
      const reason = recommendationReasonFor(item, priorityTags, programTags, digestTags);

      return {
        item,
        reason,
        score: scoreReason(reason),
        index,
      };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ item, reason }) => ({ item, reason }));
}

function recommendationReasonFor(
  item: ContentItem,
  priorityTags: string[],
  programTags: string[],
  digestTags: string[],
): ContentRecommendationReason {
  if (matchesAnyTag(item, digestTags)) {
    return "digest";
  }

  if (matchesAnyTag(item, priorityTags)) {
    return "priority";
  }

  if (matchesAnyTag(item, programTags)) {
    return "program";
  }

  if (matchesAnyTag(item, ["safety", "privacy"])) {
    return "safety";
  }

  return "starter";
}

function scoreReason(reason: ContentRecommendationReason) {
  return {
    digest: 45,
    priority: 40,
    program: 30,
    safety: 10,
    starter: 10,
  }[reason];
}

function matchesAnyTag(item: ContentItem, tags: string[]) {
  return item.tags.some((tag) => tags.includes(tag));
}

function tagsForPriority(domain: PriorityDomain): string[] {
  return {
    baseline: ["baseline", "tracking"],
    recovery: ["recovery", "sleep"],
    confidence: ["confidence", "baseline"],
    pelvic_floor: ["pelvic_floor", "safety"],
    environment: ["sleep", "environment", "recovery"],
    learning: ["baseline", "tracking"],
    safety: ["safety", "recovery"],
  }[domain];
}

function tagsForProgram(category: ProgramCategory | null): string[] {
  if (!category) {
    return [];
  }

  return {
    recovery: ["recovery"],
    sleep: ["sleep", "environment", "recovery"],
    pelvic_floor: ["pelvic_floor", "safety"],
    confidence: ["confidence", "baseline"],
    environment: ["environment", "sleep"],
    pump: ["safety", "pelvic_floor"],
    appearance: ["confidence"],
  }[category];
}

function tagsForDigest(
  tone: ContentRecommendationDigestTone | null,
  nextStep: ContentRecommendationDigestNextStep | null,
): string[] {
  if (tone === "recovery" || nextStep === "protect_recovery") {
    return ["recovery", "sleep", "safety"];
  }

  if (
    tone === "baseline_building" ||
    nextStep === "log_two_scores" ||
    nextStep === "repeat_small_loop"
  ) {
    return ["baseline", "tracking", "confidence"];
  }

  if (tone === "steady" || nextStep === "keep_consistency") {
    return ["confidence", "tracking", "baseline"];
  }

  return [];
}
