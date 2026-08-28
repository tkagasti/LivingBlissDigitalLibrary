"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { chapters, collections, libraryItems, questions } from "../lib-data";

export type View =
  | "home"
  | "library"
  | "course"
  | "lesson"
  | "assessment"
  | "dashboard"
  | "membership"
  | "certificate";

type Learner = {
  id: string;
  displayName: string;
  preferredLanguage: string;
  learningMode: string;
  completedLessons: string[];
  assessmentScore: number | null;
  assessmentPassed: boolean;
  memberJoined: boolean;
  updatedAt: string;
};

const initialLearner: Learner = {
  id: "",
  displayName: "Seeker",
  preferredLanguage: "English",
  learningMode: "Mixed learning",
  completedLessons: [],
  assessmentScore: null,
  assessmentPassed: false,
  memberJoined: false,
  updatedAt: "",
};

const navItems = [
  { label: "Library", href: "/library", views: ["library"] },
  { label: "Learn", href: "/course/gita", views: ["course", "lesson", "assessment"] },
  { label: "Jagannatha Dham", href: "/library?search=Jagannatha", views: [] },
  { label: "Membership", href: "/membership", views: ["membership"] },
];

function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Living Bliss Digital Library home">
      <Image
        className="brand-logo"
        src="/living-bliss-logo-2026.png"
        alt="Living Bliss — Awakening Inner Bliss"
        width={1881}
        height={836}
        priority
      />
    </Link>
  );
}

function Header({ view, learner, authenticated, onJoin }: { view: View; learner: Learner; authenticated: boolean; onJoin: () => void }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} aria-current={item.views.includes(view) ? "page" : undefined}>
              {item.label}
            </a>
          ))}
          <a href="https://livingbliss.org/" className="main-site-link">Main site ↗</a>
        </nav>
        <div className="header-actions">
          {authenticated ? (
            <a className="profile-button" href="/dashboard" aria-label={`Open ${learner.displayName}'s learning dashboard`}>
              <span>{learner.displayName.slice(0, 1).toUpperCase()}</span>
              <b>My learning</b>
            </a>
          ) : (
            <>
              <a className="button ghost small" href="/sign-in">Sign in</a>
              <button className="button primary small" onClick={onJoin}>Join free</button>
            </>
          )}
          <details className="mobile-menu">
            <summary aria-label="Open navigation">Menu</summary>
            <nav aria-label="Mobile navigation">
              {navItems.map((item) => <a key={item.label} href={item.href}>{item.label}</a>)}
              <a href="/dashboard">My learning</a>
              <a href="/account">Account</a>
              <a href="https://livingbliss.org/">Main Living Bliss site ↗</a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Brand />
          <p>Authentic spiritual knowledge made accessible across cultures, traditions and geographical boundaries.</p>
        </div>
        <div>
          <strong>Explore</strong>
          <a href="/library">Scripture library</a>
          <a href="/course/gita">Guided learning</a>
          <a href="/membership">Membership</a>
        </div>
        <div>
          <strong>Living Bliss</strong>
          <a href="https://livingbliss.org/about">About</a>
          <a href="https://livingbliss.org/resources">Resources</a>
          <a href="https://livingbliss.org/contact">Contact</a>
        </div>
        <div>
          <strong>Trust</strong>
          <span>Source-aware publishing</span>
          <span>Scholar review workflow</span>
          <span>WCAG 2.2 AA target</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Living Bliss. All rights reserved.</span>
        <span>ॐ श्री गुरुभ्यो नमः · ॐ श्री परमात्मने नमः</span>
      </div>
    </footer>
  );
}

function CollectionCard({ item }: { item: (typeof collections)[number] }) {
  return (
    <article className={`collection-card ${item.tone}`}>
      <div className="collection-top">
        <span className="collection-mark" aria-hidden="true">{item.mark}</span>
        <span className="status-pill">{item.type}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="card-footer">
        <small>{item.meta}</small>
        <a href={item.href} aria-label={`Explore ${item.title}`}>Explore <span aria-hidden="true">→</span></a>
      </div>
    </article>
  );
}

function HomeView({ learner, onJoin }: { learner: Learner; onJoin: () => void }) {
  const [search, setSearch] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    window.location.href = `/library?search=${encodeURIComponent(search)}`;
  };
  return (
    <>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content page-shell">
          <span className="eyebrow">Authentic wisdom · accessible to all</span>
          <h1>Explore, learn and live the wisdom of Sanātana Dharma.</h1>
          <p>Read verified scriptures, follow beginner-friendly learning paths and preserve your progress across every chapter.</p>
          <form className="hero-search" onSubmit={submit} role="search">
            <label className="sr-only" htmlFor="home-search">Search the digital library</label>
            <input id="home-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search a scripture, verse, teacher or topic…" />
            <button type="submit" aria-label="Search">Search</button>
          </form>
          <div className="hero-actions">
            <a className="button primary" href="/library?search=Jagannatha">Explore Jagannatha Dham</a>
            <a className="button light" href="/course/gita">Start the Gita pathway</a>
          </div>
        </div>
      </section>

      <div className="trust-strip">
        <span>✓ Scholar-reviewed editions</span><span>✓ Source traceability</span><span>✓ Four initial languages</span><span>✓ Accessible learning</span>
      </div>

      {learner.memberJoined && (
        <section className="resume-band">
          <div className="page-shell resume-inner">
            <div>
              <span className="eyebrow">Welcome back, {learner.displayName}</span>
              <h2>{learner.completedLessons.length ? "Continue where you left off" : "Your learning path is ready"}</h2>
              <p>{learner.completedLessons.length ? "Bhagavad Gita · Chapter 2 · assessment is the next step" : "Bhagavad Gita Foundations · Chapter 1"}</p>
            </div>
            <a className="button primary" href={learner.completedLessons.length ? "/assessment/gita-2" : "/course/gita"}>Resume learning</a>
          </div>
        </section>
      )}

      <section className="section page-shell" aria-labelledby="featured-title">
        <div className="section-heading">
          <div><span className="eyebrow">Begin your journey</span><h2 id="featured-title">Featured collections</h2></div>
          <a href="/library">View the full library →</a>
        </div>
        <div className="collection-grid">{collections.map((item) => <CollectionCard key={item.id} item={item} />)}</div>
      </section>

      <section className="section warm-section">
        <div className="page-shell split-section">
          <div>
            <span className="eyebrow">Designed for a first-time learner</span>
            <h2>One calm step at a time</h2>
            <p>Every course explains what you will learn, how long it may take, which formats are available and how achievement is measured before you begin.</p>
            <button className="button primary" onClick={onJoin}>Create your free learning profile</button>
          </div>
          <ol className="journey-steps">
            <li><span>01</span><div><strong>Choose a path</strong><p>Start with a recommendation or browse the complete library.</p></div></li>
            <li><span>02</span><div><strong>Learn your way</strong><p>Switch between video, slides, scripture text, audio and explanation.</p></div></li>
            <li><span>03</span><div><strong>Check understanding</strong><p>Pass each chapter with 60% or revisit targeted learning.</p></div></li>
            <li><span>04</span><div><strong>Keep the achievement</strong><p>Earn badges and download a verifiable course certificate.</p></div></li>
          </ol>
        </div>
      </section>
    </>
  );
}

function LibraryView({ initialSearch }: { initialSearch: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [topic, setTopic] = useState("All");
  const filtered = useMemo(() => libraryItems.filter((item) => {
    const term = search.toLowerCase();
    const text = `${item.title} ${item.subtitle} ${item.type} ${item.topic}`.toLowerCase();
    return (!term || text.includes(term)) && (topic === "All" || item.topic === topic);
  }), [search, topic]);

  return (
    <main className="page-main">
      <section className="page-intro page-shell">
        <span className="eyebrow">Living Bliss knowledge repository</span>
        <h1>Explore the digital library</h1>
        <p>Find scripture, translation, commentary, learning courses and documented Jagannatha Dham heritage with clear source and review status.</p>
        <label className="library-search">
          <span aria-hidden="true">⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles, verses, themes or people…" />
        </label>
      </section>
      <section className="page-shell library-layout">
        <aside className="filter-panel" aria-label="Library filters">
          <strong>Browse by collection</strong>
          {["All", "Jagannatha", "Gita", "Upanishad", "Yoga"].map((value) => (
            <button key={value} className={topic === value ? "active" : ""} onClick={() => setTopic(value)}>{value}<span>{value === "All" ? libraryItems.length : libraryItems.filter((i) => i.topic === value).length}</span></button>
          ))}
          <div className="filter-note"><span>✓</span><p><strong>Trust labels</strong><br />Each item explains whether it is verified, enhanced, under review or in preparation.</p></div>
        </aside>
        <div className="results-panel">
          <div className="results-head"><p><strong>{filtered.length}</strong> items found</p><select aria-label="Sort library results"><option>Featured first</option><option>Title A–Z</option><option>Recently reviewed</option></select></div>
          <div className="results-list">
            {filtered.map((item) => (
              <article key={item.title} className="result-card">
                <div className="result-icon" aria-hidden="true">{item.title.slice(0, 1)}</div>
                <div><span className="eyebrow">{item.type}</span><h2>{item.title}</h2><p>{item.subtitle}</p><div className="result-meta"><span className="verified">{item.status}</span><span>{item.language}</span></div></div>
                <a href={item.topic === "Gita" ? "/course/gita" : "#collection-notice"}>Open <span aria-hidden="true">→</span></a>
              </article>
            ))}
            {!filtered.length && <div className="empty-state"><span>⌕</span><h2>No matching items yet</h2><p>Try a broader title or choose another collection. The repository will grow through reviewed releases.</p><button className="button secondary" onClick={() => { setSearch(""); setTopic("All"); }}>Clear filters</button></div>}
          </div>
          <div className="collection-notice" id="collection-notice"><strong>Progressive publication</strong><p>The Jagannatha Dham corpus is the first major collection. Items marked “in preparation” show the planned catalogue while scholarly review continues.</p></div>
        </div>
      </section>
    </main>
  );
}

function CourseView({ learner, onJoin }: { learner: Learner; onJoin: () => void }) {
  const complete = learner.completedLessons.includes("gita-2-47");
  return (
    <main className="page-main">
      <section className="course-hero">
        <div className="page-shell course-hero-inner">
          <div>
            <div className="breadcrumbs"><a href="/library">Library</a><span>/</span><span>Bhagavad Gita</span></div>
            <span className="eyebrow">Beginner course · verified learning pilot</span>
            <h1>Bhagavad Gita:<br />Foundations</h1>
            <p>A chapter-by-chapter introduction that keeps the original scripture visible while offering accessible explanation, reflection and knowledge checks.</p>
            <div className="course-facts"><span>18 chapters</span><span>12–16 hours</span><span>Video + slides + text</span><span>60% pass mark</span></div>
            <div className="hero-actions">
              <a className="button saffron" href={complete ? "/assessment/gita-2" : "/lesson/gita-2-47"}>{complete ? "Continue to assessment" : "Start with Chapter 1"}</a>
              {!learner.memberJoined && <button className="button outline-light" onClick={onJoin}>Join free to save progress</button>}
            </div>
          </div>
          <aside className="course-progress-card">
            <div className="progress-orbit"><strong>{complete ? "8" : "0"}%</strong><span>course progress</span></div>
            <h2>{learner.memberJoined ? `Namaste, ${learner.displayName}` : "Begin when you are ready"}</h2>
            <p>{complete ? "One lesson is complete. Your Chapter 2 assessment is ready." : "Your first lesson introduces the setting, Arjuna’s question and the discipline of action."}</p>
            <div className="mini-progress"><span style={{ width: complete ? "8%" : "0%" }} /></div>
            <small>{complete ? "1 learning unit complete" : "Progress begins after your first lesson"}</small>
          </aside>
        </div>
      </section>
      <section className="page-shell section course-layout">
        <div>
          <div className="section-heading"><div><span className="eyebrow">Course pathway</span><h2>Learn chapter by chapter</h2></div><span className="pass-chip">Pass mark 60%</span></div>
          <div className="chapter-list">
            {chapters.map((chapter, index) => {
              const available = index < 2;
              return (
                <article key={chapter} className={`chapter-row ${index === 1 ? "featured" : ""}`}>
                  <span className="chapter-number">{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{chapter}</h3><p>{index === 0 ? "The human difficulty · context and reflection" : index === 1 ? "Self-knowledge, steady wisdom and right action" : "Structured lesson content in editorial preparation"}</p></div>
                  <div className="chapter-state">
                    {index === 1 && complete ? <span className="passed">Lesson complete</span> : available ? <a href={index === 1 ? "/lesson/gita-2-47" : "/lesson/gita-2-47"}>{index === 1 ? "Open chapter" : "Preview"} →</a> : <span>Planned</span>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <aside className="course-side">
          <div className="side-card"><span className="eyebrow">How achievement works</span><ol><li>Complete required lessons</li><li>Take the chapter assessment</li><li>Score 60% or higher</li><li>Receive a chapter badge</li></ol></div>
          <div className="side-card source-card"><span>✓</span><h3>Source-aware learning</h3><p>Scripture, translation, commentary and modern explanation are shown as distinct layers.</p><a href="/library">View editorial standards →</a></div>
        </aside>
      </section>
    </main>
  );
}

function LessonView({ learner, save, saving, onJoin }: { learner: Learner; save: (payload: Record<string, unknown>) => Promise<void>; saving: boolean; onJoin: () => void }) {
  const [tab, setTab] = useState("video");
  const completed = learner.completedLessons.includes("gita-2-47");
  const markComplete = async () => {
    if (!learner.memberJoined) { onJoin(); return; }
    await save({ action: "completeLesson", lessonId: "gita-2-47" });
  };
  return (
    <main className="page-main lesson-page">
      <div className="lesson-shell">
        <aside className="lesson-nav">
          <a className="back-link" href="/course/gita">← Course overview</a>
          <span className="eyebrow">Bhagavad Gita</span>
          <h2>Chapter 2<br />Sāṅkhya Yoga</h2>
          <div className="lesson-progress"><span style={{ width: completed ? "100%" : "35%" }} /></div>
          <small>{completed ? "Required lesson complete" : "1 of 3 activities viewed"}</small>
          <nav aria-label="Chapter lesson navigation">
            <a className="done" href="#context"><span>✓</span><div><small>Lesson 1</small><strong>Arjuna’s question</strong></div></a>
            <a className="active" href="#lesson"><span>2</span><div><small>Lesson 2</small><strong>Right to action</strong></div></a>
            <a href="#reflection"><span>3</span><div><small>Lesson 3</small><strong>Steady wisdom</strong></div></a>
            <a className={completed ? "" : "locked"} href={completed ? "/assessment/gita-2" : "#assessment-locked"}><span>◎</span><div><small>Chapter test</small><strong>Assessment</strong></div></a>
          </nav>
        </aside>
        <section className="lesson-content" id="lesson">
          <div className="lesson-heading">
            <div><span className="eyebrow">Lesson 2 of 3 · 18 minutes</span><h1>Right to action</h1><p>Understand Gita 2.47 without separating the teaching from its original scriptural context.</p></div>
            <button className="bookmark-button" aria-label="Bookmark lesson">☆ Bookmark</button>
          </div>
          <div className="media-tabs" role="tablist" aria-label="Learning format">
            {["video", "slides", "verse"].map((value) => <button key={value} role="tab" aria-selected={tab === value} onClick={() => setTab(value)}>{value === "video" ? "▶ Video overview" : value === "slides" ? "▤ Study slides" : "ॐ Verse & meaning"}</button>)}
          </div>
          {tab === "video" && <div className="video-panel" role="tabpanel"><div className="video-cover"><button aria-label="Play lesson video">▶</button><div><span>8:24</span><strong>Action, responsibility and the result</strong><small>Captions and transcript available</small></div></div><div className="media-tools"><button>CC Captions</button><button>Transcript</button><button>Playback speed</button><span>Reviewed learning media</span></div></div>}
          {tab === "slides" && <div className="slides-panel" role="tabpanel"><span className="slide-count">Slide 2 of 6</span><div className="slide-inner"><span className="eyebrow">Three distinctions</span><h2>Action is yours.<br />The result is not yours alone.</h2><div className="slide-points"><span>Intention</span><span>Skilful effort</span><span>Non-attachment</span></div></div><div className="slide-nav"><button aria-label="Previous slide">←</button><div><span className="active" /><span /><span /><span /><span /><span /></div><button aria-label="Next slide">→</button></div></div>}
          {tab === "verse" && <article className="verse-panel" role="tabpanel"><div className="verse-tools"><span className="verified">Verified source text</span><button>देवनागरी</button><button>IAST</button><button>🔊 Listen</button></div><p className="devanagari" lang="sa">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।<br />मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥</p><p className="transliteration">karmaṇy evādhikāras te mā phaleṣu kadācana<br />mā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi</p><div className="meaning-grid"><div><strong>Plain-language meaning</strong><p>Your responsibility is to act with care and integrity. Do not treat the result as entirely yours, and do not use uncertainty about results as a reason to avoid right action.</p></div><div><strong>Source</strong><p>Bhagavad Gita 2.47 · source edition and reviewer information shown in the publication record.</p></div></div></article>}
          <section className="reflection-card" id="reflection"><span className="eyebrow">Private reflection · optional</span><h2>Where can you give full effort without trying to control every outcome?</h2><textarea aria-label="Private reflection" placeholder="Write a private note for your own learning…" /><small>Private reflections are never shown on certificates or public profiles.</small></section>
          <div className="lesson-complete"><div><strong>{completed ? "Lesson completed" : "Ready to continue?"}</strong><p>{completed ? "Your progress is saved. The chapter assessment is now available." : "Mark this lesson complete after you have viewed one format and read the verse meaning."}</p></div>{completed ? <a className="button primary" href="/assessment/gita-2">Take chapter assessment</a> : <button className="button primary" onClick={markComplete} disabled={saving}>{saving ? "Saving…" : "Mark lesson complete"}</button>}</div>
        </section>
      </div>
    </main>
  );
}

function AssessmentView({ learner, save, saving, onJoin }: { learner: Learner; save: (payload: Record<string, unknown>) => Promise<void>; saving: boolean; onJoin: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const ready = learner.completedLessons.includes("gita-2-47");
  const submit = async () => {
    if (!learner.memberJoined) { onJoin(); return; }
    const correct = questions.reduce((sum, q, index) => sum + (answers[index] === q.correct ? 1 : 0), 0);
    const score = Math.round((correct / questions.length) * 100);
    await save({ action: "assessment", score });
    setSubmittedScore(score);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (!ready && learner.assessmentScore == null) {
    return <main className="page-main"><section className="locked-page page-shell"><span className="lock-icon">◎</span><span className="eyebrow">Chapter 2 assessment</span><h1>Complete the required lesson first</h1><p>The assessment unlocks when the “Right to action” lesson is marked complete. Reading remains open at all times.</p><a className="button primary" href="/lesson/gita-2-47">Return to the lesson</a></section></main>;
  }
  const score = submittedScore ?? learner.assessmentScore;
  if (score != null) {
    const passed = score >= 60;
    return <main className="page-main"><section className={`result-hero ${passed ? "success" : "review"}`}><div className="page-shell result-inner"><span className="result-symbol">{passed ? "✓" : "↻"}</span><span className="eyebrow">Chapter 2 assessment result</span><h1>{passed ? "You passed" : "Review and try again"}</h1><div className="score-display"><strong>{score}%</strong><span>Minimum pass mark: 60%</span></div><p>{passed ? "You have earned the Sāṅkhya Yoga Explorer achievement. Your result and content version are recorded." : "You are close. Review the lesson sections below, then return for another attempt when you feel ready."}</p><div className="hero-actions">{passed ? <><a className="button primary" href="/certificate">View achievement</a><a className="button secondary" href="/dashboard">Open dashboard</a></> : <><a className="button primary" href="/lesson/gita-2-47">Review lesson</a><button className="button secondary" onClick={() => { setAnswers({}); setSubmittedScore(null); }}>Retake assessment</button></>}</div></div></section><section className="page-shell section"><div className="review-grid"><article><span className="eyebrow">Strong area</span><h2>Source and interpretation</h2><p>You identified why the course keeps scripture, translation and explanation visibly separate.</p></article><article><span className="eyebrow">Review suggestion</span><h2>Action and outcome</h2><p>Revisit the distinction between responsible effort and claiming control over every result.</p><a href="/lesson/gita-2-47">Open verse and meaning →</a></article></div></section></main>;
  }
  return (
    <main className="page-main assessment-page">
      <section className="assessment-head page-shell"><div><div className="breadcrumbs"><a href="/course/gita">Bhagavad Gita</a><span>/</span><span>Chapter 2</span></div><span className="eyebrow">Assessment · attempt saved automatically</span><h1>Sāṅkhya Yoga</h1><p>Answer all five questions. A score of 60% or higher passes this chapter.</p></div><div className="assessment-facts"><span><strong>5</strong> questions</span><span><strong>60%</strong> pass mark</span><span><strong>Untimed</strong> take your time</span></div></section>
      <section className="page-shell assessment-layout"><div className="question-list">{questions.map((question, qIndex) => <fieldset key={question.question} className="question-card"><legend><span>{qIndex + 1}</span>{question.question}</legend>{question.answers.map((answer, aIndex) => <label key={answer} className={answers[qIndex] === aIndex ? "selected" : ""}><input type="radio" name={`q-${qIndex}`} checked={answers[qIndex] === aIndex} onChange={() => setAnswers((current) => ({ ...current, [qIndex]: aIndex }))} /><span>{String.fromCharCode(65 + aIndex)}</span>{answer}</label>)}</fieldset>)}</div><aside className="assessment-side"><div className="side-card sticky"><span className="eyebrow">Your progress</span><div className="question-dots">{questions.map((_, index) => <a key={index} className={answers[index] != null ? "answered" : ""} href={`#q-${index}`} aria-label={`Question ${index + 1}${answers[index] != null ? " answered" : ""}`}>{index + 1}</a>)}</div><p>{Object.keys(answers).length} of {questions.length} answered</p><button className="button primary wide" onClick={submit} disabled={saving || Object.keys(answers).length < questions.length}>{saving ? "Submitting…" : "Submit assessment"}</button>{Object.keys(answers).length < questions.length && <small>Answer every question before submitting.</small>}<hr /><p className="privacy-note">Your individual answers remain private. Only the verified score and achievement status are used for progress and certificates.</p></div></aside></section>
    </main>
  );
}

function DashboardView({ learner, onJoin }: { learner: Learner; onJoin: () => void }) {
  if (!learner.memberJoined) return <main className="page-main"><section className="locked-page page-shell"><span className="lock-icon">◎</span><span className="eyebrow">Personal learning workspace</span><h1>Your learning belongs together</h1><p>Create a free membership to save lessons, track chapter results and download achievements.</p><button className="button primary" onClick={onJoin}>Join free</button></section></main>;
  const lessonComplete = learner.completedLessons.includes("gita-2-47");
  return (
    <main className="page-main dashboard-page">
      <section className="dashboard-welcome"><div className="page-shell"><div><span className="eyebrow">My learning</span><h1>Namaste, {learner.displayName}</h1><p>Continue gently. Your progress is here whenever you return.</p></div><div className="profile-summary"><span>{learner.displayName.slice(0, 1).toUpperCase()}</span><div><strong>{learner.displayName}</strong><small>{learner.preferredLanguage} · {learner.learningMode}</small></div><button onClick={onJoin}>Edit preferences</button></div></div></section>
      <section className="page-shell dashboard-grid">
        <div className="dashboard-main">
          <div className="section-heading"><div><span className="eyebrow">Continue learning</span><h2>Bhagavad Gita: Foundations</h2></div><span className="status-pill">In progress</span></div>
          <article className="continue-card"><div className="continue-art"><span>गी</span></div><div><small>{lessonComplete ? "Next: Chapter 2 assessment" : "Chapter 2 · Lesson 2"}</small><h3>{lessonComplete ? "Check your understanding" : "Right to action"}</h3><p>{lessonComplete ? "Five questions · untimed · 60% pass mark" : "Continue with video, slides or verse study."}</p><div className="mini-progress"><span style={{ width: lessonComplete ? "8%" : "3%" }} /></div><small>{lessonComplete ? "1 lesson complete" : "Learning started"}</small></div><a className="button primary" href={lessonComplete ? "/assessment/gita-2" : "/lesson/gita-2-47"}>Resume</a></article>
          <div className="dashboard-panels"><article><span className="eyebrow">Chapter progress</span><div className="chapter-map">{chapters.map((_, index) => <span key={index} className={index === 1 && learner.assessmentPassed ? "passed" : index <= 1 ? "current" : ""}>{index + 1}</span>)}</div><p>{learner.assessmentPassed ? "Chapter 2 passed · badge earned" : "Chapter 2 is currently in progress"}</p></article><article><span className="eyebrow">Learning rhythm</span><div className="activity-bars"><span style={{ height: "24%" }} /><span style={{ height: "52%" }} /><span style={{ height: "38%" }} /><span style={{ height: lessonComplete ? "82%" : "45%" }} /><span style={{ height: "28%" }} /><span style={{ height: "18%" }} /><span style={{ height: "12%" }} /></div><div className="activity-labels"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><p>Progress is measured by completed learning, not time spent on a page.</p></article></div>
        </div>
        <aside className="dashboard-side"><div className="side-card achievement-card"><span className="eyebrow">Achievements</span>{learner.assessmentPassed ? <><div className="badge-emblem">✓</div><h3>Sāṅkhya Yoga Explorer</h3><p>Earned with a verified score of {learner.assessmentScore}%.</p><a href="/certificate">View certificate →</a></> : <><div className="badge-emblem muted">◎</div><h3>Your first badge is close</h3><p>Complete the Chapter 2 assessment with 60% or higher.</p></>}</div><div className="side-card"><span className="eyebrow">Saved for you</span><div className="saved-stat"><strong>1</strong><span>bookmarked verse</span></div><div className="saved-stat"><strong>{learner.completedLessons.length}</strong><span>completed lessons</span></div><div className="saved-stat"><strong>{learner.assessmentPassed ? "1" : "0"}</strong><span>earned achievements</span></div></div></aside>
      </section>
    </main>
  );
}

function MembershipView({ learner, onJoin }: { learner: Learner; onJoin: () => void }) {
  return (
    <main className="page-main membership-page">
      <section className="membership-intro page-shell"><span className="eyebrow">Open wisdom · personal membership</span><h1>Scripture remains open.<br />Membership helps you learn.</h1><p>Read verified sacred texts without payment. Create a free profile for personal progress, or support preservation and translation through voluntary membership.</p></section>
      <section className="page-shell plan-grid">
        <article className="plan-card"><span className="plan-mark">ॐ</span><span className="eyebrow">Open access</span><h2>Guest reader</h2><div className="price">$0 <small>always</small></div><p>For anyone who wants to read, search and share verified scripture.</p><ul><li>Browse the public library</li><li>Read scripture and translations</li><li>Listen to open recitation</li><li>Share stable verse links</li></ul><a className="button secondary wide" href="/library">Explore freely</a></article>
        <article className="plan-card featured"><span className="recommended-label">Recommended for learners</span><span className="plan-mark">✓</span><span className="eyebrow">Free membership</span><h2>Learning member</h2><div className="price">$0 <small>no card required</small></div><p>For chapter-by-chapter learning with progress and achievement records.</p><ul><li>Everything in open access</li><li>Personal learning dashboard</li><li>Lessons, tests and retakes</li><li>Badges and certificates</li><li>Private bookmarks and notes</li></ul><button className="button primary wide" onClick={onJoin}>{learner.memberJoined ? "Edit learning profile" : "Join free"}</button></article>
        <article className="plan-card"><span className="plan-mark">◇</span><span className="eyebrow">Voluntary support</span><h2>Supporting member</h2><div className="price">Your choice</div><p>For members who wish to sustain preservation, translation and open publishing.</p><ul><li>Everything in free membership</li><li>Supporter impact updates</li><li>Invitations to selected briefings</li><li>No restriction on non-paying learners</li></ul><a className="button saffron wide" href="https://livingbliss.org/donate">Support the mission ↗</a></article>
      </section>
      <section className="page-shell membership-principle"><span>“</span><div><h2>Access to scripture should not depend on payment.</h2><p>Supporting membership funds the work around the text—preservation, review, translation, media and technology—without placing sacred knowledge behind a paywall.</p></div></section>
    </main>
  );
}

function CertificateView({ learner }: { learner: Learner }) {
  const certificateId = `LB-GITA-${(learner.id || "DEMO2026").slice(0, 8).toUpperCase()}`;
  const issueDate = learner.updatedAt ? new Date(learner.updatedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "25 August 2026";
  const download = () => {
    const safeName = learner.displayName.replace(/[<>&"]/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990" viewBox="0 0 1400 990"><rect width="1400" height="990" fill="#fbf8f1"/><rect x="35" y="35" width="1330" height="920" fill="none" stroke="#18264f" stroke-width="5"/><rect x="55" y="55" width="1290" height="880" fill="none" stroke="#b68c3b" stroke-width="2"/><text x="700" y="150" text-anchor="middle" fill="#d9832e" font-family="Arial" font-size="24" font-weight="700">LIVING BLISS DIGITAL LIBRARY</text><text x="700" y="250" text-anchor="middle" fill="#18264f" font-family="Georgia" font-size="66" font-weight="700">Certificate of Achievement</text><text x="700" y="340" text-anchor="middle" fill="#6d7282" font-family="Arial" font-size="24">This certificate is awarded to</text><text x="700" y="430" text-anchor="middle" fill="#18264f" font-family="Georgia" font-size="54">${safeName}</text><line x1="360" x2="1040" y1="455" y2="455" stroke="#b68c3b"/><text x="700" y="530" text-anchor="middle" fill="#6d7282" font-family="Arial" font-size="24">for successfully completing the assessed chapter</text><text x="700" y="610" text-anchor="middle" fill="#18264f" font-family="Georgia" font-size="44" font-weight="700">Sāṅkhya Yoga Explorer</text><text x="700" y="665" text-anchor="middle" fill="#6d7282" font-family="Arial" font-size="22">Bhagavad Gita: Foundations · Verified score ${learner.assessmentScore}%</text><text x="270" y="810" text-anchor="middle" fill="#18264f" font-family="Arial" font-size="19">Issued ${issueDate}</text><text x="700" y="810" text-anchor="middle" fill="#18264f" font-family="Arial" font-size="19">${certificateId}</text><text x="1120" y="810" text-anchor="middle" fill="#18264f" font-family="Arial" font-size="19">Living Bliss</text><text x="700" y="900" text-anchor="middle" fill="#b68c3b" font-family="Arial" font-size="18">Authentic scripture · Guided learning · Traceable achievement</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = document.createElement("a"); a.href = url; a.download = `${certificateId}.svg`; a.click(); URL.revokeObjectURL(url);
  };
  if (!learner.assessmentPassed) return <main className="page-main"><section className="locked-page page-shell"><span className="lock-icon">◇</span><span className="eyebrow">Achievement certificate</span><h1>Your certificate will appear here</h1><p>Pass the Chapter 2 assessment with 60% or higher to issue this demonstration achievement.</p><a className="button primary" href="/assessment/gita-2">Open assessment</a></section></main>;
  return (
    <main className="page-main certificate-page">
      <section className="certificate-toolbar page-shell"><div><span className="eyebrow">Verified achievement</span><h1>Your certificate is ready</h1><p>Download the print-quality vector certificate or print this page as a PDF.</p></div><div><button className="button secondary" onClick={() => window.print()}>Print / Save PDF</button><button className="button primary" onClick={download}>Download certificate</button></div></section>
      <section className="certificate-wrap page-shell"><article className="certificate"><div className="certificate-inner"><div className="certificate-brand"><Image src="/living-bliss-logo-2026.png" alt="Living Bliss — Awakening Inner Bliss" width={1881} height={836} /></div><span className="eyebrow">Certificate of achievement</span><h2>This certificate is awarded to</h2><h3>{learner.displayName}</h3><p>for successfully completing the assessed chapter</p><h4>Sāṅkhya Yoga Explorer</h4><p>Bhagavad Gita: Foundations</p><div className="certificate-score"><strong>{learner.assessmentScore}%</strong><span>Verified score · Pass mark 60%</span></div><div className="certificate-details"><div><span>Issue date</span><strong>{issueDate}</strong></div><div><span>Certificate ID</span><strong>{certificateId}</strong></div><div><span>Status</span><strong>Valid</strong></div></div><div className="certificate-sign"><div><span>Living Bliss</span><small>Issuing authority</small></div><div className="verify-mark"><span>✓</span><small>Publicly verifiable</small></div></div></div></article><aside><div className="side-card"><span className="verified">Valid credential</span><h2>Achievement details</h2><dl><div><dt>Learner</dt><dd>{learner.displayName}</dd></div><div><dt>Course</dt><dd>Bhagavad Gita: Foundations</dd></div><div><dt>Achievement</dt><dd>Sāṅkhya Yoga Explorer</dd></div><div><dt>Verified score</dt><dd>{learner.assessmentScore}%</dd></div><div><dt>Content version</dt><dd>GITA-FND-1.0</dd></div></dl><a href="/dashboard">Return to dashboard →</a></div></aside></section>
    </main>
  );
}

export default function LibraryApp({ view, initialSearch = "" }: { view: View; initialSearch?: string }) {
  const [learner, setLearner] = useState<Learner>(initialLearner);
  const [authenticated, setAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/progress")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        setAuthenticated(Boolean(data.authenticated));
        if (data.learner) setLearner(data.learner);
      })
      .catch(() => setNotice("Progress will reconnect automatically when the service is available."));
  }, []);

  const save = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (response.status === 401) {
        window.location.href = `/sign-in?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }
      if (!response.ok) throw new Error(data.error);
      setLearner(data.learner);
      setNotice("Your progress has been saved.");
    } catch {
      setNotice("We could not save this update. Please try again.");
    } finally { setSaving(false); }
  };

  const join = () => {
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = authenticated
      ? `/onboarding?returnTo=${encodeURIComponent(returnTo)}`
      : `/sign-in?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="site-root">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header view={view} learner={learner} authenticated={authenticated} onJoin={join} />
      <div id="main-content">
        {view === "home" && <HomeView learner={learner} onJoin={join} />}
        {view === "library" && <LibraryView initialSearch={initialSearch} />}
        {view === "course" && <CourseView learner={learner} onJoin={join} />}
        {view === "lesson" && <LessonView learner={learner} save={save} saving={saving} onJoin={join} />}
        {view === "assessment" && <AssessmentView learner={learner} save={save} saving={saving} onJoin={join} />}
        {view === "dashboard" && <DashboardView learner={learner} onJoin={join} />}
        {view === "membership" && <MembershipView learner={learner} onJoin={join} />}
        {view === "certificate" && <CertificateView learner={learner} />}
      </div>
      <Footer />
      {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></div>}
    </div>
  );
}
