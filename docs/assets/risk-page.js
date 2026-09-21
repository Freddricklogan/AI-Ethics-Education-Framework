/** Risk worksheet page: six risks × likelihood/impact/mitigation and fourteen red flags on the
 * shared tool scaffold. Runs only where the mount exists. */
import { RISKS, LEVELS, RED_FLAGS, assess, toMarkdown } from './lib/risk.js';
import { el, levelSelect, mountTool } from './shell/tool-page.js';

const root = document.getElementById('risk-tool');
if (root) {
  const levels = Object.entries(LEVELS);
  const rows = [];
  const flags = [];
  mountTool(root, {
    subjectLabel: 'AI tool under assessment',
    copyLabel: 'Copy worksheet as Markdown',
    events: ['input'], // mitigation text changes the outcome; input fires for selects and checkboxes too
    buildFields(form) {
      const risks = el('fieldset', {}, [el('legend', { text: 'Section 5.2 — Potential risks' })]);
      risks.style.setProperty('--tool-cols', '1.4fr 1fr 1fr 1.4fr');
      RISKS.forEach((name, i) => {
        const row = { likelihood: levelSelect(`rw-l-${i}`, 'Likelihood', levels), impact: levelSelect(`rw-i-${i}`, 'Impact', levels), mitigation: el('input', { type: 'text', id: `rw-mit-${i}`, placeholder: 'Mitigation', 'aria-label': `${name}: mitigation` }) };
        rows.push(row);
        risks.append(el('div', { class: 'tool-row' }, [el('div', { class: 'tool-name', text: name }), row.likelihood, row.impact, row.mitigation]));
      });
      form.append(risks);
      for (const group of ['Technical', 'Pedagogical']) {
        const fs = el('fieldset', {}, [el('legend', { text: `Vendor evaluation — ${group.toLowerCase()} red flags (Responsible AI Deployment §1.2)` })]);
        RED_FLAGS.forEach((f, i) => {
          if (f.group !== group) return;
          const cb = el('input', { type: 'checkbox', id: `rw-flag-${i}` });
          flags[i] = cb;
          fs.append(el('div', { class: 'tool-check' }, [cb, el('label', { for: cb.id, text: `${f.name} — ${f.flag}` })]));
        });
        form.append(fs);
      }
    },
    read: () => ({
      entries: rows.map((r) => ({ likelihood: r.likelihood.value || null, impact: r.impact.value || null, mitigation: r.mitigation.value })),
      flags: flags.map((cb) => cb.checked)
    }),
    render(out, { entries, flags: checked }) {
      const r = assess(entries, checked);
      const tone = { Approve: 'ok', Defer: 'muted', Deny: 'danger' }[r.recommendation] ?? 'warn';
      out.append(el('p', { class: `tool-headline tool-${tone}`, text: `Recommendation: ${r.recommendation}` }));
      out.append(el('p', { text: `Ratings — Critical ${r.counts.Critical}, High ${r.counts.High}, Medium ${r.counts.Medium}, Low ${r.counts.Low}; vendor red flags ${r.redFlags.length}.` }));
      if (r.reasons.length) out.append(el('ul', {}, r.reasons.map((s) => el('li', { text: s }))));
    },
    toMarkdown: (subject, { entries, flags: checked }) => toMarkdown(subject, assess(entries, checked))
  });
}
