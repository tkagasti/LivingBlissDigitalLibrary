export type StudyCitation = {
  id: string;
  title: string;
  locator: string;
  sourceLayer: "curriculum" | "scripture" | "translation" | "commentary" | "learning-explanation";
  editionId: string;
  version: string;
};

export type StudyCompanionRequest = {
  question: string;
  tenantId: string;
  programmeId: string;
  editionId: string;
  language: string;
  chapterNumber?: number;
};

export type StudyCompanionResponse = {
  answer: string;
  citations: StudyCitation[];
  grounded: boolean;
  responseMode: "retrieval-only" | "model-assisted";
  limitations: string;
  supportReference: string;
};

export interface StudyAssistantProvider {
  readonly id: string;
  answer(request: StudyCompanionRequest): Promise<StudyCompanionResponse>;
}
