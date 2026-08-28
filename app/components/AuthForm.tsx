"use client";

import { FormEvent, useMemo, useState } from "react";

type Mode = "password" | "otp" | "register" | "code" | "reset-request" | "reset-code";

async function post(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to complete this request.");
  return data;
}

export default function AuthForm({
  returnTo,
  initialChallenge,
  initialEmail,
  initialMode,
  initialError,
}: {
  returnTo: string;
  initialChallenge?: string;
  initialEmail?: string;
  initialMode?: string;
  initialError?: string;
}) {
  const startingMode: Mode = initialChallenge ? "code" : initialMode === "register" ? "register" : "password";
  const [mode, setMode] = useState<Mode>(startingMode);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState(initialChallenge ?? "");
  const [challengePurpose, setChallengePurpose] = useState<"signin" | "verify" | "reset" | "oidc-link">(
    initialMode === "verify-provider" ? "oidc-link" : "signin",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [notice, setNotice] = useState(initialChallenge ? `We sent a verification code to ${initialEmail}.` : "");

  const oidcQuery = useMemo(() => `?returnTo=${encodeURIComponent(returnTo)}`, [returnTo]);

  const complete = (data: { returnTo?: string }) => {
    window.location.href = data.returnTo || returnTo;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "password") {
        complete(await post("/api/auth/password/login", { email, password, returnTo }));
      } else if (mode === "register") {
        const data = await post("/api/auth/password/register", { email, password, name });
        setChallengeId(data.challengeId);
        setChallengePurpose("verify");
        setMode("code");
        setNotice(`We sent a verification code to ${email}.`);
      } else if (mode === "otp" || mode === "reset-request") {
        const purpose = mode === "otp" ? "signin" : "reset";
        const data = await post("/api/auth/otp/request", { email, purpose });
        setChallengeId(data.challengeId);
        setChallengePurpose(purpose);
        setMode(purpose === "reset" ? "reset-code" : "code");
        setNotice(`We sent a verification code to ${email}.`);
      } else {
        complete(await post("/api/auth/otp/verify", {
          challengeId,
          code,
          returnTo,
          ...(challengePurpose === "reset" ? { newPassword } : {}),
        }));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to complete this request.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setNotice("");
    setCode("");
  };

  const resend = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await post("/api/auth/otp/resend", { challengeId });
      setChallengeId(data.challengeId);
      setCode("");
      setNotice(`A new code was sent to ${email}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to resend the code.");
    } finally {
      setBusy(false);
    }
  };

  const isCode = mode === "code" || mode === "reset-code";

  return (
    <div className="auth-card">
      <div className="auth-card-head">
        <span className="eyebrow">Free learning membership</span>
        <h1>{mode === "register" ? "Create your account" : isCode ? "Enter your code" : mode.startsWith("reset") ? "Reset your password" : "Welcome back"}</h1>
        <p>{isCode ? "Enter the six-digit code from your email." : "Keep your learning, assessments and achievements together across devices."}</p>
      </div>

      {!isCode && mode !== "reset-request" && (
        <>
          <div className="social-auth-grid">
            <a className="social-auth-button" href={`/api/auth/oidc/google/start${oidcQuery}`}><span>G</span>Continue with Google</a>
            <a className="social-auth-button" href={`/api/auth/oidc/microsoft/start${oidcQuery}`}><span className="microsoft-mark">⊞</span>Continue with Microsoft</a>
          </div>
          <div className="auth-divider"><span>or use email</span></div>
        </>
      )}

      <form className="auth-form" onSubmit={submit}>
        {mode === "register" && <label>Display name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} autoComplete="name" /></label>}
        {!isCode && <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>}
        {(mode === "password" || mode === "register") && (
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={mode === "register" ? 12 : undefined} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} />{mode === "register" && <small>Use at least 12 characters.</small>}</label>
        )}
        {isCode && <label>Verification code<input className="otp-input" inputMode="numeric" pattern="[0-9]{6}" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required autoComplete="one-time-code" autoFocus /></label>}
        {mode === "reset-code" && <label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={12} maxLength={128} required autoComplete="new-password" /></label>}
        {error && <p className="form-message error" role="alert">{error}</p>}
        {notice && <p className="form-message success" role="status">{notice}</p>}
        <button className="button primary wide" disabled={busy} type="submit">
          {busy ? "Please wait…" : mode === "password" ? "Sign in" : mode === "register" ? "Create account" : mode === "otp" ? "Send sign-in code" : mode === "reset-request" ? "Send reset code" : mode === "reset-code" ? "Set new password" : "Verify and continue"}
        </button>
      </form>

      <div className="auth-options">
        {mode === "password" && <><button onClick={() => switchMode("otp")}>Use a one-time code</button><button onClick={() => switchMode("reset-request")}>Forgot password?</button></>}
        {mode === "otp" && <button onClick={() => switchMode("password")}>Use your password</button>}
        {isCode && <button disabled={busy} onClick={resend}>Send a new code</button>}
        {(isCode || mode === "reset-request") && <button onClick={() => switchMode("password")}>Back to sign in</button>}
        {mode !== "register" ? <button onClick={() => switchMode("register")}>Create a free account</button> : <button onClick={() => switchMode("password")}>Already have an account?</button>}
      </div>
      <p className="auth-privacy">By continuing, you agree to the learning terms and privacy notice. Living Bliss does not ask for caste, nationality, gender or religious identity.</p>
    </div>
  );
}
