import { describe, expect, it } from "vitest";
import { applyDemoProgress, createDemoSession } from "./demo-data";

describe("demo learner data", () => {
  it("creates independent profile state", () => {
    const first = createDemoSession("active-learner");
    first.learner.completedLessons.push("temporary");
    expect(createDemoSession("active-learner").learner.completedLessons).toEqual(["gita-2-47"]);
  });

  it("updates lesson and assessment progress", () => {
    const initial = createDemoSession("new-learner");
    const firstCompleted = applyDemoProgress(initial, { action: "completeLesson", lessonId: "gita-2-47" });
    const completed = applyDemoProgress(firstCompleted, { action: "completeLesson", lessonId: "gita-2-48" });
    const assessed = applyDemoProgress(completed, { action: "assessment", score: 80 });

    expect(assessed.learner.completedLessons).toContain("gita-2-47");
    expect(assessed.learner.completedLessons).toContain("gita-2-48");
    expect(assessed.learner.assessmentScore).toBe(80);
    expect(assessed.learner.assessmentPassed).toBe(true);
  });

  it("keeps the assessment locked until all prescribed shlokas are complete", () => {
    const initial = createDemoSession("active-learner");
    expect(() => applyDemoProgress(initial, { action: "assessment", score: 80 })).toThrow(
      "Complete every prescribed Chapter 2 shloka",
    );
  });

  it("resets progress without removing the demo membership", () => {
    const reset = applyDemoProgress(createDemoSession("course-completer"), { action: "reset" });
    expect(reset.learner.completedLessons).toEqual([]);
    expect(reset.learner.assessmentScore).toBeNull();
    expect(reset.learner.memberJoined).toBe(true);
  });
});
