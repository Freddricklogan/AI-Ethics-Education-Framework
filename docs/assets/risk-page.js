/** Binds the risk worksheet to the form on tools/risk-worksheet/. Runs only where the form exists. */
import { RISKS, LEVELS, RED_FLAGS, assess, toMarkdown } from './lib/risk.js';

const root = document.getElementById('risk-tool');
if (root) {
  const form = document.createElement('form');
  form.className = 'rw-form';
  form.noValidate = true;

  const nameField = document.createElement('div');
  nameField.className = 'rw-field';
  const nameLabel = document.createElement('label');
  nameLabel.htmlFor = 'rw-tool';
  nameLabel.textContent = 'AI tool under assessment';
  const nameInput = document.createElement('input');
  nameInput.id = 'rw-tool';
  nameInput.type = 'text';
  nameField.append(nameLabel, nameInput);
  form.append(nameField);

  const levelSelect = (id, label) => {
    const select = document.createElement('select');
    select.id = id;
    select.setAttribute('aria-label', label);
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = `${label}: not rated`;
    select.append(blank);
    for (const [k, v] of Object.entries(LEVELS)) {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = `${label}: ${v}`;
      select.append(o);
    }
    return select;
  };

  const risksFs = document.createElement('fieldset');
  const risksLg = document.createElement('legend');
  risksLg.textContent = 'Section 5.2 — Potential risks';
  risksFs.append(risksLg);
  RISKS.forEach((name, i) => {
    const row = document.createElement('div');
    row.className = 'rw-row';
    const label = document.createElement('div');
    label.className = 'rw-name';
    label.textContent = name;
    const mit = document.createElement('input');
    mit.type = 'text';
    mit.id = `rw-mit-${i}`;
    mit.placeholder = 'Mitigation';
    mit.setAttribute('aria-label', `${name}: mitigation`);
    row.append(label, levelSelect(`rw-l-${i}`, 'Likelihood'), levelSelect(`rw-i-${i}`, 'Impact'), mit);
    risksFs.append(row);
  });
  form.append(risksFs);

  for (const group of ['Technical', 'Pedagogical']) {
    const fs = document.createElement('fieldset');
    const lg = document.createElement('legend');
    lg.textContent = `Vendor evaluation — ${group.toLowerCase()} red flags (Responsible AI Deployment §1.2)`;
    fs.append(lg);
    RED_FLAGS.forEach((f, i) => {
      if (f.group !== group) return;
      const row = document.createElement('div');
      row.className = 'rw-flag';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = `rw-flag-${i}`;
      const label = document.createElement('label');
      label.htmlFor = cb.id;
      label.textContent = `${f.name} — ${f.flag}`;
      row.append(cb, label);
      fs.append(row);
    });
    form.append(fs);
  }

  const out = document.createElement('div');
  out.className = 'rw-out';
  out.setAttribute('aria-live', 'polite');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'md-button md-button--primary';
  btn.textContent = 'Copy worksheet as Markdown';
  const status = document.createElement('p');
  status.className = 'rw-status';
  root.append(form, out, btn, status);

  const val = (id) => { const v = form.querySelector(`#${id}`).value; return v === '' ? null : v; };
  const entries = () => RISKS.map((_, i) => ({ likelihood: val(`rw-l-${i}`), impact: val(`rw-i-${i}`), mitigation: form.querySelector(`#rw-mit-${i}`).value }));
  const flags = () => RED_FLAGS.map((_, i) => form.querySelector(`#rw-flag-${i}`).checked);
  const render = () => {
    const r = assess(entries(), flags());
    out.replaceChildren();
    const h = document.createElement('p');
    const tone = r.recommendation === 'Approve' ? 'ok' : r.recommendation === 'Defer' ? 'partial' : r.recommendation === 'Deny' ? 'bad' : 'warn';
    h.className = `rw-rec rw-${tone}`;
    h.textContent = `Recommendation: ${r.recommendation}`;
    out.append(h);
    const summary = document.createElement('p');
    summary.textContent = `Ratings — Critical ${r.counts.Critical}, High ${r.counts.High}, Medium ${r.counts.Medium}, Low ${r.counts.Low}; vendor red flags ${r.redFlags.length}.`;
    out.append(summary);
    if (r.reasons.length) {
      const ul = document.createElement('ul');
      for (const s of r.reasons) { const li = document.createElement('li'); li.textContent = s; ul.append(li); }
      out.append(ul);
    }
  };
  form.addEventListener('change', render);
  form.addEventListener('input', render);
  btn.addEventListener('click', async () => {
    const md = toMarkdown(nameInput.value.trim(), assess(entries(), flags()));
    try { await navigator.clipboard.writeText(md); status.textContent = 'Copied.'; } catch { status.textContent = 'Clipboard unavailable — worksheet printed below.'; const pre = document.createElement('pre'); pre.textContent = md; status.append(pre); }
  });
  render();
}
