import { describe, it, expect } from 'vitest';
import { RISKS, RED_FLAGS, RECOMMENDATIONS, rate, validate, assess, toMarkdown } from '../docs/assets/lib/risk.js';

const entry = (likelihood, impact, mitigation = '') => ({ likelihood, impact, mitigation });
const all = (l, i, m = '') => RISKS.map(() => entry(l, i, m));
const noFlags = RED_FLAGS.map(() => false);

describe('risk worksheet', () => {
  it('encodes the template: six risks, fourteen red flags, five recommendations', () => {
    expect(RISKS).toHaveLength(6);
    expect(RED_FLAGS).toHaveLength(14);
    expect(RED_FLAGS.filter((f) => f.group === 'Technical')).toHaveLength(9);
    expect(RECOMMENDATIONS).toEqual(['Approve', 'Approve with conditions', 'Pilot required', 'Deny', 'Defer']);
  });
  it('rates likelihood × impact on the 3×3 matrix', () => {
    expect(rate('H', 'H')).toBe('Critical');
    expect(rate('H', 'M')).toBe('High');
    expect(rate('M', 'H')).toBe('High');
    expect(rate('M', 'M')).toBe('Medium');
    expect(rate('H', 'L')).toBe('Medium');
    expect(rate('L', 'M')).toBe('Low');
    expect(rate('L', 'L')).toBe('Low');
    expect(rate(null, 'H')).toBeNull();
    expect(rate('X', 'H')).toBeNull();
  });
  it('validates shapes and levels', () => {
    expect(validate(all('L', 'L'), noFlags)).toEqual([]);
    const bad = all('L', 'L');
    bad[2] = { likelihood: 'X', impact: 'H', mitigation: 3 };
    expect(validate(bad, noFlags)).toEqual(['Privacy breach or data misuse: likelihood must be H, M or L', 'Privacy breach or data misuse: mitigation must be text']);
    expect(validate(all('L', 'L').slice(1), [])).toEqual(['expected 6 risk entries', 'expected 14 red-flag answers']);
    expect(() => assess(bad, noFlags)).toThrow(/likelihood must be/);
  });
  it('defers while any risk is unrated, whatever else is entered', () => {
    const e = all('L', 'L');
    e[4] = entry(null, 'H');
    const r = assess(e, noFlags);
    expect(r.complete).toBe(false);
    expect(r.recommendation).toBe('Defer');
    expect(r.reasons).toEqual(['1 risk(s) not yet rated']);
    expect(r.counts).toEqual({ Critical: 0, High: 0, Medium: 0, Low: 5 });
  });
  it('applies the recommendation ladder', () => {
    expect(assess(all('L', 'L'), noFlags).recommendation).toBe('Approve');
    const crit = all('L', 'L');
    crit[2] = entry('H', 'H');
    expect(assess(crit, noFlags).recommendation).toBe('Deny');
    expect(assess(crit, noFlags).reasons).toEqual(['Privacy breach or data misuse: Critical with no mitigation']);
    crit[2] = entry('H', 'H', 'Data processing agreement; on-premise storage');
    expect(assess(crit, noFlags).recommendation).toBe('Pilot required');
    const high = all('L', 'L');
    high[1] = entry('M', 'H');
    expect(assess(high, noFlags).recommendation).toBe('Pilot required');
    high[1] = entry('M', 'H', 'Disaggregated pilot metrics');
    expect(assess(high, noFlags).recommendation).toBe('Approve with conditions');
    // a medium risk on its own does not add conditions; a red flag does
    const med = all('M', 'M');
    expect(assess(med, noFlags).recommendation).toBe('Approve');
    const flags = [...noFlags];
    flags[3] = true;
    const f = assess(med, flags);
    expect(f.recommendation).toBe('Approve with conditions');
    expect(f.redFlags).toEqual(['Bias testing: No bias testing conducted; refuses to share results']);
    expect(f.reasons).toEqual(['Vendor red flag — Bias testing: No bias testing conducted; refuses to share results']);
  });
  it('a whitespace-only mitigation does not count as one', () => {
    const e = all('L', 'L');
    e[0] = entry('H', 'H', '   ');
    expect(assess(e, noFlags).recommendation).toBe('Deny');
  });
  it('exports Markdown with the recommendation, reasons, table and flags', () => {
    const e = all('L', 'M');
    e[5] = entry('M', 'H', 'Alternative access route');
    const flags = [...noFlags];
    flags[12] = true;
    const md = toMarkdown('Reader X', assess(e, flags));
    expect(md).toContain('# AI impact assessment — risk worksheet: Reader X');
    expect(md).toContain('Recommendation: **Approve with conditions**');
    expect(md).toContain('| Access barriers for some students | Medium | High | High | Alternative access route |');
    expect(md).toContain('| Inaccurate recommendations or assessments | Low | Medium | Low | — |');
    expect(md).toContain('Vendor red flags: 1');
    expect(md).toContain('- Accessibility: No accessibility testing');
    expect(toMarkdown('', assess(all('L', 'L'), noFlags))).toContain('unnamed tool');
    expect(toMarkdown('', assess(all('L', 'L'), noFlags))).toContain('Vendor red flags: none');
  });
});
