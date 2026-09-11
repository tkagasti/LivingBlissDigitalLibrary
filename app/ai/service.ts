import { approvedStudySources, type ApprovedSource } from "./approved-corpus";
import type { StudyAssistantProvider, StudyCompanionRequest, StudyCompanionResponse } from "./contracts";
import { livingBlissGitaContext } from "../platform/context";

const ignoredTerms = new Set([
  "about", "after", "again", "also", "chapter", "could", "course", "does", "from", "gita", "have",
  "into", "living", "more", "should", "that", "their", "there", "these", "this", "what", "when", "where",
  "which", "with", "would", "your",
]);

function normaliseTerms(value: string) {
  return value
    .toLocaleLowerCase("en")
    .normalize("NFKD")
    .replace(/[^a-z0-9.\s-]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !ignoredTerms.has(term));
}

function scoreSource(source: ApprovedSource, terms: string[], chapterNumber?: number) {
  const haystack = source.searchableText.toLocaleLowerCase("en").normalize("NFKD");
  const termScore = terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
  const chapterScore = chapterNumber && source.chapterNumber === chapterNumber ? 2 : 0;
  return (termScore * 3) + chapterScore;
}

export function retrieveApprovedSources(question: string, chapterNumber?: number) {
  const terms = normaliseTerms(question);
  return approvedStudySources
    .map((source) => ({ source, score: scoreSource(source, terms, chapterNumber) }))
    .filter((entry) => entry.score >= 3 && (!chapterNumber || entry.source.chapterNumber === chapterNumber))
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map((entry) => entry.source);
}

function supportReference() {
  return `LB-AI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function refusesInstructionOverride(question: string) {
  return /(ignore|reveal|override|bypass).{0,30}(instruction|system|guardrail|policy|prompt)/i.test(question);
}

export class RetrievalOnlyStudyProvider implements StudyAssistantProvider {
  readonly id = "living-bliss-retrieval-only";

  async answer(request: StudyCompanionRequest): Promise<StudyCompanionResponse> {
    const base = {
      responseMode: "retrieval-only" as const,
      limitations: "This preview uses only curated Living Bliss curriculum and learning sources. It does not create scripture, translations or theological rulings.",
      supportReference: supportReference(),
    };

    if (refusesInstructionOverride(request.question)) {
      return {
        ...base,
        answer: "I cannot override the source and safety rules. Ask about the current chapter, a listed verse, or how to use this course.",
        citations: [],
        grounded: false,
      };
    }

    const sources = retrieveApprovedSources(request.question, request.chapterNumber);
    if (!sources.length) {
      return {
        ...base,
        answer: "I do not have enough approved course material to answer that responsibly. Try asking about this chapter’s learning focus, or open the source layers when they are published.",
        citations: [],
        grounded: false,
      };
    }

    return {
      ...base,
      answer: sources.map((source) => source.answerText).join("\n\n"),
      citations: sources.map((source) => source.citation),
      grounded: true,
    };
  }
}

export function getStudyAssistantProvider(): StudyAssistantProvider {
  // A model-backed adapter can replace this provider later. The route and UI
  // contract stay stable, and retrieved tenant sources remain authoritative.
  return new RetrievalOnlyStudyProvider();
}

export function validateStudyRequest(value: unknown): StudyCompanionRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const question = typeof input.question === "string" ? input.question.trim() : "";
  const chapterNumber = input.chapterNumber == null ? undefined : Number(input.chapterNumber);
  if (question.length < 3 || question.length > 600) return null;
  if (chapterNumber != null && (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 18)) return null;
  if (input.tenantId !== livingBlissGitaContext.tenantId) return null;
  if (input.programmeId !== livingBlissGitaContext.programmeId) return null;
  if (input.editionId !== livingBlissGitaContext.editionId) return null;

  return {
    question,
    chapterNumber,
    tenantId: livingBlissGitaContext.tenantId,
    programmeId: livingBlissGitaContext.programmeId,
    editionId: livingBlissGitaContext.editionId,
    language: typeof input.language === "string" ? input.language.slice(0, 12) : livingBlissGitaContext.language,
  };
}
