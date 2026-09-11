"use client";

import { FormEvent, useState } from "react";
import type { StudyCompanionResponse } from "../ai/contracts";
import type { PlatformContext } from "../platform/context";

type StudyCompanionProps = {
  chapterNumber: number;
  context: PlatformContext;
};

const suggestions = [
  "What is this chapter’s learning focus?",
  "What question should I reflect on?",
  "How should I study this chapter?",
];

export default function StudyCompanion({ chapterNumber, context }: StudyCompanionProps) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<StudyCompanionResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (value: string) => {
    const nextQuestion = value.trim();
    if (nextQuestion.length < 3 || loading) return;
    setQuestion(nextQuestion);
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await fetch("/api/ai/study-companion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: nextQuestion,
          chapterNumber,
          tenantId: context.tenantId,
          programmeId: context.programmeId,
          editionId: context.editionId,
          language: context.language,
        }),
      });
      const body = (await result.json()) as StudyCompanionResponse & { error?: string };
      if (!result.ok) throw new Error(body.error || "The study companion could not answer.");
      setResponse(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The study companion could not answer.");
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void ask(question);
  };

  return (
    <aside className="study-companion" aria-labelledby="study-companion-title">
      <div className="study-companion-heading">
        <span className="study-companion-mark" aria-hidden="true">✦</span>
        <div>
          <span className="eyebrow">Source-grounded preview</span>
          <h2 id="study-companion-title">Study companion</h2>
        </div>
        <span className="preview-pill">Preview</span>
      </div>
      <p className="study-companion-intro">
        Ask about the learning focus or a published course source. Answers stay within this edition and show their evidence.
      </p>

      <div className="study-suggestions" aria-label="Suggested questions">
        {suggestions.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => void ask(suggestion)} disabled={loading}>
            {suggestion}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="study-question-form">
        <label htmlFor="study-question">Ask a course question</label>
        <textarea
          id="study-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={600}
          rows={4}
          placeholder="For example: What is the central focus of this chapter?"
        />
        <div>
          <small>{question.length}/600</small>
          <button type="submit" disabled={loading || question.trim().length < 3}>
            {loading ? "Checking sources…" : "Ask companion"}
          </button>
        </div>
      </form>

      <div className="study-privacy-note">
        <strong>Protect your privacy.</strong> Do not enter private reflections, health information or personal details. Questions are not saved by this preview.
      </div>

      {error && <p className="study-error" role="alert">{error}</p>}
      {response && (
        <section className={`study-answer ${response.grounded ? "grounded" : "limited"}`} aria-live="polite">
          <div className="study-answer-status">
            <span>{response.grounded ? "✓ Grounded in course sources" : "Source limit reached"}</span>
            <small>{response.responseMode === "retrieval-only" ? "Retrieval-only" : "Model-assisted"}</small>
          </div>
          {response.answer.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {response.citations.length > 0 && (
            <div className="study-citations">
              <strong>Sources used</strong>
              {response.citations.map((citation) => (
                <div key={citation.id}>
                  <span>{citation.title}</span>
                  <small>{citation.locator} · {citation.sourceLayer} · {citation.version}</small>
                </div>
              ))}
            </div>
          )}
          <details>
            <summary>Limitations and support reference</summary>
            <p>{response.limitations}</p>
            <small>{response.supportReference}</small>
          </details>
        </section>
      )}
    </aside>
  );
}
