import Image from "next/image";
import Link from "next/link";
import { foundationModules } from "../course-data";
import { livingBlissGitaContext } from "../../../platform/context";

export const metadata = { title: "Gita learning foundations" };

export default function GitaFoundationsPage() {
  return (
    <div className="foundations-root">
      <a className="skip-link" href="#foundations-content">Skip to foundations</a>
      <header className="course-workspace-header">
        <Link href="/" aria-label="Living Bliss Digital Library home">
          <Image src="/living-bliss-logo-2026.png" alt="Living Bliss — Awakening Inner Bliss" width={1881} height={836} priority />
        </Link>
        <div className="workspace-context"><span>{livingBlissGitaContext.programmeName}</span><strong>{livingBlissGitaContext.editionName}</strong></div>
        <nav aria-label="Course utilities"><Link href="/course/gita">Course overview</Link><Link href="/library">Library</Link><Link className="workspace-account-link" href="/sign-in?returnTo=%2Fcourse%2Fgita%2Ffoundations">Sign in</Link></nav>
      </header>
      <main id="foundations-content">
        <section className="foundations-hero">
          <div className="page-shell">
            <span className="eyebrow">A thoughtful beginning</span>
            <h1>Prepare for the<br />18-chapter journey.</h1>
            <p>Build the shared context needed to study confidently, without treating a beginner as less capable or asking an experienced learner to repeat what they already know.</p>
            <div className="foundations-actions"><a className="button saffron" href="#foundation-modules">Begin foundations</a><Link className="button outline-light" href="/course/gita/chapter/1">Preview Chapter 1</Link></div>
          </div>
        </section>
        <section className="foundation-principles">
          <div className="page-shell">
            <span>✓ Respectful study</span><span>✓ Edition-aware sources</span><span>✓ Accessible preferences</span><span>✓ Diagnostic, not public grading</span>
          </div>
        </section>
        <section className="foundation-module-section page-shell" id="foundation-modules">
          <div className="section-heading"><div><span className="eyebrow">Prerequisite pathway</span><h2>Six short modules</h2></div><span className="foundation-time">About 45–60 minutes</span></div>
          <div className="foundation-module-grid">
            {foundationModules.map((module, index) => (
              <article key={module.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><small>{index === 5 ? "Readiness" : "Foundation"}</small><h3>{module.title}</h3><p>{module.purpose}</p></div>
                <button type="button" disabled title="Interactive module content will be connected after editorial approval">Preview structure</button>
              </article>
            ))}
          </div>
        </section>
        <section className="foundation-next page-shell">
          <div><span className="eyebrow">Course map available now</span><h2>See the complete journey.</h2><p>Every chapter has a defined learning focus and a consistent nine-step lesson pattern. Authoritative edition content remains gated by approval.</p></div>
          <Link className="button primary" href="/course/gita/chapter/1">Open Chapter 1 preview →</Link>
        </section>
      </main>
    </div>
  );
}
