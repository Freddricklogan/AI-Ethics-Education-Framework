/** AI Impact Assessment risk worksheet — the six risks, the H/M/L scales and the five
 * recommendations are those in docs/ai-impact-assessment.md (§5.2 and §7); the vendor red
 * flags are those in docs/responsible-ai-deployment.md §1.2. The framework does not say
 * how a likelihood and an impact combine, so the 3×3 matrix and the recommendation rules
 * below are this worksheet's convention, stated on the page and pinned by the tests. */

export const RISKS = [
  'Inaccurate recommendations or assessments',
  'Bias affecting specific student groups',
  'Privacy breach or data misuse',
  'Over-reliance reducing educator judgment',
  'Student disengagement or negative experience',
  'Access barriers for some students'
];
export const LEVELS = { H: 'High', M: 'Medium', L: 'Low' };
export const RED_FLAGS = [
  { group: 'Technical', name: 'Model transparency', flag: '"Proprietary black box" with no explanation offered' },
  { group: 'Technical', name: 'Training data', flag: 'Trained on data from very different demographics' },
  { group: 'Technical', name: 'Validation evidence', flag: 'Only vendor-conducted studies; no independent validation' },
  { group: 'Technical', name: 'Bias testing', flag: 'No bias testing conducted; refuses to share results' },
  { group: 'Technical', name: 'Data practices', flag: 'Vague answers; data stored offshore; broad access' },
  { group: 'Technical', name: 'Security', flag: 'No SOC 2 or equivalent; outdated security practices' },
  { group: 'Technical', name: 'Integration', flag: 'Requires extensive custom integration; no standard APIs' },
  { group: 'Technical', name: 'Explainability', flag: 'No explanation capability for individual decisions' },
  { group: 'Technical', name: 'Audit rights', flag: 'No audit provisions; restricted access to system behavior data' },
  { group: 'Pedagogical', name: 'Learning science alignment', flag: 'No grounding in learning science; purely data-driven' },
  { group: 'Pedagogical', name: 'Educator involvement', flag: 'Designed entirely by technologists; no educator input' },
  { group: 'Pedagogical', name: 'Student agency', flag: 'Fully automated with no student control or input' },
  { group: 'Pedagogical', name: 'Accessibility', flag: 'No accessibility testing; does not support screen readers' },
  { group: 'Pedagogical', name: 'Cultural responsiveness', flag: 'Single cultural perspective; no multilingual support' }
];
/** §7 recommendations, in the template's order. */
export const RECOMMENDATIONS = ['Approve', 'Approve with conditions', 'Pilot required', 'Deny', 'Defer'];

const RANK = { L: 0, M: 1, H: 2 };
/** Worksheet convention: rating = likelihood × impact on a 3×3 matrix. */
export function rate(likelihood, impact) {
  if (!(likelihood in RANK) || !(impact in RANK)) return null;
  const s = RANK[likelihood] + RANK[impact];
  if (s === 4) return 'Critical';
  if (s === 3) return 'High';
  if (s === 2) return 'Medium';
  return 'Low';
}

/** entries: array aligned with RISKS of { likelihood: 'H'|'M'|'L'|null, impact: same, mitigation: string };
 *  flags: array of booleans aligned with RED_FLAGS. */
export function validate(entries, flags) {
  const problems = [];
  if (!Array.isArray(entries) || entries.length !== RISKS.length) problems.push(`expected ${RISKS.length} risk entries`);
  else entries.forEach((e, i) => {
    for (const k of ['likelihood', 'impact']) {
      const v = e?.[k] ?? null;
      if (v !== null && !(v in LEVELS)) problems.push(`${RISKS[i]}: ${k} must be H, M or L`);
    }
    if (e?.mitigation !== undefined && typeof e.mitigation !== 'string') problems.push(`${RISKS[i]}: mitigation must be text`);
  });
  if (!Array.isArray(flags) || flags.length !== RED_FLAGS.length) problems.push(`expected ${RED_FLAGS.length} red-flag answers`);
  return problems;
}

/** Recommendation rules (worksheet convention):
 *  - any risk still unrated → Defer (the template's "insufficient information")
 *  - a Critical risk with no mitigation written → Deny
 *  - a Critical risk with a mitigation, or a High risk with none → Pilot required
 *  - a High risk with a mitigation, or any vendor red flag → Approve with conditions
 *  - otherwise → Approve */
export function assess(entries, flags) {
  const problems = validate(entries, flags);
  if (problems.length) throw new Error(problems.join('; '));
  const risks = RISKS.map((name, i) => {
    const e = entries[i];
    const mitigation = (e.mitigation ?? '').trim();
    return { name, likelihood: e.likelihood ?? null, impact: e.impact ?? null, rating: rate(e.likelihood, e.impact), mitigated: mitigation.length > 0, mitigation };
  });
  const redFlags = RED_FLAGS.filter((_, i) => flags[i]).map((f) => `${f.name}: ${f.flag}`);
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const r of risks) if (r.rating) counts[r.rating] += 1;
  const complete = risks.every((r) => r.rating !== null);
  const reasons = [];
  let recommendation;
  if (!complete) {
    recommendation = 'Defer';
    reasons.push(`${risks.filter((r) => r.rating === null).length} risk(s) not yet rated`);
  } else if (risks.some((r) => r.rating === 'Critical' && !r.mitigated)) {
    recommendation = 'Deny';
    for (const r of risks) if (r.rating === 'Critical' && !r.mitigated) reasons.push(`${r.name}: Critical with no mitigation`);
  } else if (risks.some((r) => r.rating === 'Critical' || (r.rating === 'High' && !r.mitigated))) {
    recommendation = 'Pilot required';
    for (const r of risks) {
      if (r.rating === 'Critical') reasons.push(`${r.name}: Critical, mitigation proposed`);
      else if (r.rating === 'High' && !r.mitigated) reasons.push(`${r.name}: High with no mitigation`);
    }
  } else if (risks.some((r) => r.rating === 'High') || redFlags.length) {
    recommendation = 'Approve with conditions';
    for (const r of risks) if (r.rating === 'High') reasons.push(`${r.name}: High, mitigation proposed`);
    for (const f of redFlags) reasons.push(`Vendor red flag — ${f}`);
  } else {
    recommendation = 'Approve';
  }
  return { risks, counts, redFlags, complete, recommendation, reasons };
}

export function toMarkdown(tool, result) {
  const lines = [`# AI impact assessment — risk worksheet: ${tool || 'unnamed tool'}`, '', `Recommendation: **${result.recommendation}**`, ''];
  if (result.reasons.length) lines.push(...result.reasons.map((r) => `- ${r}`), '');
  lines.push('| Risk | Likelihood | Impact | Rating | Mitigation |', '|---|---|---|---|---|');
  for (const r of result.risks) lines.push(`| ${r.name} | ${r.likelihood ? LEVELS[r.likelihood] : '—'} | ${r.impact ? LEVELS[r.impact] : '—'} | ${r.rating ?? '—'} | ${r.mitigation || '—'} |`);
  lines.push('', `Vendor red flags: ${result.redFlags.length ? result.redFlags.length : 'none'}`);
  for (const f of result.redFlags) lines.push(`- ${f}`);
  return lines.join('\n') + '\n';
}
