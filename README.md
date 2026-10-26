# Personal Tracker

A personal log of books, courses, offline events and webinars, published at
<https://opsmon.github.io/personal-tracker/>.

```text
content/    # Activity logs by category and year
app/        # Website, certificates, tests, scripts and all Node.js tooling
.github/    # PR checks and GitHub Pages workflow
```

## Updating the tracker

Edit the yearly Markdown files in [`content/`](content/):
[books](content/books/), [courses](content/courses/),
[offline events](content/events/) or [webinars](content/webinars/).

Store certificate PDFs in [`app/public/certificates/`](app/public/certificates/)
under the matching year. See [the website guide](app/README.md) for the log
format, certificate links, development commands and verification.

## Running the website

```bash
cd app
nvm use
npm ci
npm run dev
```

Open <http://127.0.0.1:5173/personal-tracker/>. Building, tests, dependencies,
generated data and reports all run inside `app/`.
