"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { chapters, libraryItems, questions } from "../lib-data";
import { gitaChapters } from "../course/gita/course-data";
import { livingBlissGitaContext } from "../platform/context";
import type { StudyCompanionResponse } from "../ai/contracts";
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

const demoDisplayNames: Record<StudyLanguage, Record<DemoProfileId, string>> = {
  English: { "new-learner": "Ananya Sharma", "active-learner": "Arjun Mehta", "course-completer": "Meera Iyer" },
  Hindi: { "new-learner": "अनन्या शर्मा", "active-learner": "अर्जुन मेहता", "course-completer": "मीरा अय्यर" },
  Odia: { "new-learner": "ଅନନ୍ୟା ଶର୍ମା", "active-learner": "ଅର୍ଜୁନ ମେହେଟା", "course-completer": "ମୀରା ଆୟର" },
};

function localizedLearnerName(name: string, language: StudyLanguage) {
  const profile = Object.entries(demoDisplayNames.English).find(([, englishName]) => englishName === name)?.[0] as DemoProfileId | undefined;
  return profile ? demoDisplayNames[language][profile] : name;
}

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
        <strong>{active ? `${copy.labels[active.id]}: ${demoDisplayNames[language][active.id]}` : copy.experience}</strong>
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
            <small>{demoDisplayNames[language][profile.id]}</small>
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

function Brand({ language = "English" }: { language?: StudyLanguage }) {
  return (
    <Link className={`brand${language === "Odia" ? " brand-odia" : ""}`} href={language === "Odia" ? "/?lang=or" : "/"} aria-label={language === "Odia" ? "ଲିଭିଙ୍ଗ ବ୍ଲିସ୍ ଡିଜିଟାଲ ଗ୍ରନ୍ଥାଗାର ମୁଖ୍ୟ ପୃଷ୍ଠା" : "Living Bliss Digital Library home"}>
      <Image
        className="brand-logo"
        src="/living-bliss-logo-2026.png"
        alt="Living Bliss — Awakening Inner Bliss"
        width={1881}
        height={836}
        priority
      />
      {language === "Odia" && <span className="brand-odia-copy"><strong>ଲିଭିଙ୍ଗ ବ୍ଲିସ୍</strong><small>ଆନ୍ତରିକ ଆନନ୍ଦର ଜାଗରଣ</small></span>}
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
  const learnerName = localizedLearnerName(learner.displayName, language);

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
        <Brand language={language} />
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
              <a className="profile-button" href="/dashboard" aria-label={copy.openDashboard(learnerName)}>
                <span>{learnerName.slice(0, 1).toUpperCase()}</span>
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
    accessibility: "ଡବ୍ଲ୍ୟୁସିଏଜି ୨.୨ ଏଏ ଲକ୍ଷ୍ୟ",
    copyright: "© ୨୦୨୬ ଲିଭିଙ୍ଗ ବ୍ଲିସ୍। ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ।",
    mantra: "ଓଁ ଶ୍ରୀ ଗୁରୁଭ୍ୟୋ ନମଃ · ଓଁ ଶ୍ରୀ ପରମାତ୍ମନେ ନମଃ",
  },
};

function Footer({ language = "English" }: { language?: StudyLanguage }) {
  const copy = footerCopy[language];
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Brand language={language} />
          <p>{copy.description}</p>
        </div>
        <div>
          <strong>{copy.explore}</strong>
          <a href="/library">{copy.scriptureLibrary}</a>
          <a href="/course/gita">{copy.guidedLearning}</a>
          <a href="/membership">{copy.membership}</a>
        </div>
        <div>
          <strong>{language === "Odia" ? "ଲିଭିଙ୍ଗ ବ୍ଲିସ୍" : "Living Bliss"}</strong>
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
        <span>{copy.mantra}</span>
      </div>
    </footer>
  );
}

type GitaPathRecommendation = {
  href: string;
  title: string;
  detail: string;
};

const homeChapterTitles: Record<StudyLanguage, string[]> = {
  English: gitaChapters.map((chapter) => chapter.title),
  Hindi: ["अर्जुन विषाद योग", "सांख्य योग", "कर्म योग", "ज्ञान कर्म संन्यास योग", "कर्म संन्यास योग", "ध्यान योग", "ज्ञान विज्ञान योग", "अक्षर ब्रह्म योग", "राजविद्या राजगुह्य योग", "विभूति योग", "विश्वरूप दर्शन योग", "भक्ति योग", "क्षेत्र क्षेत्रज्ञ विभाग योग", "गुणत्रय विभाग योग", "पुरुषोत्तम योग", "दैवासुर संपद विभाग योग", "श्रद्धात्रय विभाग योग", "मोक्ष संन्यास योग"],
  Odia: ["ଅର୍ଜୁନ ବିଷାଦ ଯୋଗ", "ସାଂଖ୍ୟ ଯୋଗ", "କର୍ମ ଯୋଗ", "ଜ୍ଞାନ କର୍ମ ସନ୍ନ୍ୟାସ ଯୋଗ", "କର୍ମ ସନ୍ନ୍ୟାସ ଯୋଗ", "ଧ୍ୟାନ ଯୋଗ", "ଜ୍ଞାନ ବିଜ୍ଞାନ ଯୋଗ", "ଅକ୍ଷର ବ୍ରହ୍ମ ଯୋଗ", "ରାଜବିଦ୍ୟା ରାଜଗୁହ୍ୟ ଯୋଗ", "ବିଭୂତି ଯୋଗ", "ବିଶ୍ୱରୂପ ଦର୍ଶନ ଯୋଗ", "ଭକ୍ତି ଯୋଗ", "କ୍ଷେତ୍ର କ୍ଷେତ୍ରଜ୍ଞ ବିଭାଗ ଯୋଗ", "ଗୁଣତ୍ରୟ ବିଭାଗ ଯୋଗ", "ପୁରୁଷୋତ୍ତମ ଯୋଗ", "ଦୈବାସୁର ସମ୍ପଦ ବିଭାଗ ଯୋଗ", "ଶ୍ରଦ୍ଧାତ୍ରୟ ବିଭାଗ ଯୋଗ", "ମୋକ୍ଷ ସନ୍ନ୍ୟାସ ଯୋଗ"],
};

const homeCopy = {
  English: {
    eyebrow: "A complete 18-chapter academic study pathway", invocation: "ॐ श्री गुरुभ्यो नमः • ॐ श्री परमात्मने नमः", titlePrimary: "श्रीमद्भगवद्गीता", titleSecondary: "Shreemad Bhagavad Geeta",
    introduction: "Study the complete Sanskrit text in sequence—from Chapter 1, Shloka 1 through Chapter 18—with each shloka presented as a focused lesson.",
    startTag: "Start the course", startTitle: "Begin with the first shloka", startText: "Follow the Gita in its traditional sequence, one calm lesson at a time.", startButton: "Start Chapter 1 · Shloka 1", courseMap: "View all chapters",
    directTag: "Direct navigation", directTitle: "Go to a chapter and shloka", directText: "Choose both values and open exactly the lesson you need.", chapter: "Chapter", shloka: "Shloka", go: "Open selected shloka",
    statChapters: "chapters", statShlokas: "shlokas", statSequence: "traditional sequence", statLocal: "locally stored text",
    guideTag: "Source-grounded learning companion", guideTitle: "Ask Gita Guide", guideText: "Ask where to begin or which part of the course relates to your learning goal.", suggestionsAria: "Suggested learning wishes",
    suggestions: [
      ["I’m completely new", "I am completely new to the Bhagavad Gita. Help me understand its setting and where to begin."],
      ["I want better focus", "I want to understand focus, steadiness and right action when I worry about results."],
      ["I have a difficult decision", "I want to understand duty, moral conflict and how to seek guidance when choices feel difficult."],
      ["Teach me one shloka", "I want to begin with one essential shloka about sincere action and learn its meaning."],
    ],
    questionLabel: "What would you like the Gita to help you understand?", placeholder: "For example: I want help staying focused when results worry me.", privacy: "Please do not include personal details.", ask: "Ask Gita Guide", asking: "Finding your path…", suggested: "Suggested starting point", broader: "A broader starting point may help", openLesson: "Open suggested lesson", essentials: "Begin with Chapter 1", why: "Why this path", guideError: "Gita Guide could not prepare a starting point.", groundedAnswer: "The guide found an approved course starting point for your question.", limitedAnswer: "The approved course material does not yet contain a direct answer. Begin with the suggested foundation lesson.",
    welcome: "Welcome back", continueTitle: "Continue where you left off", readyTitle: "Your learning path is ready", resume: "Resume learning",
  },
  Hindi: {
    eyebrow: "१८ अध्यायों का सम्पूर्ण शैक्षणिक अध्ययन मार्ग", invocation: "ॐ श्री गुरुभ्यो नमः • ॐ श्री परमात्मने नमः", titlePrimary: "श्रीमद्भगवद्गीता", titleSecondary: "श्रीमद्भगवद्गीता अध्ययन",
    introduction: "अध्याय १, श्लोक १ से अध्याय १८ तक सम्पूर्ण संस्कृत पाठ का क्रमिक अध्ययन करें। प्रत्येक श्लोक एक केन्द्रित पाठ के रूप में प्रस्तुत है।",
    startTag: "पाठ्यक्रम आरम्भ करें", startTitle: "पहले श्लोक से आरम्भ करें", startText: "एक समय में एक शान्त पाठ के साथ गीता का पारम्परिक क्रम अपनाएँ।", startButton: "अध्याय १ · श्लोक १ आरम्भ करें", courseMap: "सभी अध्याय देखें",
    directTag: "सीधा मार्गदर्शन", directTitle: "अध्याय और श्लोक पर जाएँ", directText: "दोनों चुनें और आवश्यक पाठ सीधे खोलें।", chapter: "अध्याय", shloka: "श्लोक", go: "चुना हुआ श्लोक खोलें",
    statChapters: "अध्याय", statShlokas: "श्लोक", statSequence: "पारम्परिक क्रम", statLocal: "स्थानीय रूप से संग्रहित पाठ",
    guideTag: "स्रोत-आधारित अध्ययन सहायक", guideTitle: "गीता मार्गदर्शक से पूछें", guideText: "पूछें कि कहाँ से आरम्भ करें या पाठ्यक्रम का कौन-सा भाग आपके अध्ययन लक्ष्य से सम्बन्धित है।", suggestionsAria: "सुझाए गए अध्ययन प्रश्न",
    suggestions: [["मैं बिल्कुल नया हूँ", "I am completely new to the Bhagavad Gita. Help me understand its setting and where to begin."], ["मुझे बेहतर एकाग्रता चाहिए", "I want to understand focus, steadiness and right action when I worry about results."], ["मुझे कठिन निर्णय लेना है", "I want to understand duty, moral conflict and how to seek guidance when choices feel difficult."], ["मुझे एक श्लोक सिखाएँ", "I want to begin with one essential shloka about sincere action and learn its meaning."]],
    questionLabel: "आप गीता से क्या समझना चाहते हैं?", placeholder: "उदाहरण: परिणाम की चिन्ता होने पर मैं एकाग्र कैसे रहूँ?", privacy: "कृपया व्यक्तिगत विवरण न लिखें।", ask: "गीता मार्गदर्शक से पूछें", asking: "मार्ग खोजा जा रहा है…", suggested: "सुझाया गया आरम्भ", broader: "एक व्यापक आरम्भ उपयोगी हो सकता है", openLesson: "सुझाया गया पाठ खोलें", essentials: "अध्याय १ से आरम्भ करें", why: "इस मार्ग का कारण", guideError: "गीता मार्गदर्शक अभी आरम्भ बिन्दु तैयार नहीं कर सका।", groundedAnswer: "मार्गदर्शक ने आपके प्रश्न के लिए अनुमोदित पाठ्यक्रम से आरम्भ बिन्दु खोजा है।", limitedAnswer: "अनुमोदित सामग्री में अभी सीधा उत्तर उपलब्ध नहीं है। सुझाए गए आधार पाठ से आरम्भ करें।",
    welcome: "पुनः स्वागत", continueTitle: "जहाँ छोड़ा था वहीं से जारी रखें", readyTitle: "आपका अध्ययन मार्ग तैयार है", resume: "अध्ययन जारी रखें",
  },
  Odia: {
    eyebrow: "୧୮ଟି ଅଧ୍ୟାୟର ସମ୍ପୂର୍ଣ୍ଣ ଶିକ୍ଷାମୂଳକ ଅଧ୍ୟୟନ ପଥ", invocation: "ଓଁ ଶ୍ରୀ ଗୁରୁଭ୍ୟୋ ନମଃ • ଓଁ ଶ୍ରୀ ପରମାତ୍ମନେ ନମଃ", titlePrimary: "ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତା", titleSecondary: "ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତା ଅଧ୍ୟୟନ",
    introduction: "ଅଧ୍ୟାୟ ୧, ଶ୍ଲୋକ ୧ରୁ ଅଧ୍ୟାୟ ୧୮ ପର୍ଯ୍ୟନ୍ତ ସମ୍ପୂର୍ଣ୍ଣ ସଂସ୍କୃତ ପାଠକୁ କ୍ରମାନୁସାରେ ଅଧ୍ୟୟନ କରନ୍ତୁ। ପ୍ରତ୍ୟେକ ଶ୍ଲୋକ ଏକ ସ୍ୱତନ୍ତ୍ର ପାଠ।",
    startTag: "ପାଠ୍ୟକ୍ରମ ଆରମ୍ଭ କରନ୍ତୁ", startTitle: "ପ୍ରଥମ ଶ୍ଲୋକରୁ ଆରମ୍ଭ କରନ୍ତୁ", startText: "ଗୋଟିଏ ପରେ ଗୋଟିଏ ସରଳ ପାଠ ସହିତ ଗୀତାର ପାରମ୍ପରିକ କ୍ରମ ଅନୁସରଣ କରନ୍ତୁ।", startButton: "ଅଧ୍ୟାୟ ୧ · ଶ୍ଲୋକ ୧ ଆରମ୍ଭ କରନ୍ତୁ", courseMap: "ସମସ୍ତ ଅଧ୍ୟାୟ ଦେଖନ୍ତୁ",
    directTag: "ସିଧାସଳଖ ମାର୍ଗଦର୍ଶନ", directTitle: "ଅଧ୍ୟାୟ ଓ ଶ୍ଲୋକକୁ ଯାଆନ୍ତୁ", directText: "ଉଭୟକୁ ବାଛନ୍ତୁ ଏବଂ ଆବଶ୍ୟକ ପାଠଟି ସିଧାସଳଖ ଖୋଲନ୍ତୁ।", chapter: "ଅଧ୍ୟାୟ", shloka: "ଶ୍ଲୋକ", go: "ଚୟନିତ ଶ୍ଲୋକ ଖୋଲନ୍ତୁ",
    statChapters: "ଅଧ୍ୟାୟ", statShlokas: "ଶ୍ଲୋକ", statSequence: "ପାରମ୍ପରିକ କ୍ରମ", statLocal: "ସ୍ଥାନୀୟ ଭାବେ ସଂରକ୍ଷିତ ପାଠ",
    guideTag: "ଉତ୍ସ-ଆଧାରିତ ଅଧ୍ୟୟନ ସହାୟକ", guideTitle: "ଗୀତା ମାର୍ଗଦର୍ଶକଙ୍କୁ ପଚାରନ୍ତୁ", guideText: "କେଉଁଠାରୁ ଆରମ୍ଭ କରିବେ କିମ୍ବା ପାଠ୍ୟକ୍ରମର କେଉଁ ଅଂଶ ଆପଣଙ୍କ ଅଧ୍ୟୟନ ଲକ୍ଷ୍ୟ ସହ ସମ୍ବନ୍ଧିତ, ତାହା ପଚାରନ୍ତୁ।", suggestionsAria: "ପ୍ରସ୍ତାବିତ ଅଧ୍ୟୟନ ପ୍ରଶ୍ନ",
    suggestions: [["ମୁଁ ସମ୍ପୂର୍ଣ୍ଣ ନୂଆ", "I am completely new to the Bhagavad Gita. Help me understand its setting and where to begin."], ["ମୋତେ ଅଧିକ ଏକାଗ୍ରତା ଦରକାର", "I want to understand focus, steadiness and right action when I worry about results."], ["ମୋତେ ଏକ କଠିନ ନିଷ୍ପତ୍ତି ନେବାକୁ ହେବ", "I want to understand duty, moral conflict and how to seek guidance when choices feel difficult."], ["ମୋତେ ଗୋଟିଏ ଶ୍ଲୋକ ଶିଖାନ୍ତୁ", "I want to begin with one essential shloka about sincere action and learn its meaning."]],
    questionLabel: "ଗୀତାରୁ ଆପଣ କ’ଣ ବୁଝିବାକୁ ଚାହାନ୍ତି?", placeholder: "ଉଦାହରଣ: ଫଳ ବିଷୟରେ ଚିନ୍ତା ହେଲେ ମୁଁ କିପରି ଏକାଗ୍ର ରହିବି?", privacy: "ଦୟାକରି ବ୍ୟକ୍ତିଗତ ବିବରଣୀ ଲେଖନ୍ତୁ ନାହିଁ।", ask: "ଗୀତା ମାର୍ଗଦର୍ଶକଙ୍କୁ ପଚାରନ୍ତୁ", asking: "ଅଧ୍ୟୟନ ପଥ ଖୋଜାଯାଉଛି…", suggested: "ପ୍ରସ୍ତାବିତ ଆରମ୍ଭ", broader: "ଏକ ବ୍ୟାପକ ଆରମ୍ଭ ଉପଯୋଗୀ ହୋଇପାରେ", openLesson: "ପ୍ରସ୍ତାବିତ ପାଠ ଖୋଲନ୍ତୁ", essentials: "ଅଧ୍ୟାୟ ୧ରୁ ଆରମ୍ଭ କରନ୍ତୁ", why: "ଏହି ପଥର କାରଣ", guideError: "ଗୀତା ମାର୍ଗଦର୍ଶକ ବର୍ତ୍ତମାନ ଆରମ୍ଭ ବିନ୍ଦୁ ପ୍ରସ୍ତୁତ କରିପାରିଲେ ନାହିଁ।", groundedAnswer: "ମାର୍ଗଦର୍ଶକ ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପାଇଁ ଅନୁମୋଦିତ ପାଠ୍ୟକ୍ରମରୁ ଏକ ଆରମ୍ଭ ବିନ୍ଦୁ ପାଇଛନ୍ତି।", limitedAnswer: "ଅନୁମୋଦିତ ପାଠ୍ୟସାମଗ୍ରୀରେ ବର୍ତ୍ତମାନ ସିଧାସଳଖ ଉତ୍ତର ନାହିଁ। ପ୍ରସ୍ତାବିତ ମୂଳ ପାଠରୁ ଆରମ୍ଭ କରନ୍ତୁ।",
    welcome: "ପୁଣି ସ୍ୱାଗତ", continueTitle: "ଯେଉଁଠାରେ ଛାଡ଼ିଥିଲେ ସେଠାରୁ ଜାରି ରଖନ୍ତୁ", readyTitle: "ଆପଣଙ୍କ ଅଧ୍ୟୟନ ପଥ ପ୍ରସ୍ତୁତ", resume: "ଅଧ୍ୟୟନ ଜାରି ରଖନ୍ତୁ",
  },
} as const;

function homeLanguageCode(language: StudyLanguage) {
  return language === "Odia" ? "or" : language === "Hindi" ? "hi" : "en";
}

function homeChapterTitle(chapterNumber: number, language: StudyLanguage) {
  return homeChapterTitles[language][chapterNumber - 1] ?? gitaChapters[chapterNumber - 1]?.title ?? "";
}

function enrichPathfinderQuestion(question: string) {
  const value = question.toLocaleLowerCase("en");
  const signals: string[] = [];

  if (/(new|begin|start|intro|setting)/.test(value)) signals.push("setting moral conflict guidance Chapter 1");
  if (/(focus|attention|result|worry|exam|stress|steady)/.test(value)) signals.push("steadiness right action fear of results Chapter 2");
  if (/(decision|duty|conflict|choice|confus)/.test(value)) signals.push("duty relationship consequence moral conflict guidance Chapter 1");
  if (/(work|action|study|discipline|procrast)/.test(value)) signals.push("daily work disciplined service action attachment Chapter 3");
  if (/(meditat|mind|balance)/.test(value)) signals.push("discipline of mind meditation balance Chapter 6");
  if (/(devotion|bhakti|compassion|kindness)/.test(value)) signals.push("qualities practices devotion compassion Chapter 12");
  if (/(surrender|freedom|purpose|fear)/.test(value)) signals.push("integration surrender freedom final counsel Chapter 18");
  if (/(shloka|verse|sincere action)/.test(value)) signals.push("2.47 right action sincere action results");

  return signals.length ? `${question}\n\nLearning-path signals: ${signals.join("; ")}` : question;
}

function recommendationFrom(response: StudyCompanionResponse, language: StudyLanguage): GitaPathRecommendation | null {
  const citation = response.citations[0];
  if (!citation) return null;
  const languageCode = homeLanguageCode(language);
  const labels = homeCopy[language];

  const shlokaMatch = citation.id.match(/^shloka-(\d+)-(\d+)$/);
  if (shlokaMatch) {
    const reference = `${shlokaMatch[1]}.${shlokaMatch[2]}`;
    return {
      href: `/course/gita/chapter/${shlokaMatch[1]}/shloka/${shlokaMatch[2]}?lang=${languageCode}`,
      title: `${labels.shloka} ${localizeStudyDigits(reference, language)}`,
      detail: language === "English" ? citation.title : homeChapterTitle(Number(shlokaMatch[1]), language),
    };
  }

  const chapterMatch = citation.id.match(/^curriculum-gita-(\d+)$/);
  if (chapterMatch) {
    const chapterNumber = Number(chapterMatch[1]);
    return {
      href: `/course/gita/chapter/${chapterNumber}/shloka/1?lang=${languageCode}`,
      title: `${labels.chapter} ${localizeStudyDigits(chapterNumber, language)} · ${homeChapterTitle(chapterNumber, language)}`,
      detail: language === "English" ? citation.title : homeChapterTitle(chapterNumber, language),
    };
  }

  return null;
}

function HomeView({ learner, language }: { learner: Learner; onJoin: () => void; language: StudyLanguage }) {
  const [pathQuestion, setPathQuestion] = useState("");
  const [pathResponse, setPathResponse] = useState<StudyCompanionResponse | null>(null);
  const [pathRecommendation, setPathRecommendation] = useState<GitaPathRecommendation | null>(null);
  const [pathError, setPathError] = useState("");
  const [pathLoading, setPathLoading] = useState(false);
  const [jumpChapter, setJumpChapter] = useState(1);
  const [jumpShloka, setJumpShloka] = useState(1);
  const copy = homeCopy[language];
  const languageCode = homeLanguageCode(language);
  const selectedChapter = gitaChapters[jumpChapter - 1] ?? gitaChapters[0];
  const chapterStudyComplete = chapterTwoStudyComplete(learner);
  const nextLearningHref = learner.completedLessons.length ? nextChapterTwoHref(learner) : "/course/gita";

  const askGuide = async (value: string) => {
    const question = value.trim();
    if (question.length < 3 || pathLoading) return;
    setPathQuestion(question);
    setPathLoading(true);
    setPathError("");
    setPathResponse(null);
    setPathRecommendation(null);

    try {
      const result = await fetch("/api/ai/study-companion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: enrichPathfinderQuestion(question),
          tenantId: livingBlissGitaContext.tenantId,
          programmeId: livingBlissGitaContext.programmeId,
          editionId: livingBlissGitaContext.editionId,
          language: languageCode,
        }),
      });
      const body = (await result.json()) as StudyCompanionResponse & { error?: string };
      if (!result.ok) throw new Error(copy.guideError);
      setPathResponse(body);
      setPathRecommendation(recommendationFrom(body, language));
    } catch {
      setPathError(copy.guideError);
    } finally {
      setPathLoading(false);
    }
  };

  const submitPathQuestion = (event: FormEvent) => {
    event.preventDefault();
    void askGuide(pathQuestion);
  };

  const submitJump = (event: FormEvent) => {
    event.preventDefault();
    window.location.href = `/course/gita/chapter/${jumpChapter}/shloka/${jumpShloka}?lang=${languageCode}`;
  };

  return (
    <>
      <section className={`gita-course-start language-${languageCode}`} aria-labelledby="gita-entry-title">
        <div className="gita-course-art" aria-hidden="true" />
        <div className="gita-course-art-shade" />
        <div className="page-shell gita-course-start-grid">
          <div className="gita-course-intro">
            <p className="gita-hero-invocation" lang={language === "Odia" ? "sa-Orya" : "sa-Deva"}>{copy.invocation}</p>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1 id="gita-entry-title">
              <span lang={language === "Odia" ? "sa-Orya" : "sa-Deva"}>{copy.titlePrimary}</span>
              <small>{copy.titleSecondary}</small>
            </h1>
            <p>{copy.introduction}</p>
            <article className="gita-start-card">
              <span>{copy.startTag}</span>
              <h2>{copy.startTitle}</h2>
              <p>{copy.startText}</p>
              <div>
                <Link className="button saffron" href={`/course/gita/chapter/1/shloka/1?lang=${languageCode}`}>{copy.startButton} <span aria-hidden="true">→</span></Link>
              </div>
            </article>
          </div>

          <aside className="gita-home-jump" aria-labelledby="gita-home-jump-title">
            <span className="eyebrow">{copy.directTag}</span>
            <h2 id="gita-home-jump-title">{copy.directTitle}</h2>
            <p>{copy.directText}</p>
            <form onSubmit={submitJump}>
              <label htmlFor="home-gita-chapter">{copy.chapter}</label>
              <select id="home-gita-chapter" value={jumpChapter} onChange={(event) => { setJumpChapter(Number(event.target.value)); setJumpShloka(1); }}>
                {gitaChapters.map((chapter) => <option key={chapter.number} value={chapter.number}>{localizeStudyDigits(chapter.number, language)} · {homeChapterTitle(chapter.number, language)}</option>)}
              </select>
              <label htmlFor="home-gita-shloka">{copy.shloka}</label>
              <select id="home-gita-shloka" value={jumpShloka} onChange={(event) => setJumpShloka(Number(event.target.value))}>
                {Array.from({ length: selectedChapter.verseCount }, (_, index) => index + 1).map((number) => <option key={number} value={number}>{copy.shloka} {localizeStudyDigits(number, language)}</option>)}
              </select>
              <button className="button primary wide" type="submit">{copy.go} <span aria-hidden="true">→</span></button>
            </form>
          </aside>
        </div>
      </section>

      <div className="gita-course-facts" aria-label={copy.eyebrow}>
        <span><strong>{localizeStudyDigits(18, language)}</strong>{copy.statChapters}</span>
        <span><strong>{localizeStudyDigits(701, language)}</strong>{copy.statShlokas}</span>
        <span><strong>✓</strong>{copy.statSequence}</span>
        <span><strong>✓</strong>{copy.statLocal}</span>
      </div>

      {learner.memberJoined && (
        <section className="resume-band">
          <div className="page-shell resume-inner">
            <div>
              <span className="eyebrow">{copy.welcome}, {localizedLearnerName(learner.displayName, language)}</span>
              <h2>{learner.completedLessons.length ? copy.continueTitle : copy.readyTitle}</h2>
              <p>{copy.chapter} {localizeStudyDigits(chapterStudyComplete ? 2 : 1, language)} · {copy.shloka}</p>
            </div>
            <a className="button primary" href={`${nextLearningHref}${nextLearningHref.includes("?") ? "&" : "?"}lang=${languageCode}`}>{copy.resume}</a>
          </div>
        </section>
      )}

      <section className={`gita-guide-section language-${languageCode}`} aria-labelledby="gita-guide-title">
        <div className="page-shell gita-guide-layout">
          <div className="gita-guide-heading">
            <span className="eyebrow">{copy.guideTag}</span>
            <h2 id="gita-guide-title">{copy.guideTitle}</h2>
            <p>{copy.guideText}</p>
          </div>
          <article className="gita-entry-card ai-path-card gita-guide-card">
            <div className="gita-pathfinder-suggestions" aria-label={copy.suggestionsAria}>
              {copy.suggestions.map(([label, question]) => (
                <button key={label} type="button" onClick={() => void askGuide(question)} disabled={pathLoading}>{label}</button>
              ))}
            </div>
            <form className="gita-pathfinder-form" onSubmit={submitPathQuestion}>
              <label htmlFor="gita-path-question">{copy.questionLabel}</label>
              <textarea id="gita-path-question" value={pathQuestion} onChange={(event) => setPathQuestion(event.target.value)} maxLength={300} rows={3} placeholder={copy.placeholder} />
              <div><small>{localizeStudyDigits(pathQuestion.length, language)}/{localizeStudyDigits(300, language)} · {copy.privacy}</small><button type="submit" disabled={pathLoading || pathQuestion.trim().length < 3}>{pathLoading ? copy.asking : copy.ask}</button></div>
            </form>
            {pathError && <p className="gita-pathfinder-error" role="alert">{pathError}</p>}
            {pathResponse && (
              <section className={`gita-pathfinder-result ${pathResponse.grounded ? "grounded" : "limited"}`} aria-live="polite">
                <span>{pathResponse.grounded ? `✓ ${copy.suggested}` : copy.broader}</span>
                <h3>{pathRecommendation?.title || copy.essentials}</h3>
                <p>{language === "English" ? pathResponse.answer : pathResponse.grounded ? copy.groundedAnswer : copy.limitedAnswer}</p>
                {pathRecommendation && <small>{copy.why}: {pathRecommendation.detail}</small>}
                <a className="button saffron wide" href={pathRecommendation?.href || `/course/gita/chapter/1/shloka/1?lang=${languageCode}`}>{pathRecommendation ? copy.openLesson : copy.essentials} <span aria-hidden="true">→</span></a>
              </section>
            )}
          </article>
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
  const pageLanguage = view === "lesson" || view === "home" || view === "course" ? studyLanguage : "English";

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
        {(view === "home" || view === "course") && <HomeView learner={learner} onJoin={join} language={pageLanguage} />}
        {view === "library" && <LibraryView initialSearch={initialSearch} />}
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
