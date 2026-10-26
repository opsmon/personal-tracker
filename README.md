# Personal Tracker

A personal log of books, courses, offline events and webinars, published at
<https://opsmon.github.io/personal-tracker/>.

## Repository layout

```text
content/                     # Source of truth: Markdown logs by category and year
  books/2026.md
  courses/2026.md
  events/2026.md
  webinars/2026.md
app/
  src/components/            # Dashboard sections and activity cards
  src/lib/                   # Shared catalog, filters and public URL handling
  src/styles/                # Dashboard styles
  src/generated/             # Generated activity data; ignored by Git
  public/certificates/2026/   # Original certificate PDFs, organized by year
  index.html
  vite.config.js
scripts/                     # Data generation and production preview verification
tests/                      # Parser tests and browser smoke tests
.github/workflows/           # PR validation and GitHub Pages deployment
```

`node_modules/`, `dist/`, caches and generated JSON are local outputs, excluded
from version control. Root files contain only project documentation and tooling.

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

Edit `content/<category>/<year>.md`. To add another year, create the same yearly
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

The build generates data automatically; `npm run data` also validates and
regenerates it independently. `npm run smoke` starts an isolated production
preview, checks built assets and every local PDF, and compares served PDF
SHA-256 checksums with the originals. Browser tests exercise search, filters,
keyboard focus, certificate links and a mobile viewport.

PRs run these checks and attach the verified static site, its candidate commit,
file checksums and a mobile screenshot as an Actions artifact. Only `main`
deploys to GitHub Pages, after validation; PRs never deploy to production.
Enable `Settings → Pages → GitHub Actions` for publishing.

The default deployment path is `/personal-tracker/`. For another host, set the
same `SITE_BASE_PATH` for build and preview, for example `SITE_BASE_PATH=/ npm run
build` and `SITE_BASE_PATH=/ npm run preview`.
