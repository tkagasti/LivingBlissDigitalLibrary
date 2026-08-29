"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { essentialQuestions, essentialShlokas } from "./data";

type Phase = "study" | "assessment" | "result" | "certificate";

const storageKey = "living-bliss-essential-gita-v1";

type GuestProgress = {
  viewed: number[];
  score: number | null;
  name: string;
  issuedAt: string;
  certificateId: string;
};

const emptyProgress: GuestProgress = { viewed: [0], score: null, name: "", issuedAt: "", certificateId: "" };

function GuestHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Living Bliss Digital Library home">
          <Image className="brand-logo" src="/living-bliss-logo-2026.png" alt="Living Bliss — Awakening Inner Bliss" width={1881} height={836} priority />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="/library">Library</a><a href="/course/gita">Learn</a><a href="/membership">Membership</a><a href="https://livingbliss.org/" className="main-site-link">Main site ↗</a>
        </nav>
        <div className="header-actions"><a className="button ghost small" href="/sign-in">Sign in</a><a className="button primary small" href="/sign-in?returnTo=%2Fdashboard">Join free</a></div>
      </div>
    </header>
  );
}

function GuestFooter() {
  return <footer className="guest-gita-footer"><p>ॐ श्री परमात्मने नमः</p><span>Living Bliss Digital Library · Open wisdom for every sincere seeker</span></footer>;
}

export default function EssentialShlokasExperience() {
  const [phase, setPhase] = useState<Phase>("study");
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState<GuestProgress>(emptyProgress);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [certificateName, setCertificateName] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as GuestProgress;
          setProgress({ ...emptyProgress, ...parsed, viewed: parsed.viewed?.length ? parsed.viewed : [0] });
          setCertificateName(parsed.name || "");
        }
      } catch { /* A private browser may disable storage; the experience still works. */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify(progress)); } catch { /* non-essential persistence */ }
  }, [progress, hydrated]);

  const visit = (index: number) => {
    setActive(index);
    setProgress((current) => ({ ...current, viewed: current.viewed.includes(index) ? current.viewed : [...current.viewed, index] }));
    document.getElementById("shloka-reader")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allViewed = progress.viewed.length === essentialShlokas.length;
  const answered = Object.keys(answers).length;
  const passed = (progress.score ?? 0) >= 70;
  const shloka = essentialShlokas[active];
  const issueDate = progress.issuedAt ? new Date(progress.issuedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "";

  const startAssessment = () => {
    setPhase("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitAssessment = () => {
    const correct = essentialQuestions.reduce((total, question, index) => total + (answers[index] === question.correct ? 1 : 0), 0);
    const score = Math.round((correct / essentialQuestions.length) * 100);
    setProgress((current) => ({ ...current, score }));
    setPhase("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const issueCertificate = () => {
    const name = certificateName.trim().replace(/[<>]/g, "").slice(0, 80);
    if (!name) return;
    const issuedAt = new Date().toISOString();
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    setProgress((current) => ({ ...current, name, issuedAt, certificateId: `LB-GITA10-${suffix}` }));
    setPhase("certificate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const downloadCertificate = () => {
    const safeName = progress.name.replace(/[<>&"']/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990" viewBox="0 0 1400 990"><rect width="1400" height="990" fill="#fbf8f1"/><rect x="35" y="35" width="1330" height="920" fill="none" stroke="#18264f" stroke-width="5"/><rect x="55" y="55" width="1290" height="880" fill="none" stroke="#b68c3b" stroke-width="2"/><text x="700" y="145" text-anchor="middle" fill="#d9832e" font-family="Arial" font-size="24" font-weight="700">LIVING BLISS DIGITAL LIBRARY</text><text x="700" y="245" text-anchor="middle" fill="#18264f" font-family="Georgia" font-size="64" font-weight="700">Certificate of Completion</text><text x="700" y="335" text-anchor="middle" fill="#6d7282" font-family="Arial" font-size="24">This certificate is presented to</text><text x="700" y="430" text-anchor="middle" fill="#18264f" font-family="Georgia" font-size="56">${safeName}</text><line x1="330" x2="1070" y1="458" y2="458" stroke="#b68c3b"/><text x="700" y="535" text-anchor="middle" fill="#6d7282" font-family="Arial" font-size="23">for reading and reflecting on</text><text x="700" y="615" text-anchor="middle" fill="#18264f" font-family="Georgia" font-size="43" font-weight="700">10 Essential Shlokas of the Bhagavad Gita</text><text x="700" y="675" text-anchor="middle" fill="#6d7282" font-family="Arial" font-size="21">Knowledge assessment completed · Score ${progress.score}%</text><text x="270" y="820" text-anchor="middle" fill="#18264f" font-family="Arial" font-size="18">Issued ${issueDate}</text><text x="700" y="820" text-anchor="middle" fill="#18264f" font-family="Arial" font-size="18">${progress.certificateId}</text><text x="1120" y="820" text-anchor="middle" fill="#18264f" font-family="Arial" font-size="18">Guest completion</text><text x="700" y="900" text-anchor="middle" fill="#b68c3b" font-family="Arial" font-size="18">Read · Reflect · Live the wisdom</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `${progress.certificateId}.svg`; anchor.click(); URL.revokeObjectURL(url);
  };

  const resumeCertificate = useMemo(() => Boolean(progress.name && progress.certificateId && passed), [progress, passed]);

  return (
    <div className="site-root guest-gita-root">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <GuestHeader />
      <main id="main-content">
        {phase === "study" && <>
          <section className="gita-guest-hero">
            <div className="page-shell gita-guest-hero-inner">
              <div><span className="eyebrow">Open learning · no login required</span><h1>10 essential shlokas<br />for everyday life.</h1><p>Read the Sanskrit, explore a clear meaning and pause for reflection. Visit all ten, pass a short assessment and receive a personal completion certificate—freely.</p><div className="hero-actions"><a className="button saffron" href="#shloka-reader">Begin with shloka 1</a>{resumeCertificate && <button className="button outline-light" onClick={() => setPhase("certificate")}>View my certificate</button>}</div></div>
              <aside><span>गीता</span><strong>10</strong><p>timeless teachings</p><small>Read at your own pace · about 20 minutes</small></aside>
            </div>
          </section>
          <section className="gita-journey-strip"><span><b>1</b> Read all 10</span><span><b>2</b> Take 7 questions</span><span><b>3</b> Score 70%</span><span><b>4</b> Receive certificate</span></section>
          <section className="page-shell gita-reader-layout" id="shloka-reader">
            <aside className="gita-shloka-index"><div><span className="eyebrow">Your reading journey</span><strong>{progress.viewed.length} of 10 visited</strong><div className="mini-progress"><span style={{ width: `${progress.viewed.length * 10}%` }} /></div></div><nav aria-label="Essential shlokas">{essentialShlokas.map((item, index) => <button key={item.reference} className={active === index ? "active" : ""} onClick={() => visit(index)} aria-current={active === index ? "step" : undefined}><span>{progress.viewed.includes(index) ? "✓" : index + 1}</span><div><small>Gita {item.reference}</small><strong>{item.theme}</strong></div></button>)}</nav></aside>
            <article className="gita-shloka-card">
              <div className="gita-shloka-heading"><div><span className="eyebrow">Bhagavad Gita · {shloka.reference}</span><h2>{shloka.title}</h2></div><span className="gita-count">{String(active + 1).padStart(2, "0")} / 10</span></div>
              <div className="gita-scripture"><p className="devanagari" lang="sa">{shloka.devanagari}</p><p className="transliteration">{shloka.transliteration}</p></div>
              <div className="gita-meaning"><span>Plain-language meaning</span><p>{shloka.meaning}</p></div>
              <div className="gita-reflection"><span aria-hidden="true">◇</span><div><small>Pause and reflect</small><p>{shloka.reflection}</p></div></div>
              <div className="gita-reader-actions"><button className="button secondary" disabled={active === 0} onClick={() => visit(active - 1)}>← Previous</button>{active < 9 ? <button className="button primary" onClick={() => visit(active + 1)}>Next shloka →</button> : <button className="button primary" disabled={!allViewed} onClick={startAssessment}>{allViewed ? "Begin assessment →" : "Visit all shlokas first"}</button>}</div>
            </article>
          </section>
          <section className="gita-source-note page-shell"><span>✓</span><div><strong>Source-aware presentation</strong><p>Sanskrit shlokas are presented separately from transliteration and an original plain-language learning summary. References follow the traditional chapter-and-verse numbering.</p></div></section>
        </>}

        {phase === "assessment" && <section className="gita-assessment page-shell"><div className="gita-assessment-intro"><span className="eyebrow">Guest assessment · no login required</span><h1>Check your understanding</h1><p>Answer all seven questions. You need 70% to receive the completion certificate, and you may try again as often as you wish.</p><div><strong>{answered}/7</strong><span>answered</span></div></div><div className="gita-question-list">{essentialQuestions.map((question, questionIndex) => <fieldset key={question.question}><legend><span>{questionIndex + 1}</span>{question.question}</legend>{question.answers.map((answer, answerIndex) => <label key={answer} className={answers[questionIndex] === answerIndex ? "selected" : ""}><input type="radio" name={`essential-${questionIndex}`} checked={answers[questionIndex] === answerIndex} onChange={() => setAnswers((current) => ({ ...current, [questionIndex]: answerIndex }))} /><span>{String.fromCharCode(65 + answerIndex)}</span>{answer}</label>)}</fieldset>)}</div><div className="gita-assessment-submit"><button className="button secondary" onClick={() => setPhase("study")}>← Return to shlokas</button><button className="button primary" disabled={answered < essentialQuestions.length} onClick={submitAssessment}>Submit assessment</button></div></section>}

        {phase === "result" && <section className={`gita-result ${passed ? "passed" : "retry"}`}><div className="page-shell"><span className="gita-result-mark">{passed ? "✓" : "↻"}</span><span className="eyebrow">Assessment result</span><h1>{passed ? "Beautifully done." : "A little more reflection."}</h1><div className="gita-result-score"><strong>{progress.score}%</strong><span>Pass mark 70%</span></div><p>{passed ? "You have completed the 10 Essential Shlokas journey. Add your name to prepare your guest completion certificate." : "Revisit any shloka and try again when you are ready. There is no limit on attempts."}</p>{passed ? <div className="gita-name-form"><label htmlFor="certificate-name">Name to appear on certificate</label><div><input id="certificate-name" value={certificateName} onChange={(event) => setCertificateName(event.target.value)} maxLength={80} placeholder="Your full name" autoComplete="name" /><button className="button saffron" disabled={!certificateName.trim()} onClick={issueCertificate}>Create my certificate</button></div><small>No account is required. Your name and result stay in this browser.</small></div> : <div className="hero-actions"><button className="button primary" onClick={() => { setAnswers({}); setPhase("assessment"); }}>Retake assessment</button><button className="button secondary" onClick={() => setPhase("study")}>Review the shlokas</button></div>}</div></section>}

        {phase === "certificate" && <section className="guest-certificate-page"><div className="certificate-toolbar page-shell"><div><span className="eyebrow">Your open-learning achievement</span><h1>Your certificate is ready</h1><p>Download it now, then join free if you would like future progress and achievements kept together.</p></div><div><button className="button secondary" onClick={() => window.print()}>Print / Save PDF</button><button className="button primary" onClick={downloadCertificate}>Download certificate</button></div></div><div className="guest-certificate-layout page-shell"><article className="certificate guest-certificate"><div className="certificate-inner"><div className="certificate-brand"><Image src="/living-bliss-logo-2026.png" alt="Living Bliss — Awakening Inner Bliss" width={1881} height={836} /></div><span className="eyebrow">Certificate of completion</span><h2>This certificate is presented to</h2><h3>{progress.name}</h3><p>for reading and reflecting on</p><h4>10 Essential Shlokas of the Bhagavad Gita</h4><div className="certificate-score"><strong>{progress.score}%</strong><span>Knowledge assessment · Pass mark 70%</span></div><div className="certificate-details"><div><span>Issue date</span><strong>{issueDate}</strong></div><div><span>Certificate ID</span><strong>{progress.certificateId}</strong></div><div><span>Pathway</span><strong>Guest learning</strong></div></div><div className="certificate-sign"><div><span>Living Bliss</span><small>Open learning pathway</small></div><div className="verify-mark"><span>✓</span><small>Completed in this browser</small></div></div></div></article><aside><div className="gita-join-card"><span className="eyebrow">Keep your journey growing</span><h2>Make this the first step, not the last.</h2><p>Create a free member profile to save course progress, build a learning history and earn member achievements.</p><ul><li>Free personal dashboard</li><li>Chapter-by-chapter Gita course</li><li>Saved progress, notes and bookmarks</li><li>Member assessment records</li></ul><a className="button saffron wide" href="/sign-in?returnTo=%2Fcourse%2Fgita">Join free to continue</a><a className="gita-signin-link" href="/sign-in?returnTo=%2Fcourse%2Fgita">Already a member? Sign in →</a></div><button className="gita-review-link" onClick={() => setPhase("study")}>← Read the 10 shlokas again</button></aside></div></section>}
      </main>
      <GuestFooter />
    </div>
  );
}
