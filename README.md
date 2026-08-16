# Activity Tracker

My personal tracker for learning and professional activities. Helps me understand my own yearly activity: how many books I've read, courses completed, and events attended.

## Website

The visual dashboard is published at:
<https://opsmon.github.io/personal-tracker/>

GitHub Actions rebuilds the site from the Markdown logs after every push to
`main`. To preview the generated data locally:

```bash
ruby scripts/build_data.rb
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Structure

This repository is organized by activity type:

- **[books/](books/)** - Books I've read
- **[courses/](courses/)** - Online courses and training I've completed
- **[events/](events/)** - Offline conferences, meetups, workshops, and other events
- **[webinars/](webinars/)** - Online webinars and streamed events

Each category contains yearly markdown files tracking activities by month.

## Glossary

**Courses** means all learning programs I complete or intentionally work
through: for personal growth, refreshing fundamentals, testing educational
materials at people's request, evaluating platforms, or keeping practical
skills current.

## Publishing

For the first deployment, open `Settings` → `Pages` in the GitHub repository
and select `GitHub Actions` as the source. Future updates are automatic.
