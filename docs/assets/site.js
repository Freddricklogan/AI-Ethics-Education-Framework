/** Mounts the Executive Shell on every page of the docs site. */
import { mountExecShell } from './shell/exec-shell.js';

const shell = mountExecShell({
  title: 'AI Ethics in Education Framework',
  tagline: 'Ethical principles, a bias-assessment framework, deployment guidelines, an AI-literacy curriculum and an impact-assessment template for AI in educational settings — published as a documentation site, with the template\'s risk section implemented as a worksheet that produces a recommendation.',
  repo: 'https://github.com/Freddricklogan/AI-Ethics-Education-Framework',
  pagesUrl: 'https://freddricklogan.github.io/AI-Ethics-Education-Framework/',
  badges: [{ label: 'MkDocs', tone: 'accent' }, { label: 'Risk worksheet', dot: true }, { label: '5 framework documents', dot: true }],
  kpis: [
    { label: 'Documents', compute: () => 5, tone: 'accent' },
    { label: 'Risks rated', compute: () => 6 },
    { label: 'Vendor red flags', compute: () => 14, tone: 'warn' },
    { label: 'Recommendations', compute: () => 5, tone: 'ok' }
  ],
  tour: [
    { selector: '.md-content', title: 'A framework you can read', body: 'Ethical principles, bias assessment, responsible deployment, an AI-literacy curriculum and the impact-assessment template — rendered as a site with search and navigation.' },
    { selector: '.md-content', title: 'A template you can run', body: 'The Tools page turns Section 5.2 of the impact assessment into a worksheet: six risks rated for likelihood and impact, fourteen vendor red flags, and one of the template\'s five recommendations with the reasons listed.', action: () => { if (!location.pathname.includes('/tools/')) location.href = new URL('tools/risk-worksheet/', document.baseURI).href; } }
  ],
  mainSelector: '.md-main'
});
shell.refreshKpis();
