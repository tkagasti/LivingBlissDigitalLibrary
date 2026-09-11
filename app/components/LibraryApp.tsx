"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { chapters, collections, libraryItems, questions } from "../lib-data";
import { gitaChapters } from "../course/gita/course-data";
import type { DemoProfileId, DemoProfileSummary } from "../demo/demo-data";
import ShlokaStudyPanel, {
  localizeStudyDigits,
  resolveStudyLanguage,
  type ShlokaReference,
  type StudyLanguage,
} from "./ShlokaStudyPanel";

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

const chapterTwoShlokaIds = ["gita-2-47", "gita-2-48"] as const;

function completedChapterTwoShlokas(learner: Learner) {
  return chapterTwoShlokaIds.filter((id) => learner.completedLessons.includes(id)).length;
}

function chapterTwoStudyComplete(learner: Learner) {
  return completedChapterTwoShlokas(learner) === chapterTwoShlokaIds.length;
}

function nextChapterTwoHref(learner: Learner) {
  if (!learner.completedLessons.includes("gita-2-47")) return "/lesson/gita-2-47";
  if (!learner.completedLessons.includes("gita-2-48")) return "/lesson/gita-2-48";
  return "/assessment/gita-2";
}

const navItems = [
  { label: "Library", href: "/library", views: ["library"] },
  { label: "Learn", href: "/course/gita", views: ["course", "lesson", "assessment"] },
  { label: "Jagannatha Dham", href: "/library?search=Jagannatha", views: [] },
  { label: "Membership", href: "/membership", views: ["membership"] },
];

type DemoStatus = {
  enabled: boolean;
  activeProfileId: DemoProfileId | null;
  profiles: DemoProfileSummary[];
};

function DemoToolbar({
  status,
  busyProfile,
  onActivate,
  onClear,
  language = "English",
}: {
  status: DemoStatus;
  busyProfile: DemoProfileId | "clear" | null;
  onActivate: (profile: DemoProfileSummary) => void;
  onClear: () => void;
  language?: StudyLanguage;
}) {
  if (!status.enabled) return null;
  const active = status.profiles.find((profile) => profile.id === status.activeProfileId);
  const copy = {
    English: {
      prototype: "Local prototype",
      aria: "Local demonstration profiles",
      experience: "Experience the portal with test data",
      choose: "Choose a learner stage. No production records are changed.",
      labels: { "new-learner": "New learner", "active-learner": "Active learner", "course-completer": "Course completer" },
      descriptions: {
        "new-learner": "Explore the course before completing the first lesson.",
        "active-learner": "Continue to the next shloka before the chapter assessment.",
        "course-completer": "View a passed assessment, achievement and certificate.",
      },
      closing: "Closing…",
      exit: "Exit demo",
    },
    Hindi: {
      prototype: "स्थानीय प्रोटोटाइप",
      aria: "स्थानीय प्रदर्शन प्रोफाइल",
      experience: "परीक्षण सामग्री के साथ पोर्टल देखें",
      choose: "विद्यार्थी की अवस्था चुनें। उत्पादन अभिलेखों में कोई परिवर्तन नहीं होगा।",
      labels: { "new-learner": "नया विद्यार्थी", "active-learner": "सक्रिय विद्यार्थी", "course-completer": "पाठ्यक्रम पूर्ण" },
      descriptions: {
        "new-learner": "पहला पाठ पूर्ण करने से पहले पाठ्यक्रम देखें।",
        "active-learner": "अध्याय के मूल्यांकन से पहले अगले श्लोक का अध्ययन जारी रखें।",
        "course-completer": "उत्तीर्ण मूल्यांकन, उपलब्धि और प्रमाणपत्र देखें।",
      },
      closing: "बन्द हो रहा है…",
      exit: "डेमो बन्द करें",
    },
    Odia: {
      prototype: "ସ୍ଥାନୀୟ ପ୍ରୋଟୋଟାଇପ୍",
      aria: "ସ୍ଥାନୀୟ ପ୍ରଦର୍ଶନ ପ୍ରୋଫାଇଲ୍",
      experience: "ପରୀକ୍ଷା ତଥ୍ୟ ସହିତ ପୋର୍ଟାଲ୍ ଦେଖନ୍ତୁ",
      choose: "ଶିକ୍ଷାର୍ଥୀଙ୍କ ଅବସ୍ଥା ଚୟନ କରନ୍ତୁ। ପ୍ରଡକ୍ସନ୍ ରେକର୍ଡରେ କୌଣସି ପରିବର୍ତ୍ତନ ହେବ ନାହିଁ।",
      labels: { "new-learner": "ନୂତନ ଶିକ୍ଷାର୍ଥୀ", "active-learner": "ସକ୍ରିୟ ଶିକ୍ଷାର୍ଥୀ", "course-completer": "ପାଠ୍ୟକ୍ରମ ସମ୍ପୂର୍ଣ୍ଣ" },
      descriptions: {
        "new-learner": "ପ୍ରଥମ ପାଠ ସମ୍ପୂର୍ଣ୍ଣ କରିବା ପୂର୍ବରୁ ପାଠ୍ୟକ୍ରମ ଦେଖନ୍ତୁ।",
        "active-learner": "ଅଧ୍ୟାୟ ମୂଲ୍ୟାୟନ ପୂର୍ବରୁ ପରବର୍ତ୍ତୀ ଶ୍ଲୋକର ଅଧ୍ୟୟନ ଜାରି ରଖନ୍ତୁ।",
        "course-completer": "ଉତ୍ତୀର୍ଣ୍ଣ ମୂଲ୍ୟାୟନ, ଉପଲବ୍ଧି ଓ ପ୍ରମାଣପତ୍ର ଦେଖନ୍ତୁ।",
      },
      closing: "ବନ୍ଦ ହେଉଛି…",
      exit: "ଡେମୋ ବନ୍ଦ କରନ୍ତୁ",
    },
  }[language];

  return (
    <aside className="demo-toolbar" aria-label={copy.aria}>
      <div className="demo-toolbar-intro">
        <span>{copy.prototype}</span>
        <strong>{active ? `${copy.labels[active.id]}: ${active.learnerName}` : copy.experience}</strong>
        <small>{active ? copy.descriptions[active.id] : copy.choose}</small>
      </div>
      <div className="demo-profile-actions">
        {status.profiles.map((profile) => (
          <button
            key={profile.id}
            className={profile.id === status.activeProfileId ? "active" : ""}
            type="button"
            onClick={() => onActivate(profile)}
            disabled={busyProfile !== null}
            title={copy.descriptions[profile.id]}
          >
            <span>{copy.labels[profile.id]}</span>
            <small>{profile.learnerName}</small>
          </button>
        ))}
        {active && (
          <button className="demo-exit" type="button" onClick={onClear} disabled={busyProfile !== null}>
            {busyProfile === "clear" ? copy.closing : copy.exit}
          </button>
        )}
      </div>
    </aside>
  );
}

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

const headerCopy: Record<StudyLanguage, {
  nav: Record<string, string>;
  primaryNavigation: string;
  mainSite: string;
  myLearning: string;
  openDashboard: (name: string) => string;
  signIn: string;
  joinFree: string;
  signOut: string;
  signingOut: string;
  signOutError: string;
  menu: string;
  openNavigation: string;
  mobileNavigation: string;
  account: string;
  skipContent: string;
  dismissNotice: string;
}> = {
  English: {
    nav: { Library: "Library", Learn: "Learn", "Jagannatha Dham": "Jagannatha Dham", Membership: "Membership" },
    primaryNavigation: "Primary navigation",
    mainSite: "Main site",
    myLearning: "My learning",
    openDashboard: (name) => `Open ${name}'s learning dashboard`,
    signIn: "Sign in",
    joinFree: "Join free",
    signOut: "Sign out",
    signingOut: "Signing out…",
    signOutError: "We couldn't sign you out. Please try again.",
    menu: "Menu",
    openNavigation: "Open navigation",
    mobileNavigation: "Mobile navigation",
    account: "Account",
    skipContent: "Skip to main content",
    dismissNotice: "Dismiss notification",
  },
  Hindi: {
    nav: { Library: "पुस्तकालय", Learn: "अध्ययन", "Jagannatha Dham": "जगन्नाथ धाम", Membership: "सदस्यता" },
    primaryNavigation: "मुख्य मार्गदर्शन",
    mainSite: "मुख्य वेबसाइट",
    myLearning: "मेरा अध्ययन",
    openDashboard: (name) => `${name} का अध्ययन डैशबोर्ड खोलें`,
    signIn: "साइन इन",
    joinFree: "निःशुल्क जुड़ें",
    signOut: "साइन आउट",
    signingOut: "साइन आउट हो रहा है…",
    signOutError: "साइन आउट नहीं हो सका। कृपया पुनः प्रयास करें।",
    menu: "मेनू",
    openNavigation: "मार्गदर्शन खोलें",
    mobileNavigation: "मोबाइल मार्गदर्शन",
    account: "खाता",
    skipContent: "मुख्य सामग्री पर जाएँ",
    dismissNotice: "सूचना बन्द करें",
  },
  Odia: {
    nav: { Library: "ଗ୍ରନ୍ଥାଗାର", Learn: "ଅଧ୍ୟୟନ", "Jagannatha Dham": "ଜଗନ୍ନାଥ ଧାମ", Membership: "ସଦସ୍ୟତା" },
    primaryNavigation: "ମୁଖ୍ୟ ମାର୍ଗଦର୍ଶନ",
    mainSite: "ମୁଖ୍ୟ ୱେବସାଇଟ୍",
    myLearning: "ମୋର ଅଧ୍ୟୟନ",
    openDashboard: (name) => `${name}ଙ୍କ ଅଧ୍ୟୟନ ଡ୍ୟାସବୋର୍ଡ ଖୋଲନ୍ତୁ`,
    signIn: "ସାଇନ୍ ଇନ୍",
    joinFree: "ମାଗଣାରେ ଯୋଗ ଦିଅନ୍ତୁ",
    signOut: "ସାଇନ୍ ଆଉଟ୍",
    signingOut: "ସାଇନ୍ ଆଉଟ୍ ହେଉଛି…",
    signOutError: "ସାଇନ୍ ଆଉଟ୍ ହୋଇପାରିଲା ନାହିଁ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।",
    menu: "ମେନୁ",
    openNavigation: "ମାର୍ଗଦର୍ଶନ ଖୋଲନ୍ତୁ",
    mobileNavigation: "ମୋବାଇଲ୍ ମାର୍ଗଦର୍ଶନ",
    account: "ଆକାଉଣ୍ଟ",
    skipContent: "ମୁଖ୍ୟ ବିଷୟବସ୍ତୁକୁ ଯାଆନ୍ତୁ",
    dismissNotice: "ସୂଚନା ବନ୍ଦ କରନ୍ତୁ",
  },
};

function Header({ view, learner, authenticated, onJoin, language = "English" }: { view: View; learner: Learner; authenticated: boolean; onJoin: () => void; language?: StudyLanguage }) {
  const [signingOut, setSigningOut] = useState(false);
  const copy = headerCopy[language];

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to sign out.");
      window.location.replace("/sign-in");
    } catch {
      setSigningOut(false);
      window.alert(copy.signOutError);
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label={copy.primaryNavigation}>
          {navItems.map((item) => (
            <a key={item.label} href={item.href} aria-current={item.views.includes(view) ? "page" : undefined}>
              {copy.nav[item.label]}
            </a>
          ))}
          <a href="https://livingbliss.org/" className="main-site-link">{copy.mainSite} ↗</a>
        </nav>
        <div className="header-actions">
          {authenticated ? (
            <>
              <a className="profile-button" href="/dashboard" aria-label={copy.openDashboard(learner.displayName)}>
                <span>{learner.displayName.slice(0, 1).toUpperCase()}</span>
                <b>{copy.myLearning}</b>
              </a>
              <button className="header-signout" type="button" onClick={signOut} disabled={signingOut}>
                {signingOut ? copy.signingOut : copy.signOut}
              </button>
            </>
          ) : (
            <>
              <a className="button ghost small" href="/sign-in">{copy.signIn}</a>
              <button className="button primary small" onClick={onJoin}>{copy.joinFree}</button>
            </>
          )}
          <details className="mobile-menu">
            <summary aria-label={copy.openNavigation}>{copy.menu}</summary>
            <nav aria-label={copy.mobileNavigation}>
              {navItems.map((item) => <a key={item.label} href={item.href}>{copy.nav[item.label]}</a>)}
              <a href="/dashboard">{copy.myLearning}</a>
              <a href="/account">{copy.account}</a>
              {authenticated && <button type="button" onClick={signOut} disabled={signingOut}>{signingOut ? copy.signingOut : copy.signOut}</button>}
              <a href="https://livingbliss.org/">{copy.mainSite} ↗</a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

const footerCopy: Record<StudyLanguage, {
  description: string;
  explore: string;
  scriptureLibrary: string;
  guidedLearning: string;
  membership: string;
  about: string;
  resources: string;
  contact: string;
  trust: string;
  sourceAware: string;
  scholarReview: string;
  accessibility: string;
  copyright: string;
  mantra: string;
}> = {
  English: {
    description: "Authentic spiritual knowledge made accessible across cultures, traditions and geographical boundaries.",
    explore: "Explore",
    scriptureLibrary: "Scripture library",
    guidedLearning: "Guided learning",
    membership: "Membership",
    about: "About",
    resources: "Resources",
    contact: "Contact",
    trust: "Trust",
    sourceAware: "Source-aware publishing",
    scholarReview: "Scholar review workflow",
    accessibility: "WCAG 2.2 AA target",
    copyright: "© 2026 Living Bliss. All rights reserved.",
    mantra: "ॐ श्री गुरुभ्यो नमः · ॐ श्री परमात्मने नमः",
  },
  Hindi: {
    description: "प्रामाणिक आध्यात्मिक ज्ञान को संस्कृतियों, परम्पराओं और भौगोलिक सीमाओं के पार सुलभ बनाया गया है।",
    explore: "अन्वेषण",
    scriptureLibrary: "शास्त्र पुस्तकालय",
    guidedLearning: "मार्गदर्शित अध्ययन",
    membership: "सदस्यता",
    about: "हमारे विषय में",
    resources: "संसाधन",
    contact: "सम्पर्क",
    trust: "विश्वसनीयता",
    sourceAware: "स्रोत-सचेत प्रकाशन",
    scholarReview: "विद्वान समीक्षा प्रक्रिया",
    accessibility: "WCAG २.२ AA लक्ष्य",
    copyright: "© २०२६ Living Bliss. सर्वाधिकार सुरक्षित।",
    mantra: "ॐ श्री गुरुभ्यो नमः · ॐ श्री परमात्मने नमः",
  },
  Odia: {
    description: "ପ୍ରାମାଣିକ ଆଧ୍ୟାତ୍ମିକ ଜ୍ଞାନକୁ ସଂସ୍କୃତି, ପରମ୍ପରା ଓ ଭୌଗୋଳିକ ସୀମା ଅତିକ୍ରମ କରି ସମସ୍ତଙ୍କ ପାଇଁ ସହଜଲଭ୍ୟ କରାଯାଉଛି।",
    explore: "ଅନ୍ୱେଷଣ",
    scriptureLibrary: "ଶାସ୍ତ୍ର ଗ୍ରନ୍ଥାଗାର",
    guidedLearning: "ମାର୍ଗଦର୍ଶିତ ଅଧ୍ୟୟନ",
    membership: "ସଦସ୍ୟତା",
    about: "ଆମ ବିଷୟରେ",
    resources: "ସମ୍ବଳ",
    contact: "ଯୋଗାଯୋଗ",
    trust: "ବିଶ୍ୱସନୀୟତା",
    sourceAware: "ଉତ୍ସ-ସଚେତନ ପ୍ରକାଶନ",
    scholarReview: "ବିଦ୍ୱାନ ସମୀକ୍ଷା ପ୍ରକ୍ରିୟା",
    accessibility: "WCAG ୨.୨ AA ଲକ୍ଷ୍ୟ",
    copyright: "© ୨୦୨୬ Living Bliss. ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ।",
    mantra: "ଓଁ ଶ୍ରୀ ଗୁରୁଭ୍ୟୋ ନମଃ · ଓଁ ଶ୍ରୀ ପରମାତ୍ମନେ ନମଃ",
  },
};

function Footer({ language = "English" }: { language?: StudyLanguage }) {
  const copy = footerCopy[language];
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Brand />
          <p>{copy.description}</p>
        </div>
        <div>
          <strong>{copy.explore}</strong>
          <a href="/library">{copy.scriptureLibrary}</a>
          <a href="/course/gita">{copy.guidedLearning}</a>
          <a href="/membership">{copy.membership}</a>
        </div>
        <div>
          <strong>Living Bliss</strong>
          <a href="https://livingbliss.org/about">{copy.about}</a>
          <a href="https://livingbliss.org/resources">{copy.resources}</a>
          <a href="https://livingbliss.org/contact">{copy.contact}</a>
        </div>
        <div>
          <strong>{copy.trust}</strong>
          <span>{copy.sourceAware}</span>
          <span>{copy.scholarReview}</span>
          <span>{copy.accessibility}</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{copy.copyright}</span>
        <span>{copy.mantra}</span>
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
  const chapterStudyComplete = chapterTwoStudyComplete(learner);
  const nextLearningHref = learner.completedLessons.length ? nextChapterTwoHref(learner) : "/course/gita";
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
            <a className="button light" href="/gita/start">Start the Gita pathway</a>
          </div>
        </div>
      </section>

      <div className="trust-strip">
        <span>✓ Scholar-reviewed editions</span><span>✓ Source traceability</span><span>✓ Four initial languages</span><span>✓ Accessible learning</span>
      </div>

      <section className="guest-gita-invite">
        <div className="page-shell guest-gita-invite-inner">
          <div className="guest-gita-invite-mark" aria-hidden="true"><span>गीता</span><strong>10</strong></div>
          <div><span className="eyebrow">A complete experience for every visitor</span><h2>Begin with 10 essential shlokas</h2><p>Read and reflect without signing in, take a short assessment and receive a personal completion certificate.</p></div>
          <a className="button saffron" href="/gita/essential-shlokas">Begin free · no login</a>
        </div>
      </section>

      {learner.memberJoined && (
        <section className="resume-band">
          <div className="page-shell resume-inner">
            <div>
              <span className="eyebrow">Welcome back, {learner.displayName}</span>
              <h2>{learner.completedLessons.length ? "Continue where you left off" : "Your learning path is ready"}</h2>
              <p>{learner.completedLessons.length ? chapterStudyComplete ? "Bhagavad Gita · Chapter 2 · assessment is the next step" : "Bhagavad Gita · Chapter 2 · continue to the next shloka" : "Bhagavad Gita Foundations · Chapter 1"}</p>
            </div>
            <a className="button primary" href={nextLearningHref}>Resume learning</a>
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
                <a href={item.title.startsWith("10 Essential Shlokas") ? "/gita/essential-shlokas" : item.topic === "Gita" ? "/course/gita" : "#collection-notice"}>Open <span aria-hidden="true">→</span></a>
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
  const completedShlokas = completedChapterTwoShlokas(learner);
  const chapterStudyComplete = chapterTwoStudyComplete(learner);
  const progress = completedShlokas * 4;
  const primaryHref = completedShlokas ? nextChapterTwoHref(learner) : "/course/gita/foundations";
  const primaryLabel = chapterStudyComplete ? "Begin chapter assessment" : completedShlokas ? "Continue to next shloka" : "Begin with foundations";
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
              <a className="button saffron" href={primaryHref}>{primaryLabel}</a>
              {!learner.memberJoined && <button className="button outline-light" onClick={onJoin}>Join free to save progress</button>}
            </div>
          </div>
          <aside className="course-progress-card">
            <div className="progress-orbit"><strong>{progress}%</strong><span>course progress</span></div>
            <h2>{learner.memberJoined ? `Namaste, ${learner.displayName}` : "Begin when you are ready"}</h2>
            <p>{chapterStudyComplete ? "The prescribed Chapter 2 shlokas are complete. The chapter assessment is ready." : completedShlokas ? "Continue shloka by shloka. Assessment remains at the end of the chapter." : "Begin with the shared context, verse layers and readiness pathway before Chapter 1."}</p>
            <div className="mini-progress"><span style={{ width: `${progress}%` }} /></div>
            <small>{completedShlokas ? `${completedShlokas} of ${chapterTwoShlokaIds.length} pilot shlokas complete` : "Progress begins after your first shloka"}</small>
          </aside>
        </div>
      </section>
      <section className="page-shell section course-layout">
        <div>
          <div className="section-heading"><div><span className="eyebrow">Course pathway</span><h2>Learn chapter by chapter</h2></div><span className="pass-chip">Pass mark 60%</span></div>
          <div className="chapter-list">
            {gitaChapters.map((chapter) => {
              const available = chapter.status === "available";
              return (
                <article key={chapter.number} className={`chapter-row ${available ? "featured" : ""}`}>
                  <span className="chapter-number">{String(chapter.number).padStart(2, "0")}</span>
                  <div><h3>{chapter.title}</h3><p>{chapter.focus}</p></div>
                  <div className="chapter-state">
                    {available && chapterStudyComplete ? <><span className="passed">Chapter study complete</span><a href="/lesson/gita-2-47">Review shlokas →</a></> : available && completedShlokas ? <><span>{completedShlokas} of {chapterTwoShlokaIds.length} shlokas</span><a href={nextChapterTwoHref(learner)}>Continue →</a></> : <a href={`/course/gita/chapter/${chapter.slug}`}>{available ? "Open chapter" : "Preview chapter"} →</a>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <aside className="course-side">
          <div className="side-card"><span className="eyebrow">How achievement works</span><ol><li>Complete the prescribed shlokas</li><li>Take the end-of-chapter assessment</li><li>Score 60% or higher</li><li>Receive a chapter badge</li></ol></div>
          <div className="side-card source-card"><span>✓</span><h3>Source-aware learning</h3><p>Scripture, translation, commentary and modern explanation are shown as distinct layers.</p><a href="/library">View editorial standards →</a></div>
        </aside>
      </section>
    </main>
  );
}

const shlokaNextHref: Record<ShlokaReference, string> = {
  "2.47": "/lesson/gita-2-48",
  "2.48": "/assessment/gita-2",
};

const lessonCopy: Record<StudyLanguage, {
  courseOverview: string;
  courseName: string;
  chapterLine: string;
  chapterName: string;
  progress: (completed: string, total: string) => string;
  shloka: string;
  afterChapter: string;
  assessment: string;
  navigationAria: string;
  scene: string;
  context: Record<ShlokaReference, string>;
  progressLabel: string;
  completedTitle: (reference: string) => string;
  completeTitle: (reference: string) => string;
  completionCopy: Record<ShlokaReference, string>;
  nextLabel: Record<ShlokaReference, string>;
  saving: string;
}> = {
  English: {
    courseOverview: "Course overview",
    courseName: "Bhagavad Gita",
    chapterLine: "Chapter 2",
    chapterName: "Sāṅkhya Yoga",
    progress: (completed, total) => `${completed} of ${total} pilot shlokas complete`,
    shloka: "Shloka",
    afterChapter: "After chapter study",
    assessment: "Assessment",
    navigationAria: "Chapter 2 shloka navigation",
    scene: "Scene and context",
    context: {
      "2.47": "On the battlefield of Kurukṣetra, Arjuna remains uncertain about action and consequence. Krishna explains that the learner is responsible for sincere action, but cannot claim control over every result.",
      "2.48": "Krishna continues his response to Arjuna by explaining the inner discipline of action: remain steady in both success and failure, without attachment to either outcome.",
    },
    progressLabel: "Shloka-by-shloka progress",
    completedTitle: (reference) => `Shloka ${reference} is complete`,
    completeTitle: (reference) => `Complete Shloka ${reference}`,
    completionCopy: {
      "2.47": "Complete this study before moving to the next shloka. The assessment remains at the end of the chapter.",
      "2.48": "The chapter assessment appears only after every prescribed shloka in the chapter has been completed.",
    },
    nextLabel: {
      "2.47": "Complete study and continue to Shloka 2.48",
      "2.48": "Complete chapter study and open assessment",
    },
    saving: "Saving progress…",
  },
  Hindi: {
    courseOverview: "पाठ्यक्रम पर लौटें",
    courseName: "भगवद्गीता",
    chapterLine: "अध्याय २",
    chapterName: "सांख्य योग",
    progress: (completed, total) => `${total} में से ${completed} पायलट श्लोक पूर्ण`,
    shloka: "श्लोक",
    afterChapter: "अध्याय के अध्ययन के बाद",
    assessment: "मूल्यांकन",
    navigationAria: "अध्याय २ के श्लोकों का मार्गदर्शन",
    scene: "दृश्य और प्रसंग",
    context: {
      "2.47": "कुरुक्षेत्र की युद्धभूमि में अर्जुन कर्म और उसके परिणाम को लेकर दुविधा में हैं। श्रीकृष्ण समझाते हैं कि विद्यार्थी का दायित्व निष्ठापूर्वक कर्म करना है, पर प्रत्येक परिणाम पर नियंत्रण का दावा करना नहीं।",
      "2.48": "श्रीकृष्ण अर्जुन को कर्म के आंतरिक अनुशासन की शिक्षा आगे बढ़ाते हैं—सफलता और असफलता, दोनों में आसक्ति छोड़कर स्थिर रहना।",
    },
    progressLabel: "श्लोक-दर-श्लोक प्रगति",
    completedTitle: (reference) => `श्लोक ${reference} पूर्ण हो गया है`,
    completeTitle: (reference) => `श्लोक ${reference} का अध्ययन पूर्ण करें`,
    completionCopy: {
      "2.47": "अगले श्लोक पर जाने से पहले यह अध्ययन पूर्ण करें। मूल्यांकन अध्याय के अंत में ही होगा।",
      "2.48": "अध्याय के सभी निर्धारित श्लोक पूर्ण होने के बाद ही अध्याय का मूल्यांकन उपलब्ध होगा।",
    },
    nextLabel: {
      "2.47": "अध्ययन पूर्ण करके श्लोक २.४८ पर जाएँ",
      "2.48": "अध्याय का अध्ययन पूर्ण करके मूल्यांकन खोलें",
    },
    saving: "प्रगति सहेजी जा रही है…",
  },
  Odia: {
    courseOverview: "ପାଠ୍ୟକ୍ରମକୁ ଫେରନ୍ତୁ",
    courseName: "ଭଗବଦ୍ ଗୀତା",
    chapterLine: "ଅଧ୍ୟାୟ ୨",
    chapterName: "ସାଂଖ୍ୟ ଯୋଗ",
    progress: (completed, total) => `${total}ଟି ମଧ୍ୟରୁ ${completed}ଟି ପାଇଲଟ୍ ଶ୍ଲୋକ ସମ୍ପୂର୍ଣ୍ଣ`,
    shloka: "ଶ୍ଲୋକ",
    afterChapter: "ଅଧ୍ୟାୟ ଅଧ୍ୟୟନ ପରେ",
    assessment: "ମୂଲ୍ୟାୟନ",
    navigationAria: "ଅଧ୍ୟାୟ ୨ ଶ୍ଲୋକ ମାର୍ଗଦର୍ଶନ",
    scene: "ଦୃଶ୍ୟ ଓ ପ୍ରସଙ୍ଗ",
    context: {
      "2.47": "କୁରୁକ୍ଷେତ୍ର ଯୁଦ୍ଧଭୂମିରେ ଅର୍ଜୁନ କର୍ମ ଓ ତାହାର ଫଳକୁ ନେଇ ଦ୍ୱନ୍ଦ୍ୱରେ ଅଛନ୍ତି। ଶ୍ରୀକୃଷ୍ଣ ବୁଝାଉଛନ୍ତି ଯେ ଶିକ୍ଷାର୍ଥୀଙ୍କ ଦାୟିତ୍ୱ ହେଉଛି ନିଷ୍ଠାର ସହ କର୍ମ କରିବା, କିନ୍ତୁ ପ୍ରତ୍ୟେକ ଫଳ ଉପରେ ନିୟନ୍ତ୍ରଣ ଦାବି କରିବା ନୁହେଁ।",
      "2.48": "ଶ୍ରୀକୃଷ୍ଣ ଅର୍ଜୁନଙ୍କୁ କର୍ମର ଆନ୍ତରିକ ଶୃଙ୍ଖଳା ବିଷୟରେ ଆହୁରି ବୁଝାଉଛନ୍ତି—ସଫଳତା ଓ ବିଫଳତା ଉଭୟରେ ଆସକ୍ତି ତ୍ୟାଗ କରି ସ୍ଥିର ରହିବା।",
    },
    progressLabel: "ଶ୍ଲୋକ ଅନୁସାରେ ପ୍ରଗତି",
    completedTitle: (reference) => `ଶ୍ଲୋକ ${reference} ସମ୍ପୂର୍ଣ୍ଣ ହୋଇଛି`,
    completeTitle: (reference) => `ଶ୍ଲୋକ ${reference} ଅଧ୍ୟୟନ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ`,
    completionCopy: {
      "2.47": "ପରବର୍ତ୍ତୀ ଶ୍ଲୋକକୁ ଯିବା ପୂର୍ବରୁ ଏହି ଅଧ୍ୟୟନ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ। ମୂଲ୍ୟାୟନ ଅଧ୍ୟାୟର ଶେଷରେ ରହିବ।",
      "2.48": "ଅଧ୍ୟାୟର ସମସ୍ତ ନିର୍ଦ୍ଧାରିତ ଶ୍ଲୋକ ସମ୍ପୂର୍ଣ୍ଣ ହେବା ପରେ ମାତ୍ର ଅଧ୍ୟାୟ ମୂଲ୍ୟାୟନ ଉପଲବ୍ଧ ହେବ।",
    },
    nextLabel: {
      "2.47": "ଅଧ୍ୟୟନ ସମ୍ପୂର୍ଣ୍ଣ କରି ଶ୍ଲୋକ ୨.୪୮କୁ ଯାଆନ୍ତୁ",
      "2.48": "ଅଧ୍ୟାୟ ଅଧ୍ୟୟନ ସମ୍ପୂର୍ଣ୍ଣ କରି ମୂଲ୍ୟାୟନ ଖୋଲନ୍ତୁ",
    },
    saving: "ପ୍ରଗତି ସଂରକ୍ଷଣ ହେଉଛି…",
  },
};

function LessonView({
  learner,
  save,
  saving,
  onJoin,
  reference,
  language,
  onLanguageChange,
}: {
  learner: Learner;
  save: (payload: Record<string, unknown>) => Promise<boolean>;
  saving: boolean;
  onJoin: () => void;
  reference: ShlokaReference;
  language: StudyLanguage;
  onLanguageChange: (language: StudyLanguage) => void;
}) {
  const copy = lessonCopy[language];
  const localReference = localizeStudyDigits(reference, language);
  const localCompleted = localizeStudyDigits(completedChapterTwoShlokas(learner), language);
  const localTotal = localizeStudyDigits(chapterTwoShlokaIds.length, language);
  const lessonId = `gita-${reference.replace(".", "-")}`;
  const completed = learner.completedLessons.includes(lessonId);
  const completedShlokas = completedChapterTwoShlokas(learner);
  const chapterComplete = chapterTwoStudyComplete(learner);
  const nextHref = `${shlokaNextHref[reference]}?language=${language}`;

  const completeAndContinue = async () => {
    if (!learner.memberJoined) { onJoin(); return; }
    if (!completed && !(await save({ action: "completeLesson", lessonId }))) return;
    window.location.href = nextHref;
  };

  return (
    <main className="page-main lesson-page compact-shloka-page" lang={language === "Odia" ? "or" : language === "Hindi" ? "hi" : "en"}>
      <div className="lesson-shell">
        <aside className="lesson-nav compact-lesson-nav">
          <a className="back-link" href="/course/gita">← {copy.courseOverview}</a>
          <span className="eyebrow">{copy.courseName}</span>
          <h2>{copy.chapterLine}<br />{copy.chapterName}</h2>
          <div className="lesson-progress"><span style={{ width: `${(completedShlokas / chapterTwoShlokaIds.length) * 100}%` }} /></div>
          <small>{copy.progress(localCompleted, localTotal)}</small>
          <nav aria-label={copy.navigationAria}>
            {(["2.47", "2.48"] as ShlokaReference[]).map((item) => {
              const itemId = `gita-${item.replace(".", "-")}`;
              const itemComplete = learner.completedLessons.includes(itemId);
              return <a key={item} className={item === reference ? "active" : itemComplete ? "done" : ""} href={`/lesson/gita-${item.replace(".", "-")}?language=${language}`}><span>{itemComplete ? "✓" : localizeStudyDigits(item.split(".")[1], language)}</span><div><small>{copy.shloka}</small><strong>{localizeStudyDigits(item, language)}</strong></div></a>;
            })}
            <a className={chapterComplete ? "" : "locked"} href={chapterComplete ? "/assessment/gita-2" : "#chapter-assessment"}><span>◎</span><div><small>{copy.afterChapter}</small><strong>{copy.assessment}</strong></div></a>
          </nav>
        </aside>

        <section className="lesson-content compact-lesson-content" id="lesson">
          <header className="compact-lesson-heading">
            <div className="compact-lesson-identity">
              <span className="eyebrow">{copy.courseName}</span>
              <div><h1>{copy.chapterLine} · {copy.chapterName}</h1><strong>{copy.shloka} {localReference}</strong></div>
            </div>
            <p><span>{copy.scene}</span>{copy.context[reference]}</p>
          </header>

          <ShlokaStudyPanel language={language} onLanguageChange={onLanguageChange} reference={reference} />

          <div className="shloka-completion-card" id="chapter-assessment">
            <div>
              <span className="eyebrow">{copy.progressLabel}</span>
              <strong>{completed ? copy.completedTitle(localReference) : copy.completeTitle(localReference)}</strong>
              <p>{copy.completionCopy[reference]}</p>
            </div>
            {completed ? <a className="button primary" href={nextHref}>{copy.nextLabel[reference]} →</a> : <button className="button primary" type="button" onClick={completeAndContinue} disabled={saving}>{saving ? copy.saving : copy.nextLabel[reference]}</button>}
          </div>
        </section>
      </div>
    </main>
  );
}

function AssessmentView({ learner, save, saving, onJoin }: { learner: Learner; save: (payload: Record<string, unknown>) => Promise<boolean>; saving: boolean; onJoin: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const ready = chapterTwoStudyComplete(learner);
  const submit = async () => {
    if (!learner.memberJoined) { onJoin(); return; }
    const correct = questions.reduce((sum, q, index) => sum + (answers[index] === q.correct ? 1 : 0), 0);
    const score = Math.round((correct / questions.length) * 100);
    if (!(await save({ action: "assessment", score }))) return;
    setSubmittedScore(score);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (!ready && learner.assessmentScore == null) {
    return <main className="page-main"><section className="locked-page page-shell"><span className="lock-icon">◎</span><span className="eyebrow">Chapter 2 assessment</span><h1>Complete the chapter study first</h1><p>The assessment unlocks only after every prescribed shloka in Chapter 2 has been completed. Reading remains open at all times.</p><a className="button primary" href={nextChapterTwoHref(learner)}>Continue chapter study</a></section></main>;
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
  const completedShlokas = completedChapterTwoShlokas(learner);
  const chapterStudyComplete = chapterTwoStudyComplete(learner);
  const continueHref = nextChapterTwoHref(learner);
  const continueHeading = chapterStudyComplete ? "Check your understanding" : completedShlokas ? "Continue shloka study" : "Begin shloka study";
  const continueLabel = chapterStudyComplete ? "Next: Chapter 2 assessment" : `Chapter 2 · Shloka ${completedShlokas ? "2.48" : "2.47"}`;
  const continueCopy = chapterStudyComplete ? "Five questions · untimed · 60% pass mark" : "Study the shloka, Sandhi-vicheda, word meanings and selected-language translation.";
  return (
    <main className="page-main dashboard-page">
      <section className="dashboard-welcome"><div className="page-shell"><div><span className="eyebrow">My learning</span><h1>Namaste, {learner.displayName}</h1><p>Continue gently. Your progress is here whenever you return.</p></div><div className="profile-summary"><span>{learner.displayName.slice(0, 1).toUpperCase()}</span><div><strong>{learner.displayName}</strong><small>{learner.preferredLanguage} · {learner.learningMode}</small></div><button onClick={onJoin}>Edit preferences</button></div></div></section>
      <section className="page-shell dashboard-grid">
        <div className="dashboard-main">
          <div className="section-heading"><div><span className="eyebrow">Continue learning</span><h2>Bhagavad Gita: Foundations</h2></div><span className="status-pill">In progress</span></div>
          <article className="continue-card"><div className="continue-art"><span>गी</span></div><div><small>{continueLabel}</small><h3>{continueHeading}</h3><p>{continueCopy}</p><div className="mini-progress"><span style={{ width: chapterStudyComplete ? "8%" : completedShlokas ? "4%" : "2%" }} /></div><small>{completedShlokas} of {chapterTwoShlokaIds.length} shlokas complete</small></div><a className="button primary" href={continueHref}>Resume</a></article>
          <div className="dashboard-panels"><article><span className="eyebrow">Chapter progress</span><div className="chapter-map">{chapters.map((_, index) => <span key={index} className={index === 1 && learner.assessmentPassed ? "passed" : index <= 1 ? "current" : ""}>{index + 1}</span>)}</div><p>{learner.assessmentPassed ? "Chapter 2 passed · badge earned" : "Chapter 2 is currently in progress"}</p></article><article><span className="eyebrow">Learning rhythm</span><div className="activity-bars"><span style={{ height: "24%" }} /><span style={{ height: "52%" }} /><span style={{ height: "38%" }} /><span style={{ height: completedShlokas ? "82%" : "45%" }} /><span style={{ height: "28%" }} /><span style={{ height: "18%" }} /><span style={{ height: "12%" }} /></div><div className="activity-labels"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><p>Progress is measured by completed learning, not time spent on a page.</p></article></div>
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
        <article className="plan-card"><span className="plan-mark">ॐ</span><span className="eyebrow">Open access</span><h2>Guest reader</h2><div className="price">$0 <small>always</small></div><p>For anyone who wants to read, learn and experience the library before joining.</p><ul><li>Browse the public library</li><li>Read scripture and translations</li><li>Study 10 essential Gita shlokas</li><li>Take the guest assessment</li><li>Receive a completion certificate</li></ul><a className="button secondary wide" href="/gita/essential-shlokas">Begin the free experience</a></article>
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

export default function LibraryApp({
  view,
  initialSearch = "",
  lessonReference = "2.47",
  initialStudyLanguage,
}: {
  view: View;
  initialSearch?: string;
  lessonReference?: ShlokaReference;
  initialStudyLanguage?: StudyLanguage;
}) {
  const [learner, setLearner] = useState<Learner>(initialLearner);
  const [authenticated, setAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [demoStatus, setDemoStatus] = useState<DemoStatus | null>(null);
  const [busyDemoProfile, setBusyDemoProfile] = useState<DemoProfileId | "clear" | null>(null);
  const [studyLanguageOverride, setStudyLanguageOverride] = useState<StudyLanguage | null>(initialStudyLanguage ?? null);
  const studyLanguage = studyLanguageOverride ?? resolveStudyLanguage(learner.preferredLanguage);
  const pageLanguage = view === "lesson" ? studyLanguage : "English";

  useEffect(() => {
    fetch("/api/progress")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        setAuthenticated(Boolean(data.authenticated));
        if (data.learner) setLearner(data.learner);
      })
      .catch(() => setNotice("Progress will reconnect automatically when the service is available."));

    fetch("/api/demo/session")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: DemoStatus) => setDemoStatus(data))
      .catch(() => undefined);
  }, []);

  const activateDemo = async (profile: DemoProfileSummary) => {
    setBusyDemoProfile(profile.id);
    setNotice("");
    try {
      const response = await fetch("/api/demo/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId: profile.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.href = profile.startPath;
    } catch {
      setBusyDemoProfile(null);
      setNotice("The test profile could not be loaded. Please try again.");
    }
  };

  const clearDemo = async () => {
    setBusyDemoProfile("clear");
    setNotice("");
    try {
      const response = await fetch("/api/demo/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to close the demo.");
      window.location.href = "/";
    } catch {
      setBusyDemoProfile(null);
      setNotice("The test profile could not be closed. Please try again.");
    }
  };

  const save = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (response.status === 401) {
        window.location.href = `/sign-in?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return false;
      }
      if (!response.ok) throw new Error(data.error);
      setLearner(data.learner);
      setNotice("Your progress has been saved.");
      return true;
    } catch {
      setNotice("We could not save this update. Please try again.");
      return false;
    } finally { setSaving(false); }
  };

  const join = () => {
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = authenticated
      ? `/onboarding?returnTo=${encodeURIComponent(returnTo)}`
      : `/sign-in?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const changeStudyLanguage = (nextLanguage: StudyLanguage) => {
    setStudyLanguageOverride(nextLanguage);
    const url = new URL(window.location.href);
    url.searchParams.set("language", nextLanguage);
    window.history.replaceState({}, "", url);
  };

  return (
    <div className="site-root" lang={pageLanguage === "Odia" ? "or" : pageLanguage === "Hindi" ? "hi" : "en"}>
      <a className="skip-link" href="#main-content">{headerCopy[pageLanguage].skipContent}</a>
      {demoStatus && (
        <DemoToolbar
          status={demoStatus}
          busyProfile={busyDemoProfile}
          onActivate={activateDemo}
          onClear={clearDemo}
          language={pageLanguage}
        />
      )}
      <Header view={view} learner={learner} authenticated={authenticated} onJoin={join} language={pageLanguage} />
      <div id="main-content">
        {view === "home" && <HomeView learner={learner} onJoin={join} />}
        {view === "library" && <LibraryView initialSearch={initialSearch} />}
        {view === "course" && <CourseView learner={learner} onJoin={join} />}
        {view === "lesson" && <LessonView learner={learner} save={save} saving={saving} onJoin={join} reference={lessonReference} language={studyLanguage} onLanguageChange={changeStudyLanguage} />}
        {view === "assessment" && <AssessmentView learner={learner} save={save} saving={saving} onJoin={join} />}
        {view === "dashboard" && <DashboardView learner={learner} onJoin={join} />}
        {view === "membership" && <MembershipView learner={learner} onJoin={join} />}
        {view === "certificate" && <CertificateView learner={learner} />}
      </div>
      <Footer language={pageLanguage} />
      {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label={headerCopy[pageLanguage].dismissNotice}>×</button></div>}
    </div>
  );
}
