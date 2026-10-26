# Tracker website

All website implementation and tooling live in this directory. The activity
logs remain in [`../content/`](../content/).

```text
src/components/          # Dashboard sections and activity cards
src/lib/                 # Shared catalog, filters and public URL handling
src/styles/              # Dashboard styles
src/generated/           # Generated JSON; ignored by Git
public/certificates/     # Original certificate PDFs, organized by year
scripts/                 # Data generation and isolated preview verification
tests/                   # Parser and browser tests, including Playwright config
package.json             # All npm commands and dependencies
package-lock.json
.nvmrc                   # Node.js version
vite.config.js
index.html
```

Dependencies, build output, caches and reports also stay here:
`node_modules/`, `dist/`, `.vite/`, `test-results/` and `playwright-report/` are
ignored by Git. CI uses `app/` as its working directory and publishes `app/dist/`.

## Development

Use Node.js 24 or newer (`nvm use`), then:

```bash
npm ci
npm run dev
```

Open <http://127.0.0.1:5173/personal-tracker/>. Markdown edits regenerate the
activity data automatically. Invalid dates, month headings or missing local
certificate files produce an error with the source file and line number.

## Updating the tracker

From the repository root, edit `content/<category>/<year>.md`. To add another year, create the same yearly
file in any category; the dashboard discovers years and shows a year selector.

Put certificates in `app/public/certificates/<year>/` and link them from the log
using a real repository-relative path, for example:

```markdown
- ML in production (22.10.2026) - Cloud.ru - [certificate](../../app/public/certificates/2026/Cloud.ru_Certificate_Sergey_Frolov_ML_in_Production_EN.pdf)
```

The link opens on GitHub and becomes `/personal-tracker/certificates/...` on the
website. Match the exact filename, including punctuation and capitalization.
PDFs are copied unchanged to the published site.

Courses include all learning programs I complete or intentionally work through:
personal growth, refreshing fundamentals, testing educational materials at
people's request, evaluating platforms, and keeping practical skills current.

## Verification and publishing

```bash
npm test
npm run build
npm run smoke
npx playwright install chromium
npm run test:browser
npm run preview
```

Run all commands above from `app/`. The build generates data automatically; `npm run data` also validates and
regenerates it independently. `npm run smoke` starts an isolated production
preview, checks built assets and every local PDF, and compares served PDF
SHA-256 checksums with the originals. Browser tests exercise search, filters,
keyboard focus, certificate links and a mobile viewport.

PRs run these checks and attach the verified static site, its candidate commit,
file checksums and a mobile screenshot as an Actions artifact. Only `main`
deploys to GitHub Pages, after validation; PRs never deploy to production.
Enable `Settings → Pages → GitHub Actions` for publishing.

The default deployment path is `/personal-tracker/`. For another host, set the
same `SITE_BASE_PATH` for build and preview:

```bash
SITE_BASE_PATH=/ npm run build
SITE_BASE_PATH=/ npm run preview
```
