export type PlatformContext = {
  tenantId: string;
  tenantName: string;
  programmeId: string;
  programmeName: string;
  editionId: string;
  editionName: string;
  editionAuthority: string;
  editionVersion: string;
  publicationStatus: "prototype" | "published" | "superseded" | "retracted";
  language: string;
  roleScopes: readonly string[];
};

export const livingBlissGitaContext: PlatformContext = {
  tenantId: "living-bliss",
  tenantName: "Living Bliss",
  programmeId: "gita-foundations",
  programmeName: "Bhagavad Gita: Foundations",
  editionId: "living-bliss-gita-foundations-en",
  editionName: "Living Bliss reference edition",
  editionAuthority: "Living Bliss editorial programme",
  editionVersion: "prototype-1",
  publicationStatus: "prototype",
  language: "en",
  roleScopes: ["catalogue:read", "learning:read", "study-companion:use"],
};

export function publicContextEnvelope(overrides: Partial<PlatformContext> = {}): PlatformContext {
  return { ...livingBlissGitaContext, ...overrides };
}
