export type MorningExperimentEvidenceSource = {
  id: string;
  title: string;
  organization: string;
  url: string;
  summary: string;
  translatedSummaryRu: string;
};

export const morningExperimentEvidenceSources: MorningExperimentEvidenceSource[] = [
  {
    id: "aasm-morning-light",
    title: "Early morning sunlight after time change",
    organization: "American Academy of Sleep Medicine",
    url: "https://aasm.org/sleep-experts-call-for-end-of-seasonal-time-changes-ahead-of-springing-forward/",
    summary: "AASM recommends early morning sunlight to help the body clock adjust and support daytime alertness.",
    translatedSummaryRu:
      "AASM рекомендует ранний утренний дневной свет, чтобы помочь биологическим ритмам и дневной бодрости.",
  },
  {
    id: "nhlbi-healthy-sleep-habits",
    title: "Healthy Sleep Habits",
    organization: "NHLBI, NIH",
    url: "https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits",
    summary: "NHLBI highlights a stable wake time, outdoor time, and regular activity as part of healthy sleep habits.",
    translatedSummaryRu:
      "NHLBI подчеркивает стабильное время подъема, время на улице и регулярную активность как часть здоровых привычек сна.",
  },
  {
    id: "who-physical-activity",
    title: "Physical activity and sedentary behaviour: at a glance",
    organization: "World Health Organization",
    url: "https://www.who.int/publications/i/item/9789240014886",
    summary: "WHO provides evidence-based public health guidance for regular physical activity and less sedentary time.",
    translatedSummaryRu:
      "WHO дает доказательные общественные рекомендации по регулярной физической активности и уменьшению малоподвижного времени.",
  },
  {
    id: "cdc-niosh-cold-stress",
    title: "Protecting Yourself from Cold Stress",
    organization: "CDC / NIOSH",
    url: "https://www.cdc.gov/niosh/docs/2010-115/default.html",
    summary: "CDC and NIOSH describe cold stress risks and the practical signs that exposure is becoming unsafe.",
    translatedSummaryRu:
      "CDC и NIOSH описывают риски холодового стресса и практические признаки того, что воздействие холода становится небезопасным.",
  },
  {
    id: "nih-hypothermia",
    title: "The Hazards of Hypothermia",
    organization: "NIH",
    url: "https://newsinhealth.nih.gov/2023/12/hazards-hypothermia",
    summary: "NIH explains how cold exposure can impair clear thinking and movement when the body gets too cold.",
    translatedSummaryRu:
      "NIH объясняет, как воздействие холода может ухудшать ясность мышления и движения, когда тело переохлаждается.",
  },
];
