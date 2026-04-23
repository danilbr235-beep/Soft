import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { recommendEvidenceSources, type EvidenceRecommendation } from "@pmhc/evidence";
import type { LanguageCopy } from "@pmhc/i18n";
import {
  type ContentRecommendationDigestNextStep,
  type ContentRecommendationDigestTone,
  contentCategoryFor,
  groupContentByCategory,
  recommendContentForToday,
} from "@pmhc/learning";
import type { ContentCategory } from "@pmhc/learning";
import { colors, radii, spacing } from "@pmhc/ui";
import type { AppLanguage, ContentItem, PriorityDomain, ProgramCategory } from "@pmhc/types";
import type { MorningRoutineReview } from "../morningRoutineReview";
import { Screen } from "../components/Screen";
import { Surface } from "../components/Surface";

type LearnFilter = "all" | ContentCategory;

type Props = {
  activeProgramCategory: ProgramCategory | null;
  content: ContentItem[];
  copy: LanguageCopy;
  language: AppLanguage;
  onToggleSaved: (itemId: string) => void;
  onMarkCompleted: (itemId: string) => void;
  preferredItemId: string | null;
  priorityDomain: PriorityDomain;
  reviewDigestNextStep: ContentRecommendationDigestNextStep;
  reviewDigestTone: ContentRecommendationDigestTone;
  morningRoutineReview: MorningRoutineReview;
  onClearPreferredItem: () => void;
};

const defaultFilters: LearnFilter[] = [
  "all",
  "baseline",
  "recovery",
  "sleep",
  "pelvic_floor",
  "confidence",
  "tracking",
  "safety",
];

export function LearnScreen({
  activeProgramCategory,
  content,
  copy,
  language,
  onMarkCompleted,
  onToggleSaved,
  onClearPreferredItem,
  priorityDomain,
  preferredItemId,
  reviewDigestNextStep,
  reviewDigestTone,
  morningRoutineReview,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<LearnFilter>("all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (preferredItemId) {
      setSelectedItemId(preferredItemId);
    }
  }, [preferredItemId]);

  const recommendations = useMemo(
    () =>
      recommendContentForToday(content, {
        activeProgramCategory,
        morningRoutineNextStepId: morningRoutineReview.nextStepId,
        morningRoutineToneId: morningRoutineReview.toneId,
        priorityDomain,
        reviewDigestNextStep,
        reviewDigestTone,
      }),
    [
      activeProgramCategory,
      content,
      morningRoutineReview.nextStepId,
      morningRoutineReview.toneId,
      priorityDomain,
      reviewDigestNextStep,
      reviewDigestTone,
    ],
  );
  const trustedSources = useMemo(
    () =>
      recommendEvidenceSources({
        activeProgramCategory,
        priorityDomain,
        reviewDigestNextStep,
        reviewDigestTone,
      }),
    [activeProgramCategory, priorityDomain, reviewDigestNextStep, reviewDigestTone],
  );
  const recommendationReasonById = useMemo(
    () => new Map(recommendations.map((recommendation) => [recommendation.item.id, recommendation.reason])),
    [recommendations],
  );
  const categoryFilters = useMemo(() => buildCategoryFilters(content), [content]);
  const visibleContent = useMemo(
    () =>
      selectedCategory === "all"
        ? content
        : content.filter((item) => contentCategoryFor(item) === selectedCategory || item.tags.includes(selectedCategory)),
    [content, selectedCategory],
  );
  const selectedItem = content.find((item) => item.id === selectedItemId);
  const morningFocusItem = useMemo(
    () => findMorningFocusItem(content, morningRoutineReview),
    [content, morningRoutineReview],
  );

  function renderActions(item: ContentItem, title: string) {
    const saveAction = item.saved ? copy.learn.unsave : copy.learn.save;
    const completeAction = item.completed ? copy.learn.completed : copy.learn.markComplete;

    return (
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={`${saveAction} ${title}`}
          accessibilityRole="button"
          onPress={() => onToggleSaved(item.id)}
          style={[styles.button, item.saved && styles.activeButton]}
        >
          <Text style={styles.buttonText}>{item.saved ? copy.learn.saved : copy.learn.save}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`${completeAction} ${title}`}
          accessibilityRole="button"
          disabled={item.completed}
          onPress={() => onMarkCompleted(item.id)}
          style={[styles.button, item.completed && styles.activeButton]}
        >
          <Text style={styles.buttonText}>{item.completed ? copy.learn.completed : copy.learn.markComplete}</Text>
        </Pressable>
      </View>
    );
  }

  if (selectedItem) {
    const title = localizedTitle(selectedItem, language);
    const summary = localizedSummary(selectedItem, language);
    const reason = recommendationReasonById.get(selectedItem.id);
    const category = contentCategoryFor(selectedItem);

    return (
      <Screen title={copy.learn.title} subtitle={copy.learn.subtitle}>
        <Pressable
          accessibilityLabel={copy.learn.backToLibrary}
          accessibilityRole="button"
          onPress={() => {
            setSelectedItemId(null);
            onClearPreferredItem();
          }}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{copy.learn.backToLibrary}</Text>
        </Pressable>

        <Surface>
          <View style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.xs }}>
              <Text style={styles.eyebrow}>{copy.learn.categoryLabels[category]}</Text>
              <Text style={styles.detailTitle}>{title}</Text>
              <Text style={styles.summary}>{summary}</Text>
            </View>

            {reason ? <Text style={styles.reason}>{copy.learn.recommendedReason[reason]}</Text> : null}

            <View style={styles.metaGrid}>
              <Text style={styles.metaPill}>{trustLabel(selectedItem.trustLevel)}</Text>
              <Text style={styles.metaPill}>
                {copy.learn.detailMeta(copy.common.minutes(selectedItem.durationMinutes), selectedItem.sourceName)}
              </Text>
            </View>

            <View style={styles.tagRow}>
              {selectedItem.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tagLabel(tag, copy)}
                </Text>
              ))}
            </View>

            {renderActions(selectedItem, title)}
          </View>
        </Surface>
        <TrustedSourcesBlock copy={copy} language={language} sources={trustedSources} />
      </Screen>
    );
  }

  return (
    <Screen title={copy.learn.title} subtitle={copy.learn.subtitle}>
      {morningFocusItem ? (
        <Surface>
          <View style={{ gap: spacing.xs }}>
            <Text style={styles.eyebrow}>{morningRoutineReview.title}</Text>
            <Text style={styles.cardTitle}>{morningRoutineReview.tone}</Text>
            <Text style={styles.summary}>{morningRoutineReview.reason}</Text>
            <Text style={styles.reason}>{localizedTitle(morningFocusItem, language)}</Text>
            <Text style={styles.summary}>{morningRoutineReview.nextStep}</Text>
            <Pressable
              accessibilityLabel={copy.learn.openDetail(localizedTitle(morningFocusItem, language))}
              accessibilityRole="button"
              onPress={() => setSelectedItemId(morningFocusItem.id)}
              style={styles.inlineLink}
            >
              <Text style={styles.openText}>
                {copy.learn.openDetail(localizedTitle(morningFocusItem, language))}
              </Text>
            </Pressable>
          </View>
        </Surface>
      ) : null}
      <Surface>
        <View style={{ gap: spacing.md }}>
          <Text style={styles.sectionTitle}>{copy.learn.recommended}</Text>
          {recommendations.map((recommendation) => {
            const title = localizedTitle(recommendation.item, language);
            const summary = localizedSummary(recommendation.item, language);

            return (
              <Pressable
                accessibilityLabel={copy.learn.openDetail(title)}
                accessibilityRole="button"
                key={recommendation.item.id}
                onPress={() => setSelectedItemId(recommendation.item.id)}
                style={styles.recommendedRow}
              >
                <View style={{ gap: spacing.xs }}>
                  <Text style={styles.reason}>{copy.learn.recommendedReason[recommendation.reason]}</Text>
                  <Text style={styles.cardTitle}>{title}</Text>
                  <Text style={styles.summary}>{summary}</Text>
                  <Text style={styles.openText}>{copy.learn.openDetail(title)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Surface>

      <TrustedSourcesBlock copy={copy} language={language} sources={trustedSources} />

      <View style={{ gap: spacing.sm }}>
        <Text style={styles.sectionTitle}>{copy.learn.categories}</Text>
        <View style={styles.chipRow}>
          {categoryFilters.map((category) => (
            <Pressable
              accessibilityLabel={copy.learn.filterCategory(copy.learn.categoryLabels[category])}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === category }}
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.chip, selectedCategory === category && styles.activeChip]}
            >
              <Text style={[styles.chipText, selectedCategory === category && styles.activeChipText]}>
                {copy.learn.categoryLabels[category]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "all" ? copy.learn.allContent : copy.learn.categoryLabels[selectedCategory]}
        </Text>
        {visibleContent.length > 0 ? (
          visibleContent.map((item) => {
            const title = localizedTitle(item, language);
            const summary = localizedSummary(item, language);
            const reason = recommendationReasonById.get(item.id);
            const category = contentCategoryFor(item);

            return (
              <Surface key={item.id}>
                <View style={{ gap: spacing.sm }}>
                  <Pressable
                    accessibilityLabel={copy.learn.openDetail(title)}
                    accessibilityRole="button"
                    onPress={() => setSelectedItemId(item.id)}
                    style={{ gap: spacing.xs }}
                  >
                    <View style={styles.itemHeader}>
                      <Text style={styles.eyebrow}>{copy.learn.categoryLabels[category]}</Text>
                      {reason ? <Text style={styles.reasonPill}>{copy.learn.recommendedReason[reason]}</Text> : null}
                    </View>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.summary}>{summary}</Text>
                    <Text style={styles.meta}>
                      {copy.learn.detailMeta(copy.common.minutes(item.durationMinutes), item.sourceName)}
                    </Text>
                    <Text style={styles.openText}>{copy.learn.openDetail(title)}</Text>
                  </Pressable>
                  {renderActions(item, title)}
                </View>
              </Surface>
            );
          })
        ) : (
          <Surface>
            <Text style={styles.summary}>{copy.learn.noCategoryItems}</Text>
          </Surface>
        )}
      </View>
    </Screen>
  );
}

function buildCategoryFilters(items: ContentItem[]): LearnFilter[] {
  const groupedCategories = new Set(groupContentByCategory(items).map((group) => group.category));
  const taggedCategories = new Set(
    items.flatMap((item) => item.tags.filter((tag): tag is ContentCategory => isContentCategory(tag))),
  );

  return defaultFilters.filter(
    (category) => category === "all" || groupedCategories.has(category) || taggedCategories.has(category),
  );
}

function isContentCategory(tag: string): tag is ContentCategory {
  return [
    "baseline",
    "recovery",
    "sleep",
    "pelvic_floor",
    "confidence",
    "tracking",
    "safety",
    "privacy",
    "general",
  ].includes(tag);
}

function localizedTitle(item: ContentItem, language: AppLanguage) {
  return language === "ru" ? item.translatedTitleRu ?? item.title : item.title;
}

function localizedSummary(item: ContentItem, language: AppLanguage) {
  return language === "ru" ? item.translatedSummaryRu ?? item.summary : item.summary;
}

function findMorningFocusItem(content: ContentItem[], review: MorningRoutineReview) {
  const availableItems = content.filter((item) => !item.completed);
  const preferredIds =
    review.nextStepId === "protect_anchor"
      ? ["morning-light-walk", "morning-routine-reset", "morning-mobility-reset"]
      : review.nextStepId === "keep_same_loop" || review.nextStepId === "repeat_full_loop"
        ? ["morning-mobility-reset", "morning-light-walk", "morning-routine-reset"]
        : ["morning-routine-reset", "morning-mobility-reset", "morning-light-walk"];

  for (const id of preferredIds) {
    const item = availableItems.find((candidate) => candidate.id === id);

    if (item) {
      return item;
    }
  }

  return availableItems.find((item) => item.tags.includes("morning")) ?? null;
}

function tagLabel(tag: string, copy: LanguageCopy) {
  return isContentCategory(tag) ? copy.learn.categoryLabels[tag] : tag.replace(/_/g, " ");
}

function trustLabel(level: ContentItem["trustLevel"]) {
  return level.replace(/_/g, " ");
}

function TrustedSourcesBlock({
  copy,
  language,
  sources,
}: {
  copy: LanguageCopy;
  language: AppLanguage;
  sources: EvidenceRecommendation[];
}) {
  return (
    <Surface>
      <View style={{ gap: spacing.md }}>
        <View style={{ gap: spacing.xs }}>
          <Text style={styles.sectionTitle}>{copy.learn.trustedSourcesTitle}</Text>
          <Text style={styles.summary}>{copy.learn.trustedSourcesBody}</Text>
        </View>

        {sources.map(({ reason, source }) => (
          <View key={source.id} style={styles.sourceCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.eyebrow}>{source.organization}</Text>
              <Text style={styles.reasonPill}>{copy.learn.evidenceKinds[source.kind]}</Text>
            </View>
            <Text style={styles.cardTitle}>{source.title}</Text>
            <Text style={styles.summary}>{language === "ru" ? source.translatedSummaryRu : source.summary}</Text>
            <View style={styles.metaGrid}>
              <Text style={styles.metaPill}>{copy.learn.evidenceReason[reason]}</Text>
              <Text style={styles.metaPill}>{copy.learn.reviewedAt(formatReviewedAt(source.reviewedAt, language))}</Text>
            </View>
            <Pressable
              accessibilityLabel={copy.learn.openSource(source.title)}
              accessibilityRole="link"
              onPress={() => {
                void Linking.openURL(source.url);
              }}
              style={styles.sourceButton}
            >
              <Text style={styles.openText}>{copy.learn.openSource(source.title)}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </Surface>
  );
}

function formatReviewedAt(date: string, language: AppLanguage) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.valueOf())) {
    return date;
  }

  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
    month: "short",
    year: "numeric",
  }).format(parsed);
}

const styles = StyleSheet.create({
  activeChip: {
    backgroundColor: colors.moss,
    borderColor: colors.moss,
  },
  activeChipText: {
    color: colors.ink,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  backButton: {
    alignSelf: "flex-start",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: "800",
  },
  inlineLink: {
    alignSelf: "flex-start",
  },
  button: {
    minHeight: 44,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  activeButton: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.moss,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "800",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 25,
  },
  chip: {
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chipText: {
    color: colors.text,
    fontWeight: "800",
  },
  detailTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32,
  },
  eyebrow: {
    color: colors.moss,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  itemHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  meta: {
    color: colors.steel,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metaPill: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.text,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  openText: {
    color: colors.moss,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  reason: {
    color: colors.amber,
    fontWeight: "800",
    lineHeight: 20,
  },
  reasonPill: {
    color: colors.amber,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  recommendedRow: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  summary: {
    color: colors.muted,
    lineHeight: 21,
  },
  sourceButton: {
    alignSelf: "flex-start",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  sourceCard: {
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  tag: {
    backgroundColor: colors.panelSoft,
    borderRadius: radii.sm,
    color: colors.muted,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
