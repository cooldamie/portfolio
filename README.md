# damiecodes.com

Portfolio of Damilola Iranloye: full-stack engineer and IT consultant for banking, risk and operations platforms.

Static site built with [Astro](https://astro.build), hosted on Azure Static Web Apps, deployed by GitHub Actions. Every pull request gets its own preview URL, and the end-to-end, accessibility and Lighthouse checks run against that preview before anything can merge.

## Run it

Requires Node 24 (`.nvmrc`).

```bash
nvm use
```

```bash
npm install
```

```bash
npm run dev
```

## Scripts

| Script              | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `npm run dev`       | Local dev server on http://localhost:4321                   |
| `npm run build`     | Production build into `dist/`, then checks the size budgets |
| `npm run preview`   | Serves `dist/` locally                                      |
| `npm run lint`      | ESLint and Prettier                                         |
| `npm run typecheck` | `astro check` (TypeScript, strictest settings)              |
| `npm test`          | Unit tests with coverage (80% minimum on `src/lib`)         |
| `npm run test:e2e`  | Playwright: journeys, axe accessibility, theme, headers     |
| `npm run lhci`      | Lighthouse CI against the local build                       |

## Quality gates

Every pull request must pass all three jobs in `.github/workflows/site.yml`:

1. **Lint, test and build**: lint, types, unit tests, build, size budgets.
2. **Deploy**: uploads the build to a preview environment and comments its URL on the PR.
3. **E2E, accessibility and Lighthouse**: Playwright on Chromium, Firefox, WebKit, Pixel 7 and iPhone 15 against the preview, axe with WCAG 2.2 AA rules, security headers, then Lighthouse.

Budgets (from the plan):

| Metric              | Budget                         |
| ------------------- | ------------------------------ |
| Lighthouse          | Performance 95, all others 100 |
| LCP (mobile, lab)   | 2.0 s                          |
| CLS                 | 0.05                           |
| Total blocking time | 150 ms                         |
| JavaScript          | 40 kB gzip                     |
| CSS                 | 25 kB gzip                     |
| Preloaded fonts     | 140 kB                         |

Notes:

- The font budget is 140 kB rather than the plan's 120 kB. Archivo with its width axis is 90 kB on its own, and the width axis is what gives Blueprint its headlines.
- Lighthouse's `canonical` audit is off because previews live on a different host from the canonical `damiecodes.com` URL by design.
- Security headers only exist on Azure, so `tests/e2e/headers.spec.ts` is skipped locally.

## One-time GitHub setup

1. Create the repository under your **personal** GitHub account and push `main`.
2. Add the `SWA_TOKEN` secret (see the `infra` repo README, step 5).
3. **Settings → Rules → Rulesets → New ruleset → Import a ruleset**, and choose `.github/rulesets/main.json`. It requires the three checks above, squash merges, linear history, and blocks force-pushes and deletion of `main`.
4. **Settings → Code security**: turn on Dependabot alerts, secret scanning with push protection, and CodeQL default setup.

## Content rules

- No client names, data, internal URLs or screenshots. Describe client work by sector and size.
- Facts used on many pages (name, availability, links) live in `src/site.config.ts`.
