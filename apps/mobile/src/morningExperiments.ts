import { morningExperimentEvidenceSources } from "@pmhc/evidence";
import type { AppLanguage, ContentItem } from "@pmhc/types";

export type MorningExperiment = {
  id: "light_walk" | "mobility_reset" | "cold_finish";
  title: string;
  body: string;
  fit: string;
  caution: string;
  badge: string;
  cta: string;
  guideItemId: string | null;
  sourceLabels: string[];
};

export type MorningExperiments = {
  title: string;
  body: string;
  note: string;
  items: MorningExperiment[];
};

type Input = {
  content: ContentItem[];
  language: AppLanguage;
};

const experimentGuideIds = {
  light_walk: "morning-light-walk",
  mobility_reset: "morning-mobility-reset",
  cold_finish: "morning-cold-caution",
} as const;

const experimentSourceIds = {
  light_walk: ["aasm-morning-light", "nhlbi-healthy-sleep-habits", "who-physical-activity"],
  mobility_reset: ["nhlbi-healthy-sleep-habits", "who-physical-activity"],
  cold_finish: ["cdc-niosh-cold-stress", "nih-hypothermia"],
} as const;

const copy = {
  en: {
    title: "Optional morning experiments",
    body: "Add only one extra layer at a time. The core routine still comes first.",
    note: "Cold exposure stays caution-first here. It is not a required step and it is not framed as a default health habit.",
    openGuide: "Open guide",
    openNote: "Open note",
    lightWalkTitle: "5-10 minute light walk",
    lightWalkBody: "A short outside walk can reinforce the wake cue without turning the morning into a performance task.",
    lightWalkFit: "Best fit when you want a steadier start and a little more signal from light plus movement.",
    lightWalkCaution: "Keep it easy. This is a wake-up cue, not a cardio session.",
    lightWalkBadge: "Best fit",
    mobilityTitle: "2-minute mobility reset",
    mobilityBody: "A brief mobility block works well on stiff or low-start mornings when a full workout is too much.",
    mobilityFit: "Useful when you want movement without adding pressure or intensity.",
    mobilityCaution: "Stay gentle and stop if anything feels sharp or aggravating.",
    mobilityBadge: "Gentle",
    coldTitle: "Cold finish: caution first",
    coldBody: "This stays as an optional note, not as a recommended default. The app should not push cold exposure as a core morning habit.",
    coldFit: "Only consider this as a personal experiment if you still want to test it after the core routine is already stable.",
    coldCaution:
      "Skip it when you feel run-down, chilled, dizzy, or unusually stressed. End immediately if it feels harsh. The evidence layer here is mainly about boundaries and risk, not a daily benefit promise.",
    coldBadge: "Caution first",
  },
  ru: {
    title: "Дополнительные утренние практики",
    body: "Добавляй только один дополнительный слой за раз. Базовая рутина все равно идет первой.",
    note:
      "Холод здесь остается только в формате caution-first. Это не обязательный шаг и не базовая привычка, которую приложение продвигает по умолчанию.",
    openGuide: "Открыть гид",
    openNote: "Открыть заметку",
    lightWalkTitle: "Прогулка на свету 5-10 минут",
    lightWalkBody:
      "Короткая прогулка на улице может усилить сигнал пробуждения, не превращая утро в задачу на производительность.",
    lightWalkFit: "Лучше всего подходит, когда хочется ровнее начать день и добавить немного света и движения.",
    lightWalkCaution: "Держи легкий темп. Это сигнал на пробуждение, а не кардио-сессия.",
    lightWalkBadge: "Хороший старт",
    mobilityTitle: "Мобилити-перезагрузка на 2 минуты",
    mobilityBody:
      "Короткий блок мягкой подвижности подходит для зажатых или медленных утр, когда полноценная тренировка была бы лишней.",
    mobilityFit: "Полезно, когда хочется подвигаться без давления и без лишней интенсивности.",
    mobilityCaution: "Двигайся мягко и остановись, если что-то ощущается резко или раздражает.",
    mobilityBadge: "Мягко",
    coldTitle: "Холодный финиш: сначала осторожность",
    coldBody:
      "Это остается только опциональной заметкой, а не рекомендацией по умолчанию. Приложение не должно продвигать холод как базовую утреннюю привычку.",
    coldFit: "Рассматривай это только как личный эксперимент, если базовая рутина уже стала стабильной.",
    coldCaution:
      "Пропусти, если чувствуешь себя разбитым, замерзшим, сонным, с головокружением или на взводе. Прекрати сразу, если ощущается жестко. Здесь evidence-слой в первую очередь про границы и риски, а не про обещание ежедневной пользы.",
    coldBadge: "С осторожностью",
  },
} as const;

export function buildMorningExperiments({ content, language }: Input): MorningExperiments {
  const languageCopy = copy[language];
  const guideIds = new Set(content.map((item) => item.id));
  const sourceById = new Map(morningExperimentEvidenceSources.map((source) => [source.id, source]));

  return {
    title: languageCopy.title,
    body: languageCopy.body,
    note: languageCopy.note,
    items: [
      {
        id: "light_walk",
        title: languageCopy.lightWalkTitle,
        body: languageCopy.lightWalkBody,
        fit: languageCopy.lightWalkFit,
        caution: languageCopy.lightWalkCaution,
        badge: languageCopy.lightWalkBadge,
        cta: languageCopy.openGuide,
        guideItemId: guideIds.has(experimentGuideIds.light_walk) ? experimentGuideIds.light_walk : null,
        sourceLabels: experimentSourceIds.light_walk
          .map((id) => sourceById.get(id)?.organization)
          .filter((label): label is string => Boolean(label)),
      },
      {
        id: "mobility_reset",
        title: languageCopy.mobilityTitle,
        body: languageCopy.mobilityBody,
        fit: languageCopy.mobilityFit,
        caution: languageCopy.mobilityCaution,
        badge: languageCopy.mobilityBadge,
        cta: languageCopy.openGuide,
        guideItemId: guideIds.has(experimentGuideIds.mobility_reset) ? experimentGuideIds.mobility_reset : null,
        sourceLabels: experimentSourceIds.mobility_reset
          .map((id) => sourceById.get(id)?.organization)
          .filter((label): label is string => Boolean(label)),
      },
      {
        id: "cold_finish",
        title: languageCopy.coldTitle,
        body: languageCopy.coldBody,
        fit: languageCopy.coldFit,
        caution: languageCopy.coldCaution,
        badge: languageCopy.coldBadge,
        cta: languageCopy.openNote,
        guideItemId: guideIds.has(experimentGuideIds.cold_finish) ? experimentGuideIds.cold_finish : null,
        sourceLabels: experimentSourceIds.cold_finish
          .map((id) => sourceById.get(id)?.organization)
          .filter((label): label is string => Boolean(label)),
      },
    ],
  };
}
