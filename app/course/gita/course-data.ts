export type GitaChapter = {
  number: number;
  slug: string;
  title: string;
  focus: string;
  essentialQuestion: string;
  verseCount: number;
  status: "available" | "curriculum-preview";
};

const chapterBlueprint: Array<Omit<GitaChapter, "number" | "slug" | "status" | "verseCount">> = [
  {
    title: "Arjuna Viṣāda Yoga",
    focus: "Recognising moral conflict and the need for guidance.",
    essentialQuestion: "How can a sincere person respond when duty, relationship and consequence appear to conflict?",
  },
  {
    title: "Sāṅkhya Yoga",
    focus: "Self, steadiness, right action and foundational teachings.",
    essentialQuestion: "What changes when action is guided by clear understanding rather than fear of results?",
  },
  {
    title: "Karma Yoga",
    focus: "Duty, contribution and action without possessive attachment.",
    essentialQuestion: "How can daily work become disciplined service rather than a source of bondage?",
  },
  {
    title: "Jñāna Karma Sannyāsa Yoga",
    focus: "Knowledge, tradition, divine descent and wise action.",
    essentialQuestion: "How are knowledge, tradition and action brought together?",
  },
  {
    title: "Karma Sannyāsa Yoga",
    focus: "Renunciation in action and inner freedom.",
    essentialQuestion: "What does it mean to renounce possessiveness while continuing to act?",
  },
  {
    title: "Dhyāna Yoga",
    focus: "Discipline of mind, meditation and balance.",
    essentialQuestion: "How can attention and daily discipline support a balanced inner life?",
  },
  {
    title: "Jñāna Vijñāna Yoga",
    focus: "Knowing the Divine in principle and experience.",
    essentialQuestion: "How are conceptual knowledge and realised understanding distinguished?",
  },
  {
    title: "Akṣara Brahma Yoga",
    focus: "The imperishable, remembrance and life’s final orientation.",
    essentialQuestion: "How does sustained remembrance shape the direction of a life?",
  },
  {
    title: "Rāja Vidyā Rāja Guhya Yoga",
    focus: "Sovereign knowledge, devotion and divine immanence.",
    essentialQuestion: "Why is this teaching described as both sovereign knowledge and a profound secret?",
  },
  {
    title: "Vibhūti Yoga",
    focus: "Recognising divine excellences in the world.",
    essentialQuestion: "How can the world become a field for remembering divine excellence?",
  },
  {
    title: "Viśvarūpa Darśana Yoga",
    focus: "Encountering the universal form and limits of ordinary perception.",
    essentialQuestion: "What does the universal vision reveal about the limits of ordinary perception?",
  },
  {
    title: "Bhakti Yoga",
    focus: "Qualities and practices of devotion.",
    essentialQuestion: "Which qualities make devotion steady, practical and transformative?",
  },
  {
    title: "Kṣetra Kṣetrajña Vibhāga Yoga",
    focus: "Field, knower, nature and consciousness.",
    essentialQuestion: "How does distinguishing the field from its knower change self-understanding?",
  },
  {
    title: "Guṇatraya Vibhāga Yoga",
    focus: "Understanding the three guṇas and moving beyond them.",
    essentialQuestion: "How do the three guṇas influence thought and action, and what lies beyond them?",
  },
  {
    title: "Puruṣottama Yoga",
    focus: "The cosmic tree, the individual self and the Supreme Person.",
    essentialQuestion: "What does the image of the cosmic tree invite the learner to examine?",
  },
  {
    title: "Daivāsura Sampad Vibhāga Yoga",
    focus: "Constructive and destructive dispositions.",
    essentialQuestion: "Which dispositions support growth, and which repeatedly obstruct it?",
  },
  {
    title: "Śraddhātraya Vibhāga Yoga",
    focus: "Faith, motivation and the qualities shaping practice.",
    essentialQuestion: "How do motivation and character shape the quality of a practice?",
  },
  {
    title: "Mokṣa Sannyāsa Yoga",
    focus: "Integration, surrender, freedom and the final counsel.",
    essentialQuestion: "How do the Gita’s teachings come together in its final counsel?",
  },
];

const chapterVerseCounts = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78] as const;

export const gitaChapters: GitaChapter[] = chapterBlueprint.map((chapter, index) => ({
  ...chapter,
  number: index + 1,
  slug: String(index + 1),
  verseCount: chapterVerseCounts[index],
  status: "available",
}));

export const foundationModules = [
  {
    id: "welcome",
    title: "Welcome and intent",
    purpose: "Set your learning goal and understand how respectful, edition-aware study works.",
  },
  {
    id: "gita-context",
    title: "What is the Bhagavad Gita?",
    purpose: "Place the dialogue within the Mahābhārata and distinguish scripture, setting and commentary.",
  },
  {
    id: "people-and-terms",
    title: "People, setting and key terms",
    purpose: "Meet Krishna and Arjuna, and begin with dharma, yoga, ātman and karma.",
  },
  {
    id: "verse-layers",
    title: "How to read a verse",
    purpose: "See how Sanskrit, transliteration, translation, commentary and citation remain distinct.",
  },
  {
    id: "preferences",
    title: "Choose how you learn",
    purpose: "Set language, media, captions, text size, audio and download preferences.",
  },
  {
    id: "readiness",
    title: "Readiness check",
    purpose: "Confirm the shared foundation or identify a bridge lesson before Chapter 1.",
  },
] as const;

export function getGitaChapter(slug: string) {
  return gitaChapters.find((chapter) => chapter.slug === slug);
}
