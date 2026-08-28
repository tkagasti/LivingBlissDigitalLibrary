"use client";

import { FormEvent, useState } from "react";

export default function AccountPanel({ email, name, activeSessions }: { email: string; name: string; activeSessions: number }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const action = async (path: string, body?: Record<string, unknown>) => {
    setError("");
    setMessage("");
    const response = await fetch(path, {
      method: "POST",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to complete this request.");
    return data;
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await action("/api/auth/password/change", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Your password was changed and other sessions were signed out.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to change your password.");
    }
  };

  const logout = async () => {
    await action("/api/auth/logout");
    window.location.href = "/";
  };

  return (
    <main className="page-main account-page">
      <section className="page-shell account-heading"><span className="eyebrow">Account and security</span><h1>Your Living Bliss account</h1><p>Manage how you sign in and where your account is active.</p></section>
      <section className="page-shell account-grid">
        <article className="account-card"><h2>Profile</h2><dl><div><dt>Name</dt><dd>{name}</dd></div><div><dt>Email</dt><dd>{email}</dd></div></dl><a className="button secondary" href="/onboarding?returnTo=/account">Edit learning preferences</a></article>
        <article className="account-card"><h2>Connected sign-in</h2><p>Connect another verified account with the same email.</p><div className="account-actions"><a className="social-auth-button" href="/api/auth/oidc/google/start?returnTo=/account&link=1"><span>G</span>Connect Google</a><a className="social-auth-button" href="/api/auth/oidc/microsoft/start?returnTo=/account&link=1"><span>⊞</span>Connect Microsoft</a></div></article>
        <article className="account-card"><h2>Change password</h2><form className="auth-form" onSubmit={changePassword}><label>Current password<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label><label>New password<input type="password" minLength={12} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label><button className="button primary">Change password</button></form></article>
        <article className="account-card"><h2>Sessions</h2><p>{activeSessions} active {activeSessions === 1 ? "session" : "sessions"}.</p><div className="account-actions"><button className="button secondary" onClick={async () => { try { await action("/api/auth/sessions/revoke-others"); setMessage("Other sessions were signed out."); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to revoke sessions."); } }}>Sign out other devices</button><button className="button ghost" onClick={logout}>Sign out here</button></div></article>
      </section>
      {(message || error) && <div className={`toast ${error ? "error" : ""}`} role="status"><span>{error || message}</span></div>}
    </main>
  );
}
