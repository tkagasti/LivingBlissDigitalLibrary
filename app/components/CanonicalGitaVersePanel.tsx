"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type StudyLanguage = "en" | "hi" | "or";

type WordGloss = { term: string; meaning: string };

type LocalizedContent = {
  wordGlosses: WordGloss[];
  translation: { text: string; translator: string | null; sourceLocator: string | null } | null;
};

type Commentary = {
  id: string;
  commentatorName: string;
  tradition: string;
  editionTitle: string;
  versionLabel: string;
  text: string;
  scriptCode: "Deva" | "Orya";
  editorialStatus: string;
};

type CanonicalGitaVersePanelProps = {
  reference: string;
  devanagari: string;
  odia: string;
  transliteration: string;
  localizedContent: Record<StudyLanguage, LocalizedContent>;
  commentaries: Commentary[];
  language: StudyLanguage;
  order: number;
  totalVerses: number;
  sourceUrl: string | null;
};

const languageOptions: Array<{ code: StudyLanguage; speech: string }> = [
  { code: "en", speech: "en-IN" },
  { code: "hi", speech: "hi-IN" },
  { code: "or", speech: "or-IN" },
];

const languageNames: Record<StudyLanguage, Record<StudyLanguage, string>> = {
  en: { en: "English", hi: "Hindi", or: "Odia" },
  hi: { en: "अंग्रेज़ी", hi: "हिन्दी", or: "ओड़िया" },
  or: { en: "ଇଂରାଜୀ", hi: "ହିନ୍ଦୀ", or: "ଓଡ଼ିଆ" },
};

const copy = {
  en: {
    selectedLanguage: "Selected language", selectLanguage: "Select the study language", read: "Read shloka and meanings", stop: "Stop reading", reading: "Reading aloud",
    readUnavailable: "Read-aloud is not available in this browser or device.", voiceUnavailable: "A suitable Sanskrit or study-language voice is not installed on this device.",
    scripture: "Shloka · Devanagari", roman: "Shloka · Roman transliteration", sandhi: "Sandhi-vicheda",
    separationPending: "Reference word separation is awaiting editorial review.", reviewStatus: "Review status",
    sandhiNote: "The source token sequence is shown in Roman transliteration. A scholar-reviewed Devanagari sandhi-vicheda will replace it.",
    meanings: "Meaning of each word", romanForm: "Romanised Sanskrit form", sourceGloss: "Source gloss", englishGloss: "English source gloss", sourceForm: "source form",
    meaningsPending: "Word-by-word meanings are awaiting editorial review for this shloka.",
    fallback: "Approved meanings are not yet available in this language. The English source glosses are shown as a clearly labelled reference.",
    translation: "Translation", translationPending: "Approved English translation pending",
    translationPolicy: "This layer is reserved for a named translator, edition, source locator and publication approval. No unattributed translation is presented as authoritative.",
    commentary: "Bhāṣya · Commentary", selectCommentator: "Select bhāṣyakāra or guru", tradition: "Commentarial tradition", editorialStatus: "Editorial status",
    draftStatus: "Draft Sanskrit text · scholarly review pending", edition: "Edition",
    localEdition: "Living Bliss Sanskrit draft edition",
    noCommentary: "No approved commentary passage is linked to this shloka yet. This section is ready for a licensed text or reviewed summary with full attribution.",
    governance: "Commentary remains separate from the Sanskrit source and shows commentator, tradition, edition, rights and version details. Approved passages are stored and served by Living Bliss.",
    academicRecord: "Academic record", coursePosition: "Course position", storage: "Content storage", database: "Living Bliss database",
    reviewNote: "Sanskrit text, transliteration and source glosses are edition-labelled. Translation, Devanagari sandhi analysis and bhāṣya remain protected review layers.",
  },
  hi: {
    selectedLanguage: "चयनित भाषा", selectLanguage: "अध्ययन की भाषा चुनें", read: "श्लोक और शब्दार्थ सुनें", stop: "सुनना रोकें", reading: "पाठ सुनाया जा रहा है",
    readUnavailable: "इस ब्राउज़र या उपकरण में श्रव्य-पाठ उपलब्ध नहीं है।", voiceUnavailable: "इस उपकरण में उपयुक्त संस्कृत या हिन्दी वाणी उपलब्ध नहीं है।",
    scripture: "श्लोक · देवनागरी", roman: "श्लोक · रोमन लिप्यंतरण", sandhi: "सन्धि-विच्छेद",
    separationPending: "सन्दर्भ शब्द-विभाजन सम्पादकीय समीक्षा की प्रतीक्षा में है।", reviewStatus: "समीक्षा स्थिति",
    sandhiNote: "विद्वत्-समीक्षित सन्धि-विच्छेद उपलब्ध होने पर उसे इसी लिपि में यहाँ प्रस्तुत किया जाएगा।",
    meanings: "प्रत्येक शब्द का अर्थ", romanForm: "रोमन लिप्यंतरित संस्कृत रूप", sourceGloss: "स्रोत शब्दार्थ", englishGloss: "अंग्रेज़ी स्रोत शब्दार्थ", sourceForm: "स्रोत रूप",
    meaningsPending: "इस श्लोक के शब्दार्थ सम्पादकीय समीक्षा की प्रतीक्षा में हैं।",
    fallback: "इस भाषा में अनुमोदित शब्दार्थ अभी उपलब्ध नहीं हैं। अंग्रेज़ी स्रोत शब्दार्थ स्पष्ट सन्दर्भ के रूप में दिखाए गए हैं।",
    translation: "अनुवाद", translationPending: "अनुमोदित हिन्दी अनुवाद प्रतीक्षित",
    translationPolicy: "यह स्तर नामित अनुवादक, संस्करण, स्रोत-सन्दर्भ और प्रकाशन-अनुमोदन के लिए सुरक्षित है। कोई अनाम अनुवाद प्रामाणिक रूप में प्रस्तुत नहीं किया जाता।",
    commentary: "भाष्य · टीका", selectCommentator: "भाष्यकार या गुरु चुनें", tradition: "भाष्य परम्परा", editorialStatus: "सम्पादकीय स्थिति",
    draftStatus: "प्रारूप संस्कृत पाठ · विद्वत् समीक्षा अपेक्षित", edition: "संस्करण",
    localEdition: "लिविंग ब्लिस संस्कृत प्रारूप संस्करण",
    noCommentary: "इस श्लोक से अभी कोई अनुमोदित भाष्य जुड़ा नहीं है। यह भाग पूर्ण स्रोत-सन्दर्भ सहित अधिकृत पाठ या समीक्षित सार के लिए तैयार है।",
    governance: "भाष्य संस्कृत मूल से अलग रहता है और भाष्यकार, परम्परा, संस्करण, अधिकार तथा संस्करण-विवरण दिखाता है। अनुमोदित सामग्री Living Bliss द्वारा संग्रहित और प्रस्तुत की जाती है।",
    academicRecord: "शैक्षणिक अभिलेख", coursePosition: "पाठ्यक्रम स्थान", storage: "सामग्री संग्रह", database: "Living Bliss डेटाबेस",
    reviewNote: "संस्कृत पाठ, लिप्यंतरण और स्रोत शब्दार्थ संस्करण सहित सुरक्षित हैं। अनुवाद, देवनागरी सन्धि-विच्छेद और भाष्य संरक्षित समीक्षा स्तर बने रहते हैं।",
  },
  or: {
    selectedLanguage: "ଚୟନିତ ଭାଷା", selectLanguage: "ଅଧ୍ୟୟନ ଭାଷା ବାଛନ୍ତୁ", read: "ଶ୍ଲୋକ ଓ ଶବ୍ଦାର୍ଥ ଶୁଣନ୍ତୁ", stop: "ଶୁଣିବା ବନ୍ଦ କରନ୍ତୁ", reading: "ପାଠ ଶୁଣାଯାଉଛି",
    readUnavailable: "ଏହି ବ୍ରାଉଜର କିମ୍ବା ଉପକରଣରେ ଶ୍ରବ୍ୟ ପାଠ ଉପଲବ୍ଧ ନାହିଁ।", voiceUnavailable: "ଏହି ଉପକରଣରେ ଉପଯୁକ୍ତ ସଂସ୍କୃତ କିମ୍ବା ଓଡ଼ିଆ କଣ୍ଠସ୍ୱର ଉପଲବ୍ଧ ନାହିଁ।",
    scripture: "ଶ୍ଲୋକ · ଓଡ଼ିଆ ଲିପି", roman: "ଶ୍ଲୋକ · ରୋମାନ୍ ଲିପ୍ୟନ୍ତରଣ", sandhi: "ସନ୍ଧି-ବିଚ୍ଛେଦ",
    separationPending: "ସନ୍ଦର୍ଭ ଶବ୍ଦ ବିଭାଜନ ସମ୍ପାଦକୀୟ ସମୀକ୍ଷା ପାଇଁ ଅପେକ୍ଷାରତ।", reviewStatus: "ସମୀକ୍ଷା ସ୍ଥିତି",
    sandhiNote: "ବିଦ୍ୱତ୍-ସମୀକ୍ଷିତ ସନ୍ଧି-ବିଚ୍ଛେଦ ଉପଲବ୍ଧ ହେଲେ ତାହାକୁ ଏହି ଲିପିରେ ଏଠାରେ ଦର୍ଶାଯିବ।",
    meanings: "ପ୍ରତ୍ୟେକ ଶବ୍ଦର ଅର୍ଥ", romanForm: "ରୋମାନ୍ ଲିପ୍ୟନ୍ତରିତ ସଂସ୍କୃତ ରୂପ", sourceGloss: "ଉତ୍ସ ଶବ୍ଦାର୍ଥ", englishGloss: "ଇଂରାଜୀ ଉତ୍ସ ଶବ୍ଦାର୍ଥ", sourceForm: "ଉତ୍ସ ରୂପ",
    meaningsPending: "ଏହି ଶ୍ଲୋକର ଶବ୍ଦାର୍ଥ ସମ୍ପାଦକୀୟ ସମୀକ୍ଷା ପାଇଁ ଅପେକ୍ଷାରତ।",
    fallback: "ଏହି ଭାଷାରେ ଅନୁମୋଦିତ ଶବ୍ଦାର୍ଥ ଏପର୍ଯ୍ୟନ୍ତ ଉପଲବ୍ଧ ନାହିଁ। ଇଂରାଜୀ ଉତ୍ସ ଶବ୍ଦାର୍ଥ ସ୍ପଷ୍ଟ ସନ୍ଦର୍ଭ ଭାବେ ଦର୍ଶାଯାଇଛି।",
    translation: "ଅନୁବାଦ", translationPending: "ଅନୁମୋଦିତ ଓଡ଼ିଆ ଅନୁବାଦ ଅପେକ୍ଷାରତ",
    translationPolicy: "ଏହି ସ୍ତର ନାମିତ ଅନୁବାଦକ, ସଂସ୍କରଣ, ଉତ୍ସ-ସନ୍ଦର୍ଭ ଏବଂ ପ୍ରକାଶନ ଅନୁମୋଦନ ପାଇଁ ସଂରକ୍ଷିତ। କୌଣସି ଅନାମିତ ଅନୁବାଦକୁ ପ୍ରାମାଣିକ ଭାବେ ଦର୍ଶାଯାଏ ନାହିଁ।",
    commentary: "ଭାଷ୍ୟ · ଟୀକା", selectCommentator: "ଭାଷ୍ୟକାର କିମ୍ବା ଗୁରୁ ବାଛନ୍ତୁ", tradition: "ଭାଷ୍ୟ ପରମ୍ପରା", editorialStatus: "ସମ୍ପାଦକୀୟ ସ୍ଥିତି",
    draftStatus: "ପ୍ରାରୂପ ସଂସ୍କୃତ ପାଠ · ବିଦ୍ୱତ୍ ସମୀକ୍ଷା ଅପେକ୍ଷାରତ", edition: "ସଂସ୍କରଣ",
    localEdition: "ଲିଭିଙ୍ଗ ବ୍ଲିସ୍ ସଂସ୍କୃତ ପ୍ରାରୂପ ସଂସ୍କରଣ",
    noCommentary: "ଏହି ଶ୍ଲୋକ ସହ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଅନୁମୋଦିତ ଭାଷ୍ୟ ସଂଯୁକ୍ତ ହୋଇନାହିଁ। ପୂର୍ଣ୍ଣ ଉତ୍ସ-ସନ୍ଦର୍ଭ ସହ ଅଧିକୃତ ପାଠ କିମ୍ବା ସମୀକ୍ଷିତ ସାରାଂଶ ପାଇଁ ଏହି ଭାଗ ପ୍ରସ୍ତୁତ।",
    governance: "ଭାଷ୍ୟ ସଂସ୍କୃତ ମୂଳ ପାଠରୁ ପୃଥକ ରହେ ଏବଂ ଭାଷ୍ୟକାର, ପରମ୍ପରା, ସଂସ୍କରଣ, ଅଧିକାର ଓ ସଂସ୍କରଣ ବିବରଣୀ ଦର୍ଶାଏ। ଅନୁମୋଦିତ ବିଷୟବସ୍ତୁ ଲିଭିଙ୍ଗ ବ୍ଲିସ୍ ଦ୍ୱାରା ସଂରକ୍ଷିତ ଓ ପରିବେଷିତ ହୁଏ।",
    academicRecord: "ଶିକ୍ଷାଗତ ଅଭିଲେଖ", coursePosition: "ପାଠ୍ୟକ୍ରମ ସ୍ଥାନ", storage: "ବିଷୟବସ୍ତୁ ସଂରକ୍ଷଣ", database: "ଲିଭିଙ୍ଗ ବ୍ଲିସ୍ ଡାଟାବେସ୍",
    reviewNote: "ସଂସ୍କୃତ ପାଠ, ଲିପ୍ୟନ୍ତରଣ ଏବଂ ଉତ୍ସ ଶବ୍ଦାର୍ଥ ସଂସ୍କରଣ ସହ ସଂରକ୍ଷିତ। ଅନୁବାଦ, ଦେବନାଗରୀ ସନ୍ଧି-ବିଚ୍ଛେଦ ଓ ଭାଷ୍ୟ ସୁରକ୍ଷିତ ସମୀକ୍ଷା ସ୍ତର ଭାବେ ରହିଛି।",
  },
} as const;

function localizeDigits(value: string | number, language: StudyLanguage) {
  const digits = language === "or" ? "୦୧୨୩୪୫୬୭୮୯" : language === "hi" ? "०१२३४५६७८९" : "0123456789";
  return String(value).replace(/[0-9]/gu, (digit) => digits[Number(digit)]);
}

function StepHeading({ number, children, id }: { number: string; children: string; id: string }) {
  return <div className="compact-step-heading"><span>{number}</span><h2 id={id}>{children}</h2></div>;
}

export default function CanonicalGitaVersePanel({ reference, devanagari, odia, transliteration, localizedContent, commentaries, language, order, totalVerses }: CanonicalGitaVersePanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedCommentaryId, setSelectedCommentaryId] = useState(commentaries[0]?.id ?? "");
  const [isReading, setIsReading] = useState(false);
  const [speechNotice, setSpeechNotice] = useState("");
  const labels = copy[language];
  const selectedLanguageOption = languageOptions.find((item) => item.code === language) ?? languageOptions[0];
  const selectedContent = localizedContent[language];
  const displayedGlosses = selectedContent.wordGlosses;
  const sourceWords = language === "en" ? localizedContent.en.wordGlosses : selectedContent.wordGlosses;
  const displayedScripture = language === "or" ? odia : devanagari;
  const displayedScriptureLanguage = language === "or" ? "sa-Orya" : "sa-Deva";
  const displayedCommentary = commentaries.find((item) => item.id === selectedCommentaryId) ?? commentaries[0];

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const chooseLanguage = (language: StudyLanguage) => {
    window.speechSynthesis?.cancel();
    setIsReading(false);
    setSpeechNotice("");
    void fetch("/api/preferences/gita-language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    });
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", language);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const stopReading = () => {
    window.speechSynthesis?.cancel();
    setIsReading(false);
  };

  const readAloud = () => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setSpeechNotice(labels.readUnavailable);
      return;
    }
    if (isReading) return stopReading();

    window.speechSynthesis.cancel();
    setSpeechNotice("");
    const scripture = new SpeechSynthesisUtterance(displayedScripture.replaceAll("\n", " "));
    scripture.lang = language === "or" ? "or-IN" : "sa-IN";
    scripture.rate = 0.78;

    const spokenGlosses = selectedContent.wordGlosses;
    const meanings = new SpeechSynthesisUtterance(spokenGlosses.length ? spokenGlosses.map((word) => `${word.term}, ${word.meaning}`).join(". ") : labels.meaningsPending);
    meanings.lang = selectedLanguageOption.speech;
    meanings.rate = 0.9;
    meanings.onend = () => setIsReading(false);
    meanings.onerror = (event) => {
      setIsReading(false);
      if (event.error !== "canceled" && event.error !== "interrupted") setSpeechNotice(labels.voiceUnavailable);
    };

    window.speechSynthesis.speak(scripture);
    window.speechSynthesis.speak(meanings);
    setIsReading(true);
  };

  return (
    <article className={`verse-panel shloka-study-panel compact canonical-gita-panel language-${language}`} lang={language} aria-label={`${labels.scripture} ${localizeDigits(reference, language)}`}>
      <div className="shloka-preference-bar">
        <div><span>{labels.selectedLanguage}</span><strong>{languageNames[language][language]}</strong></div>
        <div className="shloka-preference-actions">
          <button className={`read-aloud-button${isReading ? " active" : ""}`} type="button" onClick={readAloud} aria-pressed={isReading}>
            <span aria-hidden="true">{isReading ? "■" : "▶"}</span><span>{isReading ? labels.stop : labels.read}</span>
          </button>
          <div className="shloka-language-options" role="group" aria-label={labels.selectLanguage}>
            {languageOptions.map((option) => <button key={option.code} type="button" onClick={() => chooseLanguage(option.code)} aria-pressed={language === option.code}>{languageNames[language][option.code]}</button>)}
          </div>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">{isReading ? labels.reading : speechNotice}</span>
      {speechNotice && <p className="speech-notice" role="status">{speechNotice}</p>}

      <div className="shloka-compact-body">
        <div className={`shloka-text-pair${language !== "en" ? " single-script" : ""}`}>
          <section className="compact-study-card devanagari-card" aria-labelledby={`scripture-${reference}`}>
            <StepHeading number={localizeDigits("01", language)} id={`scripture-${reference}`}>{labels.scripture}</StepHeading>
            <p className="compact-shloka devanagari" lang={displayedScriptureLanguage}>{displayedScripture.split("\n").map((line, index) => <span key={`${reference}-script-${index}`}>{line}</span>)}</p>
          </section>
          {language === "en" && <section className="compact-study-card roman-card" aria-labelledby={`roman-${reference}`}>
            <StepHeading number={localizeDigits("02", language)} id={`roman-${reference}`}>{labels.roman}</StepHeading>
            <p className="compact-shloka roman" lang="sa-Latn">{transliteration.split("\n").map((line, index) => <span key={`${reference}-roman-${index}`}>{line}</span>)}</p>
          </section>}
        </div>

        <section className="compact-study-card sandhi-card" aria-labelledby={`sandhi-${reference}`}>
          <StepHeading number={localizeDigits("03", language)} id={`sandhi-${reference}`}>{labels.sandhi}</StepHeading>
          {sourceWords.length ? <div className="compact-sandhi-flow canonical-source-tokens" lang="sa-Latn">{sourceWords.map((word, index) => <span key={`${word.term}-${index}`}><strong>{word.term}</strong>{index < sourceWords.length - 1 && <small>+</small>}</span>)}</div> : <div className="canonical-pending-panel">{labels.separationPending}</div>}
          <p className="canonical-section-note"><span>{labels.reviewStatus}</span>{labels.sandhiNote}</p>
        </section>

        <section className="compact-study-card meaning-card" aria-labelledby={`words-${reference}`}>
          <StepHeading number={localizeDigits("04", language)} id={`words-${reference}`}>{labels.meanings}</StepHeading>
          {displayedGlosses.length > 0 && <div className="compact-meaning-head" aria-hidden="true"><span>{labels.romanForm}</span><span>{labels.sourceGloss}</span></div>}
          {displayedGlosses.length ? <div className="compact-word-grid" role="list">{displayedGlosses.map((word, index) => <div className="compact-word-row" role="listitem" key={`${word.term}-${index}`}><div><strong lang="sa-Latn">{word.term}</strong><small>{labels.sourceForm}</small></div><span lang={language}>{word.meaning}</span></div>)}</div> : <div className="canonical-pending-panel">{labels.meaningsPending}</div>}
        </section>

        <section className="compact-translation-card" aria-labelledby={`translation-${reference}`}>
          <StepHeading number={localizeDigits("05", language)} id={`translation-${reference}`}>{labels.translation}</StepHeading>
          {selectedContent.translation ? <div className="canonical-translation-copy"><p>{selectedContent.translation.text}</p>{(selectedContent.translation.translator || selectedContent.translation.sourceLocator) && <small>{[selectedContent.translation.translator, selectedContent.translation.sourceLocator].filter(Boolean).join(" · ")}</small>}</div> : <div className="canonical-pending-copy"><strong>{labels.translationPending}</strong><p>{labels.translationPolicy}</p></div>}
        </section>

        <section className="compact-study-card bhasya-card" aria-labelledby={`bhasya-${reference}`}>
          <div className="bhasya-card-head">
            <StepHeading number={localizeDigits("06", language)} id={`bhasya-${reference}`}>{labels.commentary}</StepHeading>
            {commentaries.length > 0 && <label className="bhasya-selector" htmlFor={`bhasya-commentator-${reference}`}><span>{labels.selectCommentator}</span><select id={`bhasya-commentator-${reference}`} value={displayedCommentary?.id ?? ""} onChange={(event) => setSelectedCommentaryId(event.target.value)}>{commentaries.map((item) => <option key={item.id} value={item.id}>{item.commentatorName}</option>)}</select></label>}
          </div>
          {displayedCommentary ? <div className="bhasya-content"><div className="bhasya-attribution"><span>{labels.tradition}</span><strong>{displayedCommentary.commentatorName}</strong><small>{displayedCommentary.tradition}</small><span className="bhasya-edition-label">{labels.edition}</span><small>{language === "or" ? labels.localEdition : `${displayedCommentary.editionTitle} · ${displayedCommentary.versionLabel}`}</small></div><div className="bhasya-reading" lang={displayedCommentary.scriptCode === "Orya" ? "sa-Orya" : "sa-Deva"}><span>{labels.editorialStatus}</span><strong className="bhasya-status">{labels.draftStatus}</strong><p>{displayedCommentary.text}</p></div></div> : <div className="bhasya-content bhasya-empty"><div className="bhasya-reading"><span>{labels.editorialStatus}</span><p>{labels.noCommentary}</p></div></div>}
          <div className="bhasya-governance"><p><span aria-hidden="true">ⓘ</span>{labels.governance}</p></div>
        </section>

        <div className="canonical-edition-record">
          <div><span>{labels.academicRecord}</span><strong>{language === "or" ? "ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତା" : language === "hi" ? "श्रीमद्भगवद्गीता" : "Bhagavad Gita"} {localizeDigits(reference, language)}</strong></div>
          <div><span>{labels.coursePosition}</span><strong>{localizeDigits(order, language)} / {localizeDigits(totalVerses, language)}</strong></div>
          <div><span>{labels.storage}</span><strong>{labels.database}</strong></div>
        </div>
        <p className="compact-review-note"><span aria-hidden="true">✓</span>{labels.reviewNote}</p>
      </div>
    </article>
  );
}
