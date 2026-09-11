import { essentialShlokas } from "../gita/essential-shlokas/data";
import { gitaChapters } from "../course/gita/course-data";
import { livingBlissGitaContext } from "../platform/context";
import type { StudyCitation } from "./contracts";

export type ApprovedSource = {
  citation: StudyCitation;
  chapterNumber?: number;
  searchableText: string;
  answerText: string;
};

const chapterSources: ApprovedSource[] = gitaChapters.map((chapter) => ({
  chapterNumber: chapter.number,
  searchableText: `${chapter.number} ${chapter.title} learning focus curriculum preview essential question reflect study ${chapter.focus} ${chapter.essentialQuestion}`,
  answerText: `The current Living Bliss curriculum describes Chapter ${chapter.number}, ${chapter.title}, with this learner-facing focus: ${chapter.focus} Its guiding question is: ${chapter.essentialQuestion}`,
  citation: {
    id: `curriculum-gita-${chapter.number}`,
    title: "Bhagavad Gita: Foundations curriculum",
    locator: `Chapter ${chapter.number} curriculum preview`,
    sourceLayer: "curriculum",
    editionId: livingBlissGitaContext.editionId,
    version: livingBlissGitaContext.editionVersion,
  },
}));

const shlokaSources: ApprovedSource[] = essentialShlokas.map((shloka) => ({
  chapterNumber: Number(shloka.reference.split(".")[0]),
  searchableText: `${shloka.reference} ${shloka.title} ${shloka.theme} ${shloka.meaning} ${shloka.transliteration}`,
  answerText: `For Bhagavad Gita ${shloka.reference}, the curated prototype learning layer is titled “${shloka.title}” and gives this plain-language summary: ${shloka.meaning}`,
  citation: {
    id: `shloka-${shloka.reference.replace(".", "-")}`,
    title: `Bhagavad Gita ${shloka.reference} · ${shloka.title}`,
    locator: "Curated prototype learning layer",
    sourceLayer: "learning-explanation",
    editionId: livingBlissGitaContext.editionId,
    version: livingBlissGitaContext.editionVersion,
  },
}));

export const approvedStudySources = [...chapterSources, ...shlokaSources];
