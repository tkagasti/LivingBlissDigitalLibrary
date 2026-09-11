# AI readiness architecture

This repository includes an AI-ready study-companion boundary without making an external model authoritative for scripture, translation, commentary or assessment.

## Current implementation

The first implementation is deliberately retrieval-only:

1. The browser sends the visible tenant, programme, edition, language and chapter context to `/api/ai/study-companion`.
2. The API validates those identifiers against the server-owned context.
3. The provider retrieves only curated sources assigned to the active chapter and edition.
4. The response returns an answer, source-layer citations, edition/version metadata, limitations and a support reference.
5. The interface visibly distinguishes a grounded answer from an answer that cannot be supported.

Questions are not persisted. Private notes and reflections are not used as assistant context.

## Stable provider boundary

`StudyAssistantProvider` in `app/ai/contracts.ts` is the replaceable provider interface. A future model-backed adapter may implement that contract without changing the learner interface or public API response shape.

A production model-assisted provider must:

- receive tenant-approved retrieved passages rather than unrestricted database access;
- preserve citation identifiers and source-layer metadata through generation;
- reject unsupported claims instead of completing from model memory;
- never generate or silently modify canonical scripture or an authorised translation;
- keep tenant corpora, vector indexes, caches and analytics isolated;
- use a tenant and jurisdiction-specific data-processing policy;
- exclude private reflections, child data and sensitive inference unless an separately approved feature has explicit consent and purpose;
- apply age, safeguarding and escalation policies before generating an answer;
- record safe operational telemetry without logging secrets, private learner text or licensed payloads;
- support provider/model versioning, evaluation, rollback and kill switches.

## Recommended future flow

```text
Learner interface
  -> context and entitlement validation
  -> safety and age-policy check
  -> tenant-scoped hybrid retrieval
  -> rights and publication filter
  -> optional approved model provider
  -> citation/claim verification
  -> policy and safeguarding review
  -> response with sources, limitations and support reference
```

## Separation of concerns

- `app/platform/context.ts` owns the tenant/programme/edition envelope used by the current reference tenant.
- `app/ai/approved-corpus.ts` is the prototype source registry. Replace it with the governed content service and tenant-scoped search index.
- `app/ai/service.ts` owns retrieval, validation, refusal and provider selection.
- `app/api/ai/study-companion/route.ts` is the HTTP boundary and must remain responsible for request size, origin, authentication/entitlement and rate controls.
- `app/components/StudyCompanion.tsx` owns disclosure, privacy guidance, citations, limitations and accessible interaction states.

## Production work still required

- Resolve tenant and edition from the authenticated request and trusted host/invitation context rather than a single reference constant.
- Move scripture and learning sources into the governed content model with immutable releases, rights state and provenance.
- Add a tenant-isolated search/vector service with retraction propagation.
- Add distributed rate limiting, abuse monitoring and safe audit events.
- Add provider credentials through the deployment secrets manager; never expose them to the browser.
- Establish an evaluation set reviewed by scholarly, pedagogical, safeguarding and accessibility authorities.
- Test refusal, citation fidelity, cross-tenant substitution, prompt injection, harmful advice and multilingual behaviour before enabling model-assisted mode.
- Keep a retrieval-only fallback and an operational kill switch for each tenant, programme and age policy.

## Decisions required before model-assisted production use

Living Bliss must approve the authorised corpus, supported question categories, age bands, escalation owner, retention policy, hosting/data-residency rules, model provider and evaluation thresholds. These decisions do not block continued development of the learning platform or retrieval-only interface.
