import type { AppLanguage } from "@pmhc/types";
import type { MorningRoutineReview } from "./morningRoutineReview";

export type CoachMorningAnswer = {
  id: "morning";
  title: string;
  body: string;
  nextStep: string;
};

export function buildCoachMorningAnswer(
  review: MorningRoutineReview,
  language: AppLanguage,
): CoachMorningAnswer {
  return {
    id: "morning",
    title: language === "ru" ? "Что с утренней рутиной?" : "What about the morning routine?",
    body: [review.tone, review.reason].join(" "),
    nextStep: review.nextStep,
  };
}
