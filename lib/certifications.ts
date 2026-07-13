// Erkende duurzaamheidskeurmerken (poort 1 uit de sustainability-curation skill).
// Certificeringen worden opgeslagen als sustainability_tags; deze module
// herkent ze en scheidt ze bij weergave van de gewone kenmerken.

export const CERTIFICATIONS = [
  "b-corp",
  "fairtrade",
  "gots",
  "eu-ecolabel",
  "fsc",
  "cradle-to-cradle",
  "oeko-tex",
  "energy-star",
  "rainforest-alliance",
  "demeter",
  "msc-asc",
] as const;

export type Certification = (typeof CERTIFICATIONS)[number];

// Nette weergavenaam per keurmerk.
export const CERTIFICATION_LABELS: Record<Certification, string> = {
  "b-corp": "B Corp",
  fairtrade: "Fairtrade",
  gots: "GOTS",
  "eu-ecolabel": "EU Ecolabel",
  fsc: "FSC",
  "cradle-to-cradle": "Cradle to Cradle",
  "oeko-tex": "OEKO-TEX",
  "energy-star": "ENERGY STAR",
  "rainforest-alliance": "Rainforest Alliance",
  demeter: "Demeter",
  "msc-asc": "MSC/ASC",
};

export function isCertification(tag: string): tag is Certification {
  return (CERTIFICATIONS as readonly string[]).includes(tag);
}

export function certificationLabel(tag: string): string {
  return isCertification(tag) ? CERTIFICATION_LABELS[tag] : tag;
}

// Splitst een lijst tags in keurmerken en gewone kenmerken.
export function splitTags(tags: string[]): {
  certifications: string[];
  characteristics: string[];
} {
  return {
    certifications: tags.filter(isCertification),
    characteristics: tags.filter((t) => !isCertification(t)),
  };
}
