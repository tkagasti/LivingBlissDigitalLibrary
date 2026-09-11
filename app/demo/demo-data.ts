export type DemoProfileId = "new-learner" | "active-learner" | "course-completer";

export type DemoLearner = {
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

export type DemoProfileSummary = {
  id: DemoProfileId;
  label: string;
  learnerName: string;
  description: string;
  startPath: string;
};

export type DemoSessionState = {
  profileId: DemoProfileId;
  learner: DemoLearner;
};

export type DemoProgressPayload = {
  action?: "profile" | "completeLesson" | "assessment" | "reset";
  displayName?: string;
  preferredLanguage?: string;
  learningMode?: string;
  lessonId?: string;
  score?: number;
};

export const demoProfiles: DemoProfileSummary[] = [
  {
    id: "new-learner",
    label: "New learner",
    learnerName: "Ananya Sharma",
    description: "Explore the course before completing the first lesson.",
    startPath: "/course/gita",
  },
  {
    id: "active-learner",
    label: "Active learner",
    learnerName: "Arjun Mehta",
    description: "Continue to the next shloka before the chapter assessment.",
    startPath: "/dashboard",
  },
  {
    id: "course-completer",
    label: "Course completer",
    learnerName: "Meera Iyer",
    description: "View a passed assessment, achievement and certificate.",
    startPath: "/dashboard",
  },
];

const profileLearners: Record<DemoProfileId, DemoLearner> = {
  "new-learner": {
    id: "demo-new-learner",
    displayName: "Ananya Sharma",
    preferredLanguage: "English",
    learningMode: "Mixed learning",
    completedLessons: [],
    assessmentScore: null,
    assessmentPassed: false,
    memberJoined: true,
    updatedAt: "2026-08-24T09:30:00.000Z",
  },
  "active-learner": {
    id: "demo-active-learner",
    displayName: "Arjun Mehta",
    preferredLanguage: "Hindi",
    learningMode: "Video and scripture",
    completedLessons: ["gita-2-47"],
    assessmentScore: null,
    assessmentPassed: false,
    memberJoined: true,
    updatedAt: "2026-08-29T06:15:00.000Z",
  },
  "course-completer": {
    id: "demo-course-completer",
    displayName: "Meera Iyer",
    preferredLanguage: "English",
    learningMode: "Scripture and reflection",
    completedLessons: ["gita-2-47", "gita-2-48"],
    assessmentScore: 80,
    assessmentPassed: true,
    memberJoined: true,
    updatedAt: "2026-08-30T11:45:00.000Z",
  },
};

export function isDemoProfileId(value: unknown): value is DemoProfileId {
  return typeof value === "string" && demoProfiles.some((profile) => profile.id === value);
}

export function createDemoSession(profileId: DemoProfileId): DemoSessionState {
  return {
    profileId,
    learner: {
      ...profileLearners[profileId],
      completedLessons: [...profileLearners[profileId].completedLessons],
    },
  };
}

function cleanText(value: unknown, fallback: string, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) || fallback : fallback;
}

export function applyDemoProgress(state: DemoSessionState, payload: DemoProgressPayload): DemoSessionState {
  const learner = { ...state.learner, completedLessons: [...state.learner.completedLessons] };

  if (payload.action === "profile") {
    learner.displayName = cleanText(payload.displayName, "Seeker", 80);
    learner.preferredLanguage = cleanText(payload.preferredLanguage, "English", 30);
    learner.learningMode = cleanText(payload.learningMode, "Mixed learning", 30);
    learner.memberJoined = true;
  } else if (payload.action === "completeLesson") {
    const lessonId = cleanText(payload.lessonId, "", 100);
    if (!lessonId) throw new Error("A lesson ID is required.");
    if (!learner.completedLessons.includes(lessonId)) learner.completedLessons.push(lessonId);
  } else if (payload.action === "assessment") {
    const requiredShlokas = ["gita-2-47", "gita-2-48"];
    if (!requiredShlokas.every((lessonId) => learner.completedLessons.includes(lessonId))) {
      throw new Error("Complete every prescribed Chapter 2 shloka before taking the assessment.");
    }
    const score = Math.max(0, Math.min(100, Math.round(Number(payload.score) || 0)));
    learner.assessmentScore = score;
    learner.assessmentPassed = score >= 60;
  } else if (payload.action === "reset") {
    learner.completedLessons = [];
    learner.assessmentScore = null;
    learner.assessmentPassed = false;
  } else {
    throw new Error("Unsupported progress action.");
  }

  learner.updatedAt = new Date().toISOString();
  return { ...state, learner };
}
