import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import StudyCompanion from "../../../../components/StudyCompanion";
import { livingBlissGitaContext } from "../../../../platform/context";
import { databaseGitaVerseHref, getDatabaseGitaChapters } from "../../gita-repository";

type ChapterPageProps = {
  params: Promise<{ chapter: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { chapter: slug } = await params;
  const chapters = await getDatabaseGitaChapters();
  const chapter = chapters.find((item) => item.slug === slug);
  return chapter
    ? { title: `Chapter ${chapter.number}: ${chapter.title}` }
    : { title: "Bhagavad Gita chapter" };
}

export default async function GitaChapterPage({ params }: ChapterPageProps) {
  const { chapter: slug } = await params;
  const chapters = await getDatabaseGitaChapters();
  const chapter = chapters.find((item) => item.slug === slug);
  if (!chapter) notFound();

  const previous = chapters[chapter.number - 2];
  const next = chapters[chapter.number];

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
            <small>701 Sanskrit shlokas available</small>
          </div>
          <nav>
            {chapters.map((item) => (
              <Link
                key={item.number}
                href={`/course/gita/chapter/${item.slug}`}
                aria-current={item.number === chapter.number ? "page" : undefined}
              >
                <span>{String(item.number).padStart(2, "0")}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.verseCount} shlokas · full text</small>
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
              <strong>Living Bliss open Sanskrit text</strong>
              <small>Devanagari · Public-domain source edition · Complete text</small>
            </div>
            <span className="edition-status">Published Sanskrit text</span>
          </div>

          <section className="chapter-hero-panel">
            <div className="chapter-ordinal"><span>Chapter</span><strong>{chapter.number}</strong><small>of 18</small></div>
            <div>
              <span className="eyebrow">Shreemad Bhagavad Geeta · Chapter {chapter.number}</span>
              <h1>{chapter.title}</h1>
              <p>{chapter.focus} Study all {chapter.verseCount} shlokas in canonical sequence.</p>
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
              <div><span className="eyebrow">Academic chapter method</span><h2 id="chapter-path-title">How to study this chapter</h2></div>
              <span>{chapter.verseCount} shlokas · sequential study</span>
            </div>
            <ol>
              {[
                ["Orient", "Narrative, essential question and outcomes"],
                ["Encounter", "Every shloka in canonical sequence"],
                ["Understand", "Separately reviewed translation and analysis layers"],
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

          <section className="chapter-verse-index" aria-labelledby="chapter-verses-title">
            <div className="chapter-section-heading">
              <div><span className="eyebrow">Complete chapter text</span><h2 id="chapter-verses-title">Shlokas 1–{chapter.verseCount}</h2></div>
              <Link className="button primary" href={databaseGitaVerseHref(chapter.verses[0])}>Begin with Shloka 1 →</Link>
            </div>
            <nav aria-label={`Chapter ${chapter.number} shlokas`}>
              {chapter.verses.map((verse) => (
                <Link key={verse.reference} href={databaseGitaVerseHref(verse)}>
                  <small>Shloka</small>
                  <strong>{verse.reference}</strong>
                </Link>
              ))}
            </nav>
            {chapter.number === 13 && (
              <p className="chapter-recension-note"><span aria-hidden="true">ⓘ</span>This open edition numbers the prefatory question by Arjuna as 13.1; the complete course therefore contains 701 numbered shlokas.</p>
            )}
          </section>

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
