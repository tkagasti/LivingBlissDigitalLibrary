export const collections = [
  {
    id: "jagannatha",
    mark: "ज",
    type: "Flagship collection",
    title: "Jagannatha Dham",
    description: "Scriptures, traditions, sacred geography and documented living heritage of Śrī Purushottama Kshetra.",
    meta: "Jagannatha-first publication programme",
    href: "/library?search=Jagannatha",
    tone: "saffron",
  },
  {
    id: "gita",
    mark: "गी",
    type: "Guided course",
    title: "Bhagavad Gita",
    description: "An approachable 18-chapter pathway with scripture reading, video, slides, reflection and assessments.",
    meta: "Beginner · Mixed learning · Certificate",
    href: "/course/gita",
    tone: "indigo",
  },
  {
    id: "upanishads",
    mark: "उ",
    type: "Foundational texts",
    title: "Principal Upanishads",
    description: "Guided introductions to Īśa, Kena, Kaṭha and Māṇḍūkya, with verified source information.",
    meta: "4 initial texts · Progressive release",
    href: "/library?search=Upanishad",
    tone: "teal",
  },
  {
    id: "yoga",
    mark: "यो",
    type: "Darśana",
    title: "Yoga Darśana",
    description: "Study Patañjali’s Yoga Sūtras across four pādas with pronunciation, meaning and guided practice notes.",
    meta: "4 modules · Audio and slides",
    href: "/library?search=Yoga",
    tone: "plum",
  },
];

export const libraryItems = [
  { type: "Scripture", title: "Purushottama Kshetra Mahatmyam", subtitle: "Skanda Purāṇa · 49-chapter catalogue", status: "Verified catalogue", language: "Sanskrit · English", topic: "Jagannatha" },
  { type: "Sacred text", title: "Nīlādri Mahodaya", subtitle: "Temple tradition and ritual literature", status: "Editorial preparation", language: "Sanskrit · Odia", topic: "Jagannatha" },
  { type: "Hymn", title: "Jagannāthāṣṭakam", subtitle: "Text, transliteration, translation and recitation", status: "Enhanced", language: "Sanskrit · English", topic: "Jagannatha" },
  { type: "Course", title: "Bhagavad Gita: Foundations", subtitle: "18 chapters · video, slides and scripture study", status: "Learning pilot", language: "English · Hindi · Odia", topic: "Gita" },
  { type: "Scripture", title: "Īśa Upanishad", subtitle: "18 mantras with word-by-word meaning", status: "Verified", language: "Sanskrit · English", topic: "Upanishad" },
  { type: "Scripture", title: "Kena Upanishad", subtitle: "Four khaṇḍas · inquiry into consciousness", status: "In review", language: "Sanskrit · English", topic: "Upanishad" },
  { type: "Darśana", title: "Patañjali Yoga Sūtras", subtitle: "Samādhi, Sādhana, Vibhūti and Kaivalya pādas", status: "Verified text", language: "Sanskrit · English", topic: "Yoga" },
  { type: "Heritage record", title: "Annual Festival Index", subtitle: "Snāna Yātrā to Nīlādri Bije", status: "Living tradition", language: "English · Odia", topic: "Jagannatha" },
];

export const chapters = [
  "Arjuna Viṣāda Yoga", "Sāṅkhya Yoga", "Karma Yoga", "Jñāna Karma Sannyāsa Yoga",
  "Karma Sannyāsa Yoga", "Dhyāna Yoga", "Jñāna Vijñāna Yoga", "Akṣara Brahma Yoga",
  "Rāja Vidyā Rāja Guhya Yoga", "Vibhūti Yoga", "Viśvarūpa Darśana Yoga", "Bhakti Yoga",
  "Kṣetra Kṣetrajña Vibhāga Yoga", "Guṇatraya Vibhāga Yoga", "Puruṣottama Yoga",
  "Daivāsura Sampad Vibhāga Yoga", "Śraddhātraya Vibhāga Yoga", "Mokṣa Sannyāsa Yoga",
];

export const questions = [
  { question: "What is Arjuna’s central difficulty at the beginning of the Gita?", answers: ["He has forgotten his weapons", "He is overwhelmed by conflict about duty", "He wants to leave the kingdom permanently", "He cannot understand Sanskrit"], correct: 1 },
  { question: "Gita 2.47 teaches that a person has responsibility primarily for…", answers: ["Controlling every result", "Avoiding all action", "Sincere action, without ownership of the result", "Winning recognition"], correct: 2 },
  { question: "Which learning attitude best reflects karma yoga?", answers: ["Act carefully and offer the outcome", "Act only when success is guaranteed", "Ignore the quality of the work", "Compare your progress publicly"], correct: 0 },
  { question: "Why does this course separate scripture, translation and commentary?", answers: ["To make the page longer", "To show source and interpretation clearly", "To prevent learners reading Sanskrit", "To replace traditional teaching"], correct: 1 },
  { question: "What score is required to pass a chapter assessment?", answers: ["40%", "50%", "60%", "100%"], correct: 2 },
];
