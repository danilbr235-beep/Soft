export type EvidenceKind = "guideline" | "standards" | "society";
export type EvidenceTopic = "erectile_function" | "sleep_recovery" | "pelvic_floor" | "behavior_change" | "red_flags";

export type EvidenceSource = {
  id: string;
  title: string;
  organization: string;
  url: string;
  kind: EvidenceKind;
  reviewedAt: string;
  summary: string;
  translatedSummaryRu: string;
  topics: EvidenceTopic[];
};

export const officialEvidenceSources: EvidenceSource[] = [
  {
    id: "aua-ed-guideline",
    title: "Erectile Dysfunction Guideline",
    organization: "American Urological Association",
    url: "https://www.auanet.org/guidelines-and-quality/guidelines/erectile-dysfunction-%28ed%29-guideline",
    kind: "guideline",
    reviewedAt: "2026-04-22",
    summary: "Professional guidance for evaluation, counseling, and treatment framing around erectile dysfunction.",
    translatedSummaryRu: "Профессиональный ориентир по оценке, обсуждению и общему лечению эректильной дисфункции.",
    topics: ["erectile_function", "red_flags"],
  },
  {
    id: "eau-sexual-reproductive-health",
    title: "Sexual and Reproductive Health Guidelines",
    organization: "European Association of Urology",
    url: "https://uroweb.org/guidelines/sexual-and-reproductive-health",
    kind: "guideline",
    reviewedAt: "2026-04-22",
    summary: "European guideline set covering male sexual health, erectile dysfunction, and conservative clinical pathways.",
    translatedSummaryRu: "Европейские рекомендации по мужскому сексуальному здоровью, эректильной дисфункции и консервативным клиническим сценариям.",
    topics: ["erectile_function", "behavior_change", "red_flags"],
  },
  {
    id: "aasm-standards-guidelines",
    title: "Standards & Guidelines",
    organization: "American Academy of Sleep Medicine",
    url: "https://aasm.org/standards-guidelines/",
    kind: "guideline",
    reviewedAt: "2026-04-22",
    summary: "Clinical standards and practice guidance relevant to sleep quality, recovery, and common sleep disorders.",
    translatedSummaryRu: "Клинические стандарты и рекомендации по качеству сна, восстановлению и частым нарушениям сна.",
    topics: ["sleep_recovery"],
  },
  {
    id: "ics-standards",
    title: "ICS Standards",
    organization: "International Continence Society",
    url: "https://www.ics.org/standards",
    kind: "standards",
    reviewedAt: "2026-04-22",
    summary: "Terminology and standards backbone for pelvic floor, continence, and related conservative assessment topics.",
    translatedSummaryRu: "Терминологическая и стандартная база по тазовому дну, континенции и связанным консервативным темам оценки.",
    topics: ["pelvic_floor", "red_flags"],
  },
];
