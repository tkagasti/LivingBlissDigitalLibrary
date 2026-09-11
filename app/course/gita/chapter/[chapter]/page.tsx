import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import StudyCompanion from "../../../../components/StudyCompanion";
import { livingBlissGitaContext } from "../../../../platform/context";
import { getGitaChapter, gitaChapters } from "../../course-data";

type ChapterPageProps = {
  params: Promise<{ chapter: string }>;
};

export function generateStaticParams() {
  return gitaChapters.map((chapter) => ({ chapter: chapter.slug }));
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { chapter: slug } = await params;
  const chapter = getGitaChapter(slug);
  return chapter
    ? { title: `Chapter ${chapter.number}: ${chapter.title}` }
    : { title: "Bhagavad Gita chapter" };
}

export default async function GitaChapterPage({ params }: ChapterPageProps) {
  const { chapter: slug } = await params;
  const chapter = getGitaChapter(slug);
  if (!chapter) notFound();

  const previous = gitaChapters[chapter.number - 2];
  const next = gitaChapters[chapter.number];

  return (
    <div className="course-workspace-root">
      <a className="skip-link" href="#chapter-content">Skip to chapter content</a>
      <header className="course-workspace-header">
        <Link href="/" aria-label="Living Bliss Digital Library home">
          <Image src="/living-bliss-logo-2026.png" alt="Living Bliss — Awakening Inner Bliss" width={1881} height={836} priority />
        </Link>
        <div className="workspace-context">
          <span>{livingBlissGitaContext.programmeName}</span>
          <strong>{livingBlissGitaContext.editionName}</strong>
        </div>
        <nav aria-label="Course utilities">
          <Link href="/course/gita">Course overview</Link>
          <Link href="/library">Library</Link>
          <Link className="workspace-account-link" href="/dashboard">My learning</Link>
        </nav>
      </header>

      <main className="course-workspace">
        <aside className="course-rail" aria-label="Bhagavad Gita chapters">
          <Link className="course-rail-foundations" href="/course/gita/foundations">
            <span>Start here</span>
            <strong>Foundations</strong>
          </Link>
          <div className="course-rail-progress">
            <span>18-chapter pathway</span>
            <small>1 chapter learning pilot available</small>
          </div>
          <nav>
            {gitaChapters.map((item) => (
              <Link
                key={item.number}
                href={`/course/gita/chapter/${item.slug}`}
                aria-current={item.number === chapter.number ? "page" : undefined}
              >
                <span>{String(item.number).padStart(2, "0")}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.status === "available" ? "Learning pilot" : "Curriculum preview"}</small>
                </div>
              </Link>
            ))}
          </nav>
        </aside>

        <article className="chapter-content" id="chapter-content">
          <div className="chapter-breadcrumbs">
            <Link href="/course/gita">Course</Link><span>/</span><span>Chapter {chapter.number}</span>
          </div>
          <div className="edition-banner">
            <div>
              <span className="eyebrow">Active edition</span>
              <strong>{livingBlissGitaContext.editionName}</strong>
              <small>{livingBlissGitaContext.editionAuthority} · {livingBlissGitaContext.editionVersion}</small>
            </div>
            <span className="edition-status">Prototype content</span>
          </div>

          <section className="chapter-hero-panel">
            <div className="chapter-ordinal"><span>Chapter</span><strong>{chapter.number}</strong><small>of 18</small></div>
            <div>
              <span className="eyebrow">Bhagavad Gita: Foundations</span>
              <h1>{chapter.title}</h1>
              <p>{chapter.focus}</p>
            </div>
          </section>

          <section className="chapter-essential-question">
            <span aria-hidden="true">◇</span>
            <div>
              <small>Essential question</small>
              <h2>{chapter.essentialQuestion}</h2>
            </div>
          </section>

          <section className="chapter-learning-pattern" aria-labelledby="chapter-path-title">
            <div className="chapter-section-heading">
              <div><span className="eyebrow">Nine-step chapter pattern</span><h2 id="chapter-path-title">Your learning path</h2></div>
              <span>{chapter.status === "available" ? "Pilot ready" : "Awaiting approved edition content"}</span>
            </div>
            <ol>
              {[
                ["Orient", "Narrative, essential question and outcomes"],
                ["Encounter", "Selected verses and authorised translation"],
                ["Understand", "Clearly labelled commentary and explanation"],
                ["Explore", "Video, audio, slides and optional full text"],
                ["Apply", "A life-connected scenario or practice"],
                ["Check", "Low-stakes understanding check"],
                ["Reflect", "A private prompt, never shared by default"],
                ["Demonstrate", "Chapter assessment or reviewed task"],
                ["Consolidate", "Summary, glossary and spaced revision"],
              ].map(([title, description], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{title}</strong><small>{description}</small></div>
                </li>
              ))}
            </ol>
          </section>

          {chapter.status === "available" ? (
            <section className="chapter-ready-card">
              <div><span className="eyebrow">Available learning pilot</span><h2>Study Chapter 2 shlokas</h2><p>Begin with Bhagavad Gita 2.47 and follow the Devanagari shloka, English transliteration, sandhi-vicheda, word meanings and selected-language translation. The assessment unlocks after the chapter study is complete.</p></div>
              <Link className="button primary" href="/lesson/gita-2-47">Begin shloka study →</Link>
            </section>
          ) : (
            <section className="chapter-governance-card">
              <span aria-hidden="true">✓</span>
              <div><strong>Curriculum structure is ready; authoritative content is protected.</strong><p>Verse selections, translations, commentary, media and assessments will appear only after the edition owner completes scholarly, pedagogical, accessibility and rights approval.</p></div>
            </section>
          )}

          <nav className="chapter-pagination" aria-label="Adjacent chapters">
            {previous ? <Link href={`/course/gita/chapter/${previous.slug}`}><small>Previous chapter</small><strong>← {previous.title}</strong></Link> : <span />}
            {next ? <Link href={`/course/gita/chapter/${next.slug}`}><small>Next chapter</small><strong>{next.title} →</strong></Link> : <Link href="/course/gita"><small>Course map</small><strong>Review the pathway →</strong></Link>}
          </nav>
        </article>

        <StudyCompanion chapterNumber={chapter.number} context={livingBlissGitaContext} />
      </main>
    </div>
  );
}
