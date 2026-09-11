"use client";

import { useEffect, useState } from "react";

export type StudyLanguage = "English" | "Hindi" | "Odia";
export type ShlokaReference = "2.47" | "2.48";

type ScriptVersion = {
  devanagari: string;
  odia: string;
};

type WordStudy = {
  iast: string;
  script: ScriptVersion;
  meanings: Record<StudyLanguage, string>;
};

type ShlokaStudy = {
  scripture: ScriptVersion;
  iast: string;
  sandhi: {
    devanagari: string[];
    odia: string[];
  };
  words: WordStudy[];
  translations: Record<StudyLanguage, string>;
};

const languageOptions: StudyLanguage[] = ["English", "Hindi", "Odia"];

const interfaceCopy: Record<StudyLanguage, {
  preference: string;
  scripture: string;
  roman: string;
  split: string;
  words: string;
  translation: string;
  sanskritWord: string;
  meaning: string;
  languageAria: string;
  panelAria: string;
  languageNames: Record<StudyLanguage, string>;
  bhasya: string;
  chooseCommentator: string;
  tradition: string;
  summaryLabel: string;
  source: string;
  governance: string;
  readAloud: string;
  stopReading: string;
  reading: string;
  speechUnavailable: string;
  spokenWordMeanings: string;
  spokenTranslation: string;
  review: string;
}> = {
  English: {
    preference: "Selected language",
    scripture: "Shloka · Devanagari",
    roman: "Shloka · English transliteration",
    split: "Sandhi-vicheda",
    words: "Meaning of each word",
    translation: "Translation",
    sanskritWord: "Sanskrit word",
    meaning: "Meaning",
    languageAria: "Select the study language",
    panelAria: "shloka study",
    languageNames: { English: "English", Hindi: "Hindi", Odia: "Odia" },
    bhasya: "Bhāṣya · Commentary",
    chooseCommentator: "Select bhāṣyakāra or guru",
    tradition: "Commentarial tradition",
    summaryLabel: "Editorial prototype summary",
    source: "View classical source",
    governance: "The production edition will display the approved full text or translation supplied by the selected organisation, with source, rights and version details.",
    readAloud: "Read shloka and meanings",
    stopReading: "Stop reading",
    reading: "Reading aloud",
    speechUnavailable: "Read-aloud is not available in this browser or device.",
    spokenWordMeanings: "Word meanings",
    spokenTranslation: "Translation",
    review: "Prototype translation · final wording requires edition-owner and scholar approval.",
  },
  Hindi: {
    preference: "चुनी हुई भाषा",
    scripture: "श्लोक · देवनागरी",
    roman: "श्लोक · रोमन लिप्यंतरण",
    split: "सन्धि-विच्छेद",
    words: "प्रत्येक शब्द का अर्थ",
    translation: "हिन्दी अनुवाद",
    sanskritWord: "संस्कृत शब्द",
    meaning: "अर्थ",
    languageAria: "अध्ययन की भाषा चुनें",
    panelAria: "श्लोक अध्ययन",
    languageNames: { English: "अंग्रेज़ी", Hindi: "हिन्दी", Odia: "ओड़िया" },
    bhasya: "भाष्य · टीका",
    chooseCommentator: "भाष्यकार या गुरु चुनें",
    tradition: "भाष्य परम्परा",
    summaryLabel: "सम्पादकीय प्रोटोटाइप सारांश",
    source: "शास्त्रीय स्रोत देखें",
    governance: "उत्पादन संस्करण में चुनी हुई संस्था द्वारा अनुमोदित पूर्ण पाठ या अनुवाद को स्रोत, अधिकार और संस्करण विवरण सहित प्रदर्शित किया जाएगा।",
    readAloud: "श्लोक और अर्थ सुनें",
    stopReading: "पाठ रोकें",
    reading: "पाठ सुनाया जा रहा है",
    speechUnavailable: "इस ब्राउज़र या उपकरण पर पाठ सुनाने की सुविधा उपलब्ध नहीं है।",
    spokenWordMeanings: "शब्दार्थ",
    spokenTranslation: "अनुवाद",
    review: "यह प्रोटोटाइप अनुवाद है। अंतिम पाठ के लिए संस्करण-स्वामी और विद्वान की स्वीकृति आवश्यक है।",
  },
  Odia: {
    preference: "ଚୟନିତ ଭାଷା",
    scripture: "ଶ୍ଲୋକ · ଓଡ଼ିଆ ଲିପି",
    roman: "ଶ୍ଲୋକ · ରୋମାନ୍ ଲିପ୍ୟନ୍ତରଣ",
    split: "ସନ୍ଧି ବିଚ୍ଛେଦ",
    words: "ପ୍ରତ୍ୟେକ ଶବ୍ଦର ଅର୍ଥ",
    translation: "ଓଡ଼ିଆ ଅନୁବାଦ",
    sanskritWord: "ସଂସ୍କୃତ ଶବ୍ଦ",
    meaning: "ଅର୍ଥ",
    languageAria: "ଅଧ୍ୟୟନର ଭାଷା ଚୟନ କରନ୍ତୁ",
    panelAria: "ଶ୍ଲୋକ ଅଧ୍ୟୟନ",
    languageNames: { English: "ଇଂରାଜୀ", Hindi: "ହିନ୍ଦୀ", Odia: "ଓଡ଼ିଆ" },
    bhasya: "ଭାଷ୍ୟ · ବ୍ୟାଖ୍ୟା",
    chooseCommentator: "ଭାଷ୍ୟକାର ବା ଗୁରୁ ଚୟନ କରନ୍ତୁ",
    tradition: "ଭାଷ୍ୟ ପରମ୍ପରା",
    summaryLabel: "ସମ୍ପାଦକୀୟ ପ୍ରୋଟୋଟାଇପ୍ ସାରାଂଶ",
    source: "ଶାସ୍ତ୍ରୀୟ ଉତ୍ସ ଦେଖନ୍ତୁ",
    governance: "ଉତ୍ପାଦନ ସଂସ୍କରଣରେ ଚୟନିତ ସଂସ୍ଥା ଦ୍ୱାରା ଅନୁମୋଦିତ ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ବା ଅନୁବାଦକୁ ଉତ୍ସ, ଅଧିକାର ଓ ସଂସ୍କରଣ ବିବରଣୀ ସହ ଦେଖାଯିବ।",
    readAloud: "ଶ୍ଲୋକ ଓ ଅର୍ଥ ଶୁଣନ୍ତୁ",
    stopReading: "ପାଠ ବନ୍ଦ କରନ୍ତୁ",
    reading: "ପାଠ ଶୁଣାଯାଉଛି",
    speechUnavailable: "ଏହି ବ୍ରାଉଜର୍ ବା ଉପକରଣରେ ପାଠ ଶୁଣାଇବା ସୁବିଧା ଉପଲବ୍ଧ ନାହିଁ।",
    spokenWordMeanings: "ଶବ୍ଦାର୍ଥ",
    spokenTranslation: "ଅନୁବାଦ",
    review: "ଏହା ଏକ ପ୍ରୋଟୋଟାଇପ୍ ଅନୁବାଦ। ଅନ୍ତିମ ପାଠ ପାଇଁ ସଂସ୍କରଣ-ମାଲିକ ଓ ବିଦ୍ୱାନଙ୍କ ଅନୁମୋଦନ ଆବଶ୍ୟକ।",
  },
};

const shlokas: Record<ShlokaReference, ShlokaStudy> = {
  "2.47": {
    scripture: {
      devanagari: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
      odia: "କର୍ମଣ୍ୟେବାଧିକାରସ୍ତେ ମା ଫଳେଷୁ କଦାଚନ ।\nମା କର୍ମଫଳହେତୁର୍ଭୂର୍ମା ତେ ସଙ୍ଗୋଽସ୍ତ୍ୱକର୍ମଣି ॥",
    },
    iast: "karmaṇy evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi",
    sandhi: {
      devanagari: ["कर्मणि", "एव", "अधिकारः", "ते", "मा", "फलेषु", "कदाचन", "मा", "कर्मफलहेतुः", "भूः", "मा", "ते", "सङ्गः", "अस्तु", "अकर्मणि"],
      odia: ["କର୍ମଣି", "ଏବ", "ଅଧିକାରଃ", "ତେ", "ମା", "ଫଳେଷୁ", "କଦାଚନ", "ମା", "କର୍ମଫଳହେତୁଃ", "ଭୂଃ", "ମା", "ତେ", "ସଙ୍ଗଃ", "ଅସ୍ତୁ", "ଅକର୍ମଣି"],
    },
    words: [
      { iast: "karmaṇi", script: { devanagari: "कर्मणि", odia: "କର୍ମଣି" }, meanings: { English: "in action or duty", Hindi: "कर्म या कर्तव्य में", Odia: "କର୍ମ ବା କର୍ତ୍ତବ୍ୟରେ" } },
      { iast: "eva", script: { devanagari: "एव", odia: "ଏବ" }, meanings: { English: "only; indeed", Hindi: "ही; केवल", Odia: "ହିଁ; କେବଳ" } },
      { iast: "adhikāraḥ", script: { devanagari: "अधिकारः", odia: "ଅଧିକାରଃ" }, meanings: { English: "right or authority", Hindi: "अधिकार", Odia: "ଅଧିକାର" } },
      { iast: "te", script: { devanagari: "ते", odia: "ତେ" }, meanings: { English: "your", Hindi: "तुम्हारा", Odia: "ତୁମର" } },
      { iast: "mā", script: { devanagari: "मा", odia: "ମା" }, meanings: { English: "do not; never", Hindi: "मत; कभी नहीं", Odia: "କର ନାହିଁ; କେବେ ନୁହେଁ" } },
      { iast: "phaleṣu", script: { devanagari: "फलेषु", odia: "ଫଳେଷୁ" }, meanings: { English: "in the results", Hindi: "फलों में", Odia: "ଫଳଗୁଡ଼ିକରେ" } },
      { iast: "kadācana", script: { devanagari: "कदाचन", odia: "କଦାଚନ" }, meanings: { English: "at any time", Hindi: "किसी भी समय", Odia: "କୌଣସି ସମୟରେ" } },
      { iast: "karma-phala-hetuḥ", script: { devanagari: "कर्मफलहेतुः", odia: "କର୍ମଫଳହେତୁଃ" }, meanings: { English: "motive or cause of action’s fruit", Hindi: "कर्मफल का हेतु", Odia: "କର୍ମଫଳର ହେତୁ" } },
      { iast: "bhūḥ", script: { devanagari: "भूः", odia: "ଭୂଃ" }, meanings: { English: "become", Hindi: "बनो", Odia: "ହୁଅ" } },
      { iast: "saṅgaḥ", script: { devanagari: "सङ्गः", odia: "ସଙ୍ଗଃ" }, meanings: { English: "attachment", Hindi: "आसक्ति", Odia: "ଆସକ୍ତି" } },
      { iast: "astu", script: { devanagari: "अस्तु", odia: "ଅସ୍ତୁ" }, meanings: { English: "let there be", Hindi: "हो", Odia: "ହେଉ" } },
      { iast: "akarmaṇi", script: { devanagari: "अकर्मणि", odia: "ଅକର୍ମଣି" }, meanings: { English: "in inaction", Hindi: "अकर्म में", Odia: "ଅକର୍ମରେ" } },
    ],
    translations: {
      English: "Your responsibility is for action alone, never for command over its results. Do not make the fruit of action your motive, and do not become attached to inaction.",
      Hindi: "तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। कर्मफल को अपना हेतु मत बनाओ और अकर्म में भी तुम्हारी आसक्ति न हो।",
      Odia: "ତୁମର ଅଧିକାର କେବଳ କର୍ମ କରିବାରେ, ତାହାର ଫଳରେ କେବେ ନୁହେଁ। କର୍ମଫଳକୁ ନିଜ ଉଦ୍ଦେଶ୍ୟ କର ନାହିଁ ଏବଂ ଅକର୍ମରେ ମଧ୍ୟ ଆସକ୍ତ ହୁଅ ନାହିଁ।",
    },
  },
  "2.48": {
    scripture: {
      devanagari: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
      odia: "ଯୋଗସ୍ଥଃ କୁରୁ କର୍ମାଣି ସଙ୍ଗଂ ତ୍ୟକ୍ତ୍ୱା ଧନଞ୍ଜୟ ।\nସିଦ୍ଧ୍ୟସିଦ୍ଧ୍ୟୋଃ ସମୋ ଭୂତ୍ୱା ସମତ୍ୱଂ ଯୋଗ ଉଚ୍ୟତେ ॥",
    },
    iast: "yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate",
    sandhi: {
      devanagari: ["योगस्थः", "कुरु", "कर्माणि", "सङ्गम्", "त्यक्त्वा", "धनञ्जय", "सिद्धि-असिद्ध्योः", "समः", "भूत्वा", "समत्वम्", "योगः", "उच्यते"],
      odia: ["ଯୋଗସ୍ଥଃ", "କୁରୁ", "କର୍ମାଣି", "ସଙ୍ଗମ୍", "ତ୍ୟକ୍ତ୍ୱା", "ଧନଞ୍ଜୟ", "ସିଦ୍ଧି-ଅସିଦ୍ଧ୍ୟୋଃ", "ସମଃ", "ଭୂତ୍ୱା", "ସମତ୍ୱମ୍", "ଯୋଗଃ", "ଉଚ୍ୟତେ"],
    },
    words: [
      { iast: "yoga-sthaḥ", script: { devanagari: "योगस्थः", odia: "ଯୋଗସ୍ଥଃ" }, meanings: { English: "established in yoga", Hindi: "योग में स्थित", Odia: "ଯୋଗରେ ସ୍ଥିତ" } },
      { iast: "kuru", script: { devanagari: "कुरु", odia: "କୁରୁ" }, meanings: { English: "perform", Hindi: "करो", Odia: "କର" } },
      { iast: "karmāṇi", script: { devanagari: "कर्माणि", odia: "କର୍ମାଣି" }, meanings: { English: "actions or duties", Hindi: "कर्मों को", Odia: "କର୍ମଗୁଡ଼ିକୁ" } },
      { iast: "saṅgam", script: { devanagari: "सङ्गम्", odia: "ସଙ୍ଗମ୍" }, meanings: { English: "attachment", Hindi: "आसक्ति को", Odia: "ଆସକ୍ତିକୁ" } },
      { iast: "tyaktvā", script: { devanagari: "त्यक्त्वा", odia: "ତ୍ୟକ୍ତ୍ୱା" }, meanings: { English: "having abandoned", Hindi: "त्यागकर", Odia: "ତ୍ୟାଗ କରି" } },
      { iast: "dhanañjaya", script: { devanagari: "धनञ्जय", odia: "ଧନଞ୍ଜୟ" }, meanings: { English: "O Dhanañjaya (Arjuna)", Hindi: "हे धनञ्जय", Odia: "ହେ ଧନଞ୍ଜୟ" } },
      { iast: "siddhi-asiddhyoḥ", script: { devanagari: "सिद्धि-असिद्ध्योः", odia: "ସିଦ୍ଧି-ଅସିଦ୍ଧ୍ୟୋଃ" }, meanings: { English: "in success and failure", Hindi: "सिद्धि और असिद्धि में", Odia: "ସଫଳତା ଓ ବିଫଳତାରେ" } },
      { iast: "samaḥ", script: { devanagari: "समः", odia: "ସମଃ" }, meanings: { English: "equal; even-minded", Hindi: "समान", Odia: "ସମଭାବପୂର୍ଣ୍ଣ" } },
      { iast: "bhūtvā", script: { devanagari: "भूत्वा", odia: "ଭୂତ୍ୱା" }, meanings: { English: "having become", Hindi: "होकर", Odia: "ହୋଇ" } },
      { iast: "samatvam", script: { devanagari: "समत्वम्", odia: "ସମତ୍ୱମ୍" }, meanings: { English: "equanimity", Hindi: "समभाव", Odia: "ସମତ୍ୱ" } },
      { iast: "yogaḥ", script: { devanagari: "योगः", odia: "ଯୋଗଃ" }, meanings: { English: "yoga", Hindi: "योग", Odia: "ଯୋଗ" } },
      { iast: "ucyate", script: { devanagari: "उच्यते", odia: "ଉଚ୍ୟତେ" }, meanings: { English: "is called", Hindi: "कहा जाता है", Odia: "କୁହାଯାଏ" } },
    ],
    translations: {
      English: "Established in yoga, perform your actions after relinquishing attachment, O Dhanañjaya. Remain even in success and failure; this equanimity is called yoga.",
      Hindi: "हे धनञ्जय, आसक्ति त्यागकर योग में स्थित होकर कर्म करो। सिद्धि और असिद्धि में समान रहो; यह समभाव ही योग कहलाता है।",
      Odia: "ହେ ଧନଞ୍ଜୟ, ଆସକ୍ତି ତ୍ୟାଗ କରି ଯୋଗରେ ସ୍ଥିତ ହୋଇ କର୍ମ କର। ସଫଳତା ଓ ବିଫଳତାରେ ସମଭାବ ରଖ; ଏହି ସମତ୍ୱକୁ ଯୋଗ କୁହାଯାଏ।",
    },
  },
};

type CommentatorId = "shankara" | "ramanuja" | "madhva" | "sridhara";

const commentators: Array<{
  id: CommentatorId;
  name: Record<StudyLanguage, string>;
  tradition: Record<StudyLanguage, string>;
}> = [
  {
    id: "shankara",
    name: { English: "Ādi Śaṅkarācārya", Hindi: "आदि शंकराचार्य", Odia: "ଆଦି ଶଙ୍କରାଚାର୍ଯ୍ୟ" },
    tradition: { English: "Advaita Vedānta", Hindi: "अद्वैत वेदान्त", Odia: "ଅଦ୍ୱୈତ ବେଦାନ୍ତ" },
  },
  {
    id: "ramanuja",
    name: { English: "Śrī Rāmānujācārya", Hindi: "श्री रामानुजाचार्य", Odia: "ଶ୍ରୀ ରାମାନୁଜାଚାର୍ଯ୍ୟ" },
    tradition: { English: "Viśiṣṭādvaita Vedānta", Hindi: "विशिष्टाद्वैत वेदान्त", Odia: "ବିଶିଷ୍ଟାଦ୍ୱୈତ ବେଦାନ୍ତ" },
  },
  {
    id: "madhva",
    name: { English: "Śrī Madhvācārya", Hindi: "श्री मध्वाचार्य", Odia: "ଶ୍ରୀ ମଧ୍ୱାଚାର୍ଯ୍ୟ" },
    tradition: { English: "Dvaita Vedānta", Hindi: "द्वैत वेदान्त", Odia: "ଦ୍ୱୈତ ବେଦାନ୍ତ" },
  },
  {
    id: "sridhara",
    name: { English: "Śrīdhara Svāmī", Hindi: "श्रीधर स्वामी", Odia: "ଶ୍ରୀଧର ସ୍ୱାମୀ" },
    tradition: { English: "Classical Vaiṣṇava tradition", Hindi: "शास्त्रीय वैष्णव परम्परा", Odia: "ଶାସ୍ତ୍ରୀୟ ବୈଷ୍ଣବ ପରମ୍ପରା" },
  },
];

const bhasyaSummaries: Record<ShlokaReference, Record<CommentatorId, Record<StudyLanguage, string>>> = {
  "2.47": {
    shankara: {
      English: "Śaṅkara reads this instruction as addressed to one presently qualified for disciplined action rather than direct establishment in knowledge. Arjuna should act without longing for results, without imagining himself the independent producer of those results, and without using renunciation of fruit as a reason for inaction.",
      Hindi: "शंकराचार्य इस उपदेश को उस साधक के लिए मानते हैं जो अभी अनुशासित कर्म का अधिकारी है, ज्ञाननिष्ठा का नहीं। अर्जुन को फल की इच्छा और स्वयं को फल का स्वतन्त्र उत्पादक मानने का भाव छोड़कर कर्म करना चाहिए; फलत्याग को अकर्म का कारण भी नहीं बनाना चाहिए।",
      Odia: "ଶଙ୍କରାଚାର୍ଯ୍ୟ ଏହି ଉପଦେଶକୁ ସେହି ସାଧକଙ୍କ ପାଇଁ ବୁଝାନ୍ତି, ଯିଏ ବର୍ତ୍ତମାନ ଜ୍ଞାନନିଷ୍ଠା ଅପେକ୍ଷା ଶୃଙ୍ଖଳିତ କର୍ମର ଅଧିକାରୀ। ଅର୍ଜୁନ ଫଳର ଆକାଂକ୍ଷା ଓ ନିଜକୁ ଫଳର ସ୍ୱାଧୀନ କର୍ତ୍ତା ଭାବିବା ଛାଡ଼ି କର୍ମ କରିବେ; ଫଳତ୍ୟାଗକୁ ଅକର୍ମର କାରଣ କରିବେ ନାହିଁ।",
    },
    ramanuja: {
      English: "Rāmānuja explains that obligatory and occasional duties are to be performed, while their fruits are not to be claimed. Action offered as worship of the Supreme, without desire for reward or the notion of independent agency, becomes a means toward liberation.",
      Hindi: "रामानुजाचार्य समझाते हैं कि नित्य और नैमित्तिक कर्तव्यों का पालन करना चाहिए, किन्तु उनके फल पर अधिकार नहीं मानना चाहिए। पुरस्कार की इच्छा और स्वतन्त्र कर्तापन के भाव से रहित, परमात्मा की आराधना के रूप में किया गया कर्म मुक्ति का साधन बनता है।",
      Odia: "ରାମାନୁଜାଚାର୍ଯ୍ୟ ବୁଝାନ୍ତି ଯେ ନିତ୍ୟ ଓ ନୈମିତ୍ତିକ କର୍ତ୍ତବ୍ୟ ପାଳନ କରିବା ଉଚିତ, କିନ୍ତୁ ସେଗୁଡ଼ିକର ଫଳ ଉପରେ ଅଧିକାର ଦାବି କରିବା ଉଚିତ ନୁହେଁ। ପୁରସ୍କାରର ଇଚ୍ଛା ଓ ସ୍ୱାଧୀନ କର୍ତ୍ତାଭାବ ବିନା, ପରମାତ୍ମାଙ୍କ ଆରାଧନା ରୂପେ କରାଯାଇଥିବା କର୍ମ ମୁକ୍ତିର ସାଧନ ହୁଏ।",
    },
    madhva: {
      English: "Madhva treats the verse as instruction for the aspirant who must continue prescribed action. The result is not under the individual’s independent control; duty is performed in dependence on the Supreme, and attachment to inaction is rejected.",
      Hindi: "मध्वाचार्य इस श्लोक को उस साधक के लिए उपदेश मानते हैं जिसे निर्धारित कर्म करते रहना चाहिए। परिणाम व्यक्ति के स्वतन्त्र नियन्त्रण में नहीं है; कर्तव्य परमात्मा पर निर्भरता के भाव से किया जाता है और अकर्म की आसक्ति का त्याग किया जाता है।",
      Odia: "ମଧ୍ୱାଚାର୍ଯ୍ୟ ଏହି ଶ୍ଲୋକକୁ ସେହି ସାଧକଙ୍କ ପାଇଁ ଉପଦେଶ ଭାବେ ଦେଖନ୍ତି, ଯାହାଙ୍କୁ ନିର୍ଦ୍ଧାରିତ କର୍ମ କରିଚାଲିବା ଉଚିତ। ଫଳ ବ୍ୟକ୍ତିର ସ୍ୱାଧୀନ ନିୟନ୍ତ୍ରଣରେ ନୁହେଁ; ପରମାତ୍ମାଙ୍କ ଉପରେ ନିର୍ଭରତାର ଭାବରେ କର୍ତ୍ତବ୍ୟ କରାଯାଏ ଓ ଅକର୍ମ ପ୍ରତି ଆସକ୍ତିକୁ ତ୍ୟାଗ କରାଯାଏ।",
    },
    sridhara: {
      English: "Śrīdhara emphasizes that desire for a binding result must not become the motive for action. At the same time, fear that action may bind should not become attachment to non-performance.",
      Hindi: "श्रीधर स्वामी बल देते हैं कि बन्धनकारी फल की इच्छा कर्म की प्रेरणा नहीं बननी चाहिए। साथ ही, कर्म से बन्धन होने का भय कर्तव्य न करने की आसक्ति में भी नहीं बदलना चाहिए।",
      Odia: "ଶ୍ରୀଧର ସ୍ୱାମୀ ଗୁରୁତ୍ୱ ଦେଇ କହନ୍ତି ଯେ ବନ୍ଧନକାରୀ ଫଳର ଇଚ୍ଛା କର୍ମର ପ୍ରେରଣା ହେବା ଉଚିତ ନୁହେଁ। ସେହିପରି, କର୍ମ ବନ୍ଧନ ସୃଷ୍ଟି କରିପାରେ ବୋଲି ଭୟ କରି କର୍ତ୍ତବ୍ୟ ନ କରିବା ପ୍ରତି ଆସକ୍ତି ମଧ୍ୟ ହେବା ଉଚିତ ନୁହେଁ।",
    },
  },
  "2.48": {
    shankara: {
      English: "For Śaṅkara, being established in yoga means performing duty for Īśvara, free from thirst for results and the insistence on personal agency. The practitioner remains even-minded whether the act brings success or failure; this equanimity is yoga.",
      Hindi: "शंकराचार्य के अनुसार योग में स्थित होने का अर्थ है फल की तृष्णा और व्यक्तिगत कर्तापन का आग्रह छोड़कर ईश्वर के लिए कर्तव्य करना। कर्म में सिद्धि हो या असिद्धि, साधक समभाव रखता है; यही समत्व योग है।",
      Odia: "ଶଙ୍କରାଚାର୍ଯ୍ୟଙ୍କ ମତରେ ଯୋଗରେ ସ୍ଥିତ ହେବାର ଅର୍ଥ ହେଉଛି ଫଳର ତୃଷ୍ଣା ଓ ବ୍ୟକ୍ତିଗତ କର୍ତ୍ତାଭାବର ଆଗ୍ରହ ଛାଡ଼ି ଈଶ୍ୱରଙ୍କ ପାଇଁ କର୍ତ୍ତବ୍ୟ କରିବା। କର୍ମରେ ସଫଳତା ବା ବିଫଳତା ଯାହା ଆସୁ, ସାଧକ ସମଭାବରେ ରହନ୍ତି; ଏହି ସମତ୍ୱ ହିଁ ଯୋଗ।",
    },
    ramanuja: {
      English: "Rāmānuja applies the teaching directly to Arjuna: abandon attachment to kingdom, relatives and the outcome of battle, yet perform the required action. Mental steadiness in victory and defeat is the yoga named here.",
      Hindi: "रामानुजाचार्य इस शिक्षा को सीधे अर्जुन पर लागू करते हैं—राज्य, सम्बन्धियों और युद्ध के परिणाम की आसक्ति छोड़कर भी आवश्यक कर्म करो। विजय और पराजय में मन की समान स्थिरता को ही यहाँ योग कहा गया है।",
      Odia: "ରାମାନୁଜାଚାର୍ଯ୍ୟ ଏହି ଶିକ୍ଷାକୁ ସିଧାସଳଖ ଅର୍ଜୁନଙ୍କ ସହ ଯୋଡ଼ନ୍ତି—ରାଜ୍ୟ, ସମ୍ପର୍କୀୟ ଓ ଯୁଦ୍ଧର ଫଳ ପ୍ରତି ଆସକ୍ତି ତ୍ୟାଗ କରି ମଧ୍ୟ ଆବଶ୍ୟକ କର୍ମ କର। ବିଜୟ ଓ ପରାଜୟରେ ମନର ସମାନ ସ୍ଥିରତାକୁ ଏଠାରେ ଯୋଗ କୁହାଯାଇଛି।",
    },
    madhva: {
      English: "Madhva reads this verse as a clarification of 2.47: remain established in the spiritual means, abandon affection for the fruit, and be equal in success and failure. Such evenness is the yoga taught by Krishna.",
      Hindi: "मध्वाचार्य इस श्लोक को २.४७ की स्पष्टता के रूप में पढ़ते हैं—आध्यात्मिक साधन में स्थित रहो, फल के प्रति स्नेह छोड़ो और सिद्धि-असिद्धि में समान रहो। ऐसी समता ही श्रीकृष्ण द्वारा सिखाया गया योग है।",
      Odia: "ମଧ୍ୱାଚାର୍ଯ୍ୟ ଏହି ଶ୍ଲୋକକୁ ୨.୪୭ର ସ୍ପଷ୍ଟୀକରଣ ଭାବେ ପଢ଼ନ୍ତି—ଆଧ୍ୟାତ୍ମିକ ସାଧନରେ ସ୍ଥିତ ରୁହ, ଫଳ ପ୍ରତି ସ୍ନେହ ଛାଡ଼ ଏବଂ ସଫଳତା-ବିଫଳତାରେ ସମାନ ରୁହ। ଏପରି ସମତା ହିଁ ଶ୍ରୀକୃଷ୍ଣ ଶିଖାଇଥିବା ଯୋଗ।",
    },
    sridhara: {
      English: "Śrīdhara describes yoga as single-minded orientation toward the Supreme. Action is offered without possessive agency, and even the success or failure of its spiritual fruit is met with equal-mindedness.",
      Hindi: "श्रीधर स्वामी योग को परमात्मा के प्रति एकनिष्ठता बताते हैं। कर्म स्वामित्व और कर्तापन के आग्रह के बिना अर्पित किया जाता है, और उसके आध्यात्मिक फल की सिद्धि-असिद्धि को भी समभाव से स्वीकार किया जाता है।",
      Odia: "ଶ୍ରୀଧର ସ୍ୱାମୀ ଯୋଗକୁ ପରମାତ୍ମାଙ୍କ ପ୍ରତି ଏକନିଷ୍ଠତା ଭାବେ ବର୍ଣ୍ଣନା କରନ୍ତି। ସ୍ୱାମିତ୍ୱ ଓ କର୍ତ୍ତାଭାବର ଆଗ୍ରହ ବିନା କର୍ମ ଅର୍ପଣ କରାଯାଏ, ଏବଂ ତାହାର ଆଧ୍ୟାତ୍ମିକ ଫଳର ସଫଳତା ବା ବିଫଳତାକୁ ମଧ୍ୟ ସମଭାବରେ ଗ୍ରହଣ କରାଯାଏ।",
    },
  },
};

export function resolveStudyLanguage(preferredLanguage: string): StudyLanguage {
  const value = preferredLanguage.trim().toLowerCase();
  if (value.includes("odia") || value.includes("oriya") || value.includes("ଓଡ଼ିଆ")) return "Odia";
  if (value.includes("hindi") || value.includes("हिन्दी") || value.includes("हिंदी")) return "Hindi";
  return "English";
}

export function localizeStudyDigits(value: string | number, language: StudyLanguage) {
  const text = String(value);
  if (language === "Hindi") return text.replace(/\d/g, (digit) => "०१२३४५६७८९"[Number(digit)]);
  if (language === "Odia") return text.replace(/\d/g, (digit) => "୦୧୨୩୪୫୬୭୮୯"[Number(digit)]);
  return text;
}

function StepHeading({ number, children }: { number: string; children: string }) {
  return <div className="compact-step-heading"><span>{number}</span><h3>{children}</h3></div>;
}

export default function ShlokaStudyPanel({
  language,
  onLanguageChange,
  reference,
}: {
  language: StudyLanguage;
  onLanguageChange: (language: StudyLanguage) => void;
  reference: ShlokaReference;
}) {
  const [selectedCommentator, setSelectedCommentator] = useState<CommentatorId>("shankara");
  const [isReading, setIsReading] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const copy = interfaceCopy[language];
  const shloka = shlokas[reference];
  const usesOdiaScript = language === "Odia";
  const scripture = usesOdiaScript ? shloka.scripture.odia : shloka.scripture.devanagari;
  const sandhi = usesOdiaScript ? shloka.sandhi.odia : shloka.sandhi.devanagari;
  const scriptLanguage = usesOdiaScript ? "sa-Orya" : "sa-Deva";
  const localReference = localizeStudyDigits(reference, language);
  const step = (number: string) => localizeStudyDigits(number, language);
  const commentator = commentators.find((item) => item.id === selectedCommentator) ?? commentators[0];
  const commentary = bhasyaSummaries[reference][selectedCommentator][language];

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const stopReading = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsReading(false);
  };

  const readAloud = () => {
    if (isReading) {
      stopReading();
      return;
    }

    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setSpeechError(copy.speechUnavailable);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeechError("");

    const selectedLanguageCode = language === "Odia" ? "or-IN" : language === "Hindi" ? "hi-IN" : "en-IN";
    const wordMeanings = shloka.words.map((word) => {
      const term = language === "English"
        ? word.iast
        : usesOdiaScript
          ? word.script.odia
          : word.script.devanagari;
      return language === "English"
        ? `${term}, means ${word.meanings.English}`
        : `${term}, ${word.meanings[language]}`;
    }).join(". ");

    const verseUtterance = new SpeechSynthesisUtterance(scripture.replace(/\n/g, " "));
    verseUtterance.lang = usesOdiaScript ? "or-IN" : "hi-IN";
    verseUtterance.rate = 0.82;

    const meaningsUtterance = new SpeechSynthesisUtterance(`${copy.spokenWordMeanings}. ${wordMeanings}.`);
    meaningsUtterance.lang = selectedLanguageCode;
    meaningsUtterance.rate = 0.9;

    const translationUtterance = new SpeechSynthesisUtterance(`${copy.spokenTranslation}. ${shloka.translations[language]}`);
    translationUtterance.lang = selectedLanguageCode;
    translationUtterance.rate = 0.9;
    translationUtterance.onend = () => setIsReading(false);
    translationUtterance.onerror = (event) => {
      setIsReading(false);
      if (event.error !== "canceled" && event.error !== "interrupted") {
        setSpeechError(copy.speechUnavailable);
      }
    };

    window.speechSynthesis.speak(verseUtterance);
    window.speechSynthesis.speak(meaningsUtterance);
    window.speechSynthesis.speak(translationUtterance);
    setIsReading(true);
  };

  return (
    <article className={`verse-panel shloka-study-panel compact language-${language.toLowerCase()}`} aria-label={`${localReference} ${copy.panelAria}`}>
      <div className="shloka-preference-bar">
        <div><span>{copy.preference}</span><strong>{copy.languageNames[language]}</strong></div>
        <div className="shloka-preference-actions">
          <button
            className={`read-aloud-button${isReading ? " active" : ""}`}
            type="button"
            aria-pressed={isReading}
            onClick={readAloud}
          >
            <span aria-hidden="true">{isReading ? "■" : "▶"}</span>
            <span>{isReading ? copy.stopReading : copy.readAloud}</span>
          </button>
          <div className="shloka-language-options" role="group" aria-label={copy.languageAria}>
            {languageOptions.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={language === option}
                onClick={() => {
                  stopReading();
                  setSpeechError("");
                  onLanguageChange(option);
                }}
              >
                {copy.languageNames[option]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">{isReading ? copy.reading : speechError}</span>
      {speechError && <p className="speech-notice" role="status">{speechError}</p>}

      <div className="shloka-compact-body">
        <div className="shloka-text-pair">
          <section className="compact-study-card devanagari-card" aria-labelledby={`scripture-${reference}`}>
            <StepHeading number={step("01")}>{copy.scripture}</StepHeading>
            <p className={`compact-shloka devanagari${usesOdiaScript ? " odia-script" : ""}`} id={`scripture-${reference}`} lang={scriptLanguage}>
              {scripture.split("\n").map((line) => <span key={line}>{line}</span>)}
            </p>
          </section>

          <section className="compact-study-card roman-card" aria-labelledby={`roman-${reference}`}>
            <StepHeading number={step("02")}>{copy.roman}</StepHeading>
            <p className="compact-shloka roman" id={`roman-${reference}`} lang="sa-Latn">
              {shloka.iast.split("\n").map((line) => <span key={line}>{line}</span>)}
            </p>
          </section>
        </div>

        <section className="compact-study-card sandhi-card" aria-labelledby={`sandhi-${reference}`}>
          <StepHeading number={step("03")}>{copy.split}</StepHeading>
          <div className={`compact-sandhi-flow${usesOdiaScript ? " odia-script" : ""}`} id={`sandhi-${reference}`} lang={scriptLanguage}>
            {sandhi.map((word, index) => (
              <span key={`${word}-${index}`}><strong>{word}</strong>{index < sandhi.length - 1 && <small>+</small>}</span>
            ))}
          </div>
        </section>

        <section className="compact-study-card meaning-card" aria-labelledby={`words-${reference}`}>
          <StepHeading number={step("04")}>{copy.words}</StepHeading>
          <div className="compact-meaning-head" aria-hidden="true"><span>{copy.sanskritWord}</span><span>{copy.meaning}</span></div>
          <div className="compact-word-grid" id={`words-${reference}`} role="list">
            {shloka.words.map((word, index) => (
              <div className="compact-word-row" role="listitem" key={`${word.iast}-${index}`}>
                <div><strong lang={scriptLanguage}>{usesOdiaScript ? word.script.odia : word.script.devanagari}</strong><small>{word.iast}</small></div>
                <span lang={language === "Odia" ? "or" : language === "Hindi" ? "hi" : "en"}>{word.meanings[language]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="compact-translation-card" aria-labelledby={`translation-${reference}`}>
          <StepHeading number={step("05")}>{copy.translation}</StepHeading>
          <p id={`translation-${reference}`} lang={language === "Odia" ? "or" : language === "Hindi" ? "hi" : "en"}>{shloka.translations[language]}</p>
        </section>

        <section className="compact-study-card bhasya-card" aria-label={copy.bhasya}>
          <div className="bhasya-card-head">
            <StepHeading number={step("06")}>{copy.bhasya}</StepHeading>
            <label className="bhasya-selector" htmlFor={`bhasya-commentator-${reference}`}>
              <span>{copy.chooseCommentator}</span>
              <select
                id={`bhasya-commentator-${reference}`}
                value={selectedCommentator}
                onChange={(event) => setSelectedCommentator(event.target.value as CommentatorId)}
              >
                {commentators.map((item) => <option key={item.id} value={item.id}>{item.name[language]}</option>)}
              </select>
            </label>
          </div>
          <div className="bhasya-content">
            <div className="bhasya-attribution">
              <span>{copy.tradition}</span>
              <strong>{commentator.name[language]}</strong>
              <small>{commentator.tradition[language]}</small>
            </div>
            <div className="bhasya-reading" lang={language === "Odia" ? "or" : language === "Hindi" ? "hi" : "en"}>
              <span>{copy.summaryLabel}</span>
              <p>{commentary}</p>
            </div>
          </div>
          <div className="bhasya-governance">
            <p><span aria-hidden="true">ⓘ</span>{copy.governance}</p>
            <a href={`https://www.gitasupersite.iitk.ac.in/dv/bhagavadgita/${reference}`} target="_blank" rel="noreferrer">{copy.source} ↗</a>
          </div>
        </section>

        <p className="compact-review-note"><span aria-hidden="true">✓</span>{copy.review}</p>
      </div>
    </article>
  );
}
