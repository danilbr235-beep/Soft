export type MorningRoutineEvidenceSource = {
  id: string;
  title: string;
  organization: string;
  url: string;
  summary: string;
  translatedSummaryRu: string;
};

export const morningRoutineEvidenceSources: MorningRoutineEvidenceSource[] = [
  {
    id: "aasm-morning-light",
    title: "Early morning sunlight after time change",
    organization: "American Academy of Sleep Medicine",
    url: "https://aasm.org/sleep-experts-call-for-end-of-seasonal-time-changes-ahead-of-springing-forward/",
    summary: "AASM recommends early morning sunlight and a consistent routine to support the body clock and daytime alertness.",
    translatedSummaryRu: "AASM советует утренний дневной свет и стабильный распорядок, чтобы поддерживать биологические ритмы и дневную бодрость.",
  },
  {
    id: "nhlbi-healthy-sleep-habits",
    title: "Healthy Sleep Habits",
    organization: "NHLBI, NIH",
    url: "https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits",
    summary: "NHLBI emphasizes a stable wake time, daily time outdoors, and regular physical activity as part of healthy sleep habits.",
    translatedSummaryRu: "NHLBI делает акцент на стабильном времени подъема, ежедневном времени на улице и регулярной физической активности как части здоровых привычек сна.",
  },
  {
    id: "who-physical-activity",
    title: "Physical activity and sedentary behaviour: at a glance",
    organization: "World Health Organization",
    url: "https://www.who.int/publications/i/item/9789240014886",
    summary: "WHO provides evidence-based public health guidance on regular physical activity and reducing sedentary time.",
    translatedSummaryRu: "WHO дает доказательные общественные рекомендации по регулярной физической активности и сокращению малоподвижного времени.",
  },
];
