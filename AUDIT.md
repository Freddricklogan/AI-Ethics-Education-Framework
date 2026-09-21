# AUDIT — AI-Ethics-Education-Framework (pre-refactor)

Audit of the previous build: four framework documents and one
template (about 11,000 words), a README, no site, no code, no tests.
The README linked to
`https://freddricklogan.github.io/ai-ethics-education-framework/`,
which answered only because a stale copy sits in the user-site
repository; this repository had no Pages configuration and no
workflow.

---

## A. Claims and gaps

### A1 — A template with no arithmetic
`templates/ai-impact-assessment.md` §5.2 asks for a likelihood and an
impact (H/M/L) and a mitigation for six named risks, and §7 asks the
committee to pick one of five recommendations. Nothing connects the
two: the template never says how ratings combine or when a rating
should force a "Deny" or a "Pilot required". **Fix:**
`docs/assets/lib/risk.js` collects the six risks, the fourteen vendor
red flags from `responsible-ai-deployment.md` §1.2 and the five
recommendations *as written*, and adds a 3×3 rating matrix and a
five-rung recommendation ladder that are labelled on the page as the
worksheet's convention, not the framework's. The tests pin the ladder
so a change to it is a visible change.

### A2 — "comprehensive"
The README and the curriculum describe themselves as comprehensive.
That is a description of scope, not a measurement, and it stays.
No document makes an empirical claim: the percentages in the
bias-assessment framework (a 5% representation threshold, the
70%-calibration example) and the curriculum (assessment weights) are
definitions, not findings. Nothing was softened or removed.

## B. Publishing

### B1 — No site
Five long documents cross-referenced by file path. **Fix:** MkDocs +
Material, `strict` build in CI. The template moved from `templates/`
into `docs/` so it is part of the site; the one path reference to it
(`responsible-ai-deployment.md` §1.3) became a link.

### B2 — Wrong-case URL
The README's live link used the lowercase repository name. That path
is served by a stale folder in the user-site repository, not by this
repository, and it keeps answering from that copy even after the
project site exists (verified on EdTech-Policy-Framework: the
lowercase path returned the old page, the exact-case path the new
one). The canonical `site_url` uses the repository's casing; pruning
the stale user-site folders is a separate, manual task.

## C. What was added

| Item | Where |
| --- | --- |
| Risk worksheet module (pure, tested) | `docs/assets/lib/risk.js`, `tests/risk.test.js` |
| Worksheet page (form, live recommendation, Markdown export) | `docs/tools/risk-worksheet.md`, `docs/assets/risk-page.js` |
| Executive Shell on every page | `docs/assets/site.js`, `docs/assets/shell/` |
| MkDocs site, strict | `mkdocs.yml`, `requirements.txt` |
| CI/CD (lint → tests → build → scan → Pages) + CodeQL | `.github/workflows/` |
| Case study | `docs/CASE_STUDY.md` |
