"use client";

import { FormEvent, useState } from "react";

export default function OnboardingForm({ name, returnTo }: { name: string; returnTo: string }) {
  const [displayName, setDisplayName] = useState(name);
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [learningMode, setLearningMode] = useState("Mixed learning");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "profile", displayName, preferredLanguage, learningMode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save your preferences.");
      window.location.href = returnTo;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save your preferences.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-card auth-form onboarding-card" onSubmit={submit}>
      <span className="eyebrow">One final step</span>
      <h1>Shape your learning path</h1>
      <p>These preferences can be changed later from your account.</p>
      <label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80} /></label>
      <label>Preferred language<select value={preferredLanguage} onChange={(event) => setPreferredLanguage(event.target.value)}><option>English</option><option>Odia</option><option>Hindi</option><option>Sanskrit</option></select></label>
      <label>Learning format<select value={learningMode} onChange={(event) => setLearningMode(event.target.value)}><option>Mixed learning</option><option>Video first</option><option>Slides first</option><option>Text and audio</option></select></label>
      {error && <p className="form-message error" role="alert">{error}</p>}
      <button className="button primary wide" disabled={busy}>{busy ? "Saving…" : "Open my learning"}</button>
    </form>
  );
}
