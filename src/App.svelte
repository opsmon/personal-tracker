<script>
  import { onMount } from "svelte";
  import data from "./data.json";

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const typeCopy = {
    books: { label: "Books", singular: "Book", className: "book", glyph: "B", statLabel: "Books read" },
    courses: { label: "Courses", singular: "Course", className: "course", glyph: "C", statLabel: "Courses completed" },
    events: { label: "Offline events", singular: "Offline event", className: "event", glyph: "E", statLabel: "Offline events" },
    webinars: { label: "Webinars", singular: "Webinar", className: "webinar", glyph: "W", statLabel: "Webinars" }
  };

  const filters = ["all", "books", "courses", "events", "webinars"];
  const typeKeys = ["books", "courses", "events", "webinars"];
  const shortMonths = monthNames.map((month) => month.slice(0, 3));

  let filter = "all";
  let query = "";
  let monthFilter = null;
  let searchInput;

  $: summary = data.summary || {};
  $: total = typeKeys.reduce((sum, key) => sum + (summary[key] || 0), 0);
  $: normalizedQuery = query.trim().toLowerCase();
  $: filteredActivities = data.activities.filter((activity) => {
    const matchesType = filter === "all" || activity.type === filter;
    const matchesMonth = !monthFilter || activity.month === monthFilter;
    const haystack = [
      activity.title,
      activity.meta,
      activity.month,
      activity.date,
      ...activity.links.map((link) => link.label)
    ].join(" ").toLowerCase();

    return matchesType && matchesMonth && haystack.includes(normalizedQuery);
  });
  $: activitiesByMonth = monthNames.reduce((groups, month) => {
    groups[month] = filteredActivities.filter((activity) => activity.month === month);
    return groups;
  }, {});
  $: monthTotals = monthNames.map((month) =>
    data.activities.filter((activity) => activity.month === month).length
  );
  $: maxMonthTotal = Math.max(...monthTotals, 1);
  $: activeMonthCount = monthTotals.filter((count) => count > 0).length;
  $: activeMonthsLabel = monthFilter
    ? `Showing ${monthFilter}: ${monthTotals[monthNames.indexOf(monthFilter)] || 0} ${pluralize("activity", monthTotals[monthNames.indexOf(monthFilter)] || 0)}`
    : `Activity across ${activeMonthCount} ${pluralize("month", activeMonthCount)}`;

  function pluralize(word, count) {
    if (word === "activity") return count === 1 ? "activity" : "activities";
    return count === 1 ? word : `${word}s`;
  }

  function badgeFor(filterName) {
    if (filterName === "all") return total;
    return summary[filterName] || 0;
  }

  function toggleMonth(month) {
    monthFilter = monthFilter === month ? null : month;
    document.querySelector("#timeline")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  onMount(() => {
    function handleKeydown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput?.focus();
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  });
</script>

<header class="topbar">
  <a class="brand" href="./" aria-label="Reading Log home">
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H12v17H7.5A2.5 2.5 0 0 0 5 22V5.5Z" />
        <path d="M19 5.5A2.5 2.5 0 0 0 16.5 3H12v17h4.5A2.5 2.5 0 0 1 19 22V5.5Z" />
      </svg>
    </span>
    <strong>Reading Log</strong>
  </a>

  <nav aria-label="Primary navigation">
    <a href="#overview">Overview</a>
    <a href="#timeline">Timeline</a>
    <a class="github-link" href="https://github.com/opsmon/personal-tracker" target="_blank" rel="noreferrer">
      GitHub
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>
    </a>
  </nav>
</header>

<main>
  <section class="hero" id="overview" aria-labelledby="page-title">
    <div class="hero-glow" aria-hidden="true"></div>
    <p class="eyebrow">Personal activity tracker · <span>{data.year}</span></p>
    <h1 id="page-title">Learning,<br><span>tracked.</span></h1>
    <p class="lead">
      Books that shaped my thinking, courses that sharpened my skills,
      offline events and webinars that kept me connected.
    </p>

    <div class="stats" aria-label="Yearly activity summary">
      {#each typeKeys as type}
        <article class="stat">
          <span class="stat-icon {typeCopy[type].className}s-icon" aria-hidden="true">{typeCopy[type].glyph}</span>
          <div><strong>{summary[type] || 0}</strong><span>{typeCopy[type].statLabel}</span></div>
        </article>
      {/each}
      <article class="stat total-stat">
        <span class="stat-icon total-icon" aria-hidden="true">Σ</span>
        <div><strong>{total}</strong><span>Total activities</span></div>
      </article>
    </div>
  </section>

  <section class="pulse" aria-labelledby="pulse-title">
    <div class="section-heading">
      <div>
        <p class="section-kicker">Year at a glance</p>
        <h2 id="pulse-title">A steady learning pulse.</h2>
      </div>
      <p>{activeMonthsLabel}</p>
    </div>
    <div class="chart" aria-label="Activities per month">
      {#each monthNames as month, index}
        {@const totalForMonth = monthTotals[index]}
        {@const isActive = monthFilter === month}
        <button
          class:is-active={isActive}
          class="chart-column"
          type="button"
          aria-pressed={isActive}
          aria-label="{isActive ? 'Clear' : 'Show'} {month} filter, {totalForMonth} {pluralize('activity', totalForMonth)}"
          title="{month}: {totalForMonth}"
          onclick={() => toggleMonth(month)}
        >
          <div class="chart-value">{totalForMonth || ""}</div>
          <div class="chart-track">
            <span style:height={`${totalForMonth ? Math.max(8, (totalForMonth / maxMonthTotal) * 100) : 3}%`}></span>
          </div>
          <small>{shortMonths[index]}</small>
        </button>
      {/each}
    </div>
  </section>

  <section class="glossary" aria-labelledby="glossary-title">
    <div class="section-heading">
      <div>
        <p class="section-kicker">Glossary / Глоссарий</p>
        <h2 id="glossary-title">What counts as a course.</h2>
      </div>
    </div>
    <div class="glossary-grid">
      <article>
        <h3>Courses</h3>
        <p>
          All learning programs I complete or intentionally work through:
          personal growth, refreshing fundamentals, testing educational
          materials at people's request, evaluating platforms, and keeping
          practical skills current.
        </p>
      </article>
      <article lang="ru">
        <h3>Курсы</h3>
        <p>
          Все учебные программы, которые я прохожу или осознанно разбираю:
          для личного развития, чтобы вспомнить базовые вещи, протестировать
          учебные материалы по просьбам людей, оценить платформы и поддерживать
          практические навыки в актуальном состоянии.
        </p>
      </article>
    </div>
  </section>

  <section class="timeline-section" id="timeline" aria-labelledby="timeline-title">
    <div class="section-heading timeline-heading">
      <div>
        <p class="section-kicker">Activity</p>
        <h2 id="timeline-title">The year in detail.</h2>
      </div>
      <label class="search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.75"></circle>
          <path d="m16 16 4.25 4.25"></path>
        </svg>
        <span class="sr-only">Search activities</span>
        <input bind:this={searchInput} bind:value={query} type="search" placeholder="Search titles, authors, providers…" autocomplete="off">
      </label>
    </div>

    <div class="filters" role="group" aria-label="Filter activities">
      {#each filters as filterName}
        <button
          class:is-active={filter === filterName}
          class="filter"
          type="button"
          aria-pressed={filter === filterName}
          onclick={() => filter = filterName}
        >
          {filterName === "all" ? "All" : typeCopy[filterName].label}
          <span>{badgeFor(filterName)}</span>
        </button>
      {/each}
    </div>

    <div class="timeline" aria-live="polite">
      {#each monthNames as month}
        {@const activities = activitiesByMonth[month]}
        {#if activities.length}
          <section class="month-group" id="month-{month.toLowerCase()}">
            <div class="month-label">
              <span>{month}</span>
              <small>{activities.length}</small>
            </div>
            <div class="month-items">
              {#each activities as activity}
                {@const type = typeCopy[activity.type]}
                <article class="activity-card">
                  <span class="activity-icon {type.className}-icon" aria-hidden="true">{type.glyph}</span>
                  <div class="activity-body">
                    <div class="activity-meta">
                      <span class="type-label {type.className}-text">{type.singular}</span>
                      {#if activity.date}
                        <time>{activity.date}</time>
                      {/if}
                    </div>
                    <h3>{activity.title}</h3>
                    {#if activity.meta}
                      <p>{activity.meta}</p>
                    {/if}
                    {#if activity.links.length}
                      <div class="activity-links">
                        {#each activity.links as link}
                          <a href={link.url} target="_blank" rel="noreferrer">
                            {link.label}
                            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>
                          </a>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </article>
              {/each}
            </div>
          </section>
        {/if}
      {/each}
    </div>
    {#if filteredActivities.length === 0}
      <p class="empty">No matching activities found.</p>
    {/if}
  </section>
</main>

<footer>
  <p><strong>Reading Log</strong> · Small steps, compounded.</p>
  <a href="https://github.com/opsmon/personal-tracker" target="_blank" rel="noreferrer">View source on GitHub</a>
</footer>

<style>
:global(:root) {
  color-scheme: light;
  --bg: #f5f5f7;
  --surface: #ffffff;
  --text: #1d1d1f;
  --muted: #6e6e73;
  --subtle: #86868b;
  --line: rgba(0, 0, 0, 0.08);
  --blue: #0071e3;
  --book: #0071e3;
  --course: #8944ab;
  --event: #d35f00;
  --webinar: #bf3f6c;
  --green: #248a3d;
  --radius-xl: 30px;
  --radius-lg: 22px;
}

:global(*) {
  box-sizing: border-box;
}

:global(html) {
  scroll-behavior: smooth;
  background: var(--bg);
}

:global(body) {
  min-width: 320px;
  margin: 0;
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  line-height: 1.47;
  -webkit-font-smoothing: antialiased;
}

:global(button),
:global(input) {
  font: inherit;
}

:global(a) {
  color: inherit;
}

:global(svg) {
  display: block;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 max(24px, calc((100vw - 1180px) / 2));
  border-bottom: 1px solid var(--line);
  background: rgba(250, 250, 252, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 17px;
  letter-spacing: -0.03em;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border-radius: 9px;
  background: var(--text);
  color: #fff;
}

.brand-mark svg {
  width: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.topbar nav {
  display: flex;
  align-items: center;
  gap: 27px;
}

.topbar nav a {
  color: #424245;
  font-size: 13px;
  text-decoration: none;
}

.topbar nav a:hover {
  color: var(--blue);
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.github-link svg,
.activity-links svg {
  width: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

main,
footer {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
}

.hero {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: 670px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0 75px;
  overflow: hidden;
  text-align: center;
}

.hero-glow {
  position: absolute;
  z-index: -1;
  top: -310px;
  left: 50%;
  width: 850px;
  height: 700px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 33% 65%, rgba(0, 113, 227, 0.2), transparent 49%),
    radial-gradient(circle at 68% 58%, rgba(175, 82, 222, 0.17), transparent 47%);
  filter: blur(18px);
  transform: translateX(-50%);
}

.eyebrow,
.section-kicker {
  margin: 0;
  color: var(--blue);
  font-size: 14px;
  font-weight: 650;
}

h1 {
  margin: 15px 0 0;
  font-size: clamp(60px, 9vw, 108px);
  font-weight: 700;
  line-height: 0.87;
  letter-spacing: -0.075em;
}

h1 span {
  color: var(--blue);
}

.lead {
  max-width: 650px;
  margin: 30px 0 0;
  color: var(--muted);
  font-size: clamp(18px, 2vw, 22px);
  letter-spacing: -0.025em;
}

.stats {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 60px;
}

.stat {
  display: flex;
  min-height: 112px;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.055);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  text-align: left;
  backdrop-filter: blur(20px);
}

.stat-icon,
.activity-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-weight: 700;
}

.stat-icon {
  width: 43px;
  height: 43px;
  border-radius: 13px;
  font-size: 12px;
}

.books-icon,
.book-icon {
  background: #e8f2ff;
  color: var(--book);
}

.courses-icon,
.course-icon {
  background: #f3eafb;
  color: var(--course);
}

.events-icon,
.event-icon {
  background: #fff0df;
  color: var(--event);
}

.webinars-icon,
.webinar-icon {
  background: #fdebf2;
  color: var(--webinar);
}

.total-icon {
  background: #e9f7ec;
  color: var(--green);
}

.stat strong,
.stat span {
  display: block;
}

.stat strong {
  font-size: 27px;
  line-height: 1;
  letter-spacing: -0.04em;
}

.stat div > span {
  margin-top: 6px;
  color: var(--subtle);
  font-size: 12px;
}

.pulse,
.glossary,
.timeline-section {
  padding: 95px 0 20px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 30px;
}

.section-heading h2 {
  margin: 5px 0 0;
  font-size: clamp(35px, 4.5vw, 52px);
  line-height: 1.04;
  letter-spacing: -0.05em;
}

.section-heading > p {
  margin: 0 0 5px;
  color: var(--subtle);
  font-size: 13px;
}

.chart {
  display: grid;
  min-height: 285px;
  grid-template-columns: repeat(12, minmax(26px, 1fr));
  gap: clamp(7px, 1.4vw, 18px);
  align-items: end;
  padding: 35px 30px 25px;
  border: 1px solid rgba(0, 0, 0, 0.055);
  border-radius: var(--radius-xl);
  background: var(--surface);
}

.chart-column {
  display: grid;
  height: 220px;
  grid-template-rows: 20px 1fr 20px;
  gap: 8px;
  align-items: end;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: center;
}

.chart-column:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 6px;
}

.chart-value {
  min-height: 20px;
  color: var(--muted);
  font-size: 11px;
}

.chart-track {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: #f1f1f3;
}

.chart-track span {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 8px;
  background: linear-gradient(180deg, #49a5ff, var(--blue));
}

.chart-column:hover .chart-track,
.chart-column.is-active .chart-track {
  background: #e6f2ff;
}

.chart-column.is-active .chart-track {
  box-shadow: inset 0 0 0 2px var(--blue);
}

.chart-column.is-active small {
  color: var(--blue);
  font-weight: 700;
}

.chart-column small {
  color: var(--subtle);
  font-size: 10px;
  text-transform: uppercase;
}

.timeline-section {
  padding-bottom: 110px;
}

.glossary {
  padding-top: 85px;
}

.glossary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.glossary-grid article {
  min-height: 170px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.055);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.glossary-grid h3 {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.glossary-grid p {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.timeline-heading {
  align-items: center;
}

.search {
  display: flex;
  width: min(360px, 100%);
  min-height: 48px;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 15px;
  background: #fff;
}

.search svg {
  width: 19px;
  margin-left: 15px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--subtle);
  stroke-linecap: round;
  stroke-width: 1.8;
}

.search input {
  width: 100%;
  min-width: 0;
  padding: 0 14px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 7px;
  margin-bottom: 28px;
  overflow-x: auto;
}

.filter {
  display: inline-flex;
  min-height: 37px;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  border: 0;
  border-radius: 18px;
  background: #e9e9ed;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.filter span {
  font-size: 10px;
  opacity: 0.72;
}

.filter.is-active {
  background: var(--text);
  color: #fff;
}

.timeline {
  display: grid;
  gap: 34px;
}

.month-group {
  display: grid;
  grid-template-columns: 125px minmax(0, 1fr);
  gap: 24px;
}

.month-label {
  position: sticky;
  top: 84px;
  display: flex;
  height: fit-content;
  align-items: center;
  justify-content: space-between;
  padding: 10px 2px;
  color: var(--text);
  font-size: 14px;
  font-weight: 650;
}

.month-label small {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border-radius: 50%;
  background: #e9e9ed;
  color: var(--muted);
  font-size: 10px;
}

.month-items {
  display: grid;
  gap: 10px;
}

.activity-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18px;
  padding: 23px;
  border: 1px solid rgba(0, 0, 0, 0.055);
  border-radius: var(--radius-lg);
  background: var(--surface);
  transition: box-shadow 170ms ease, transform 170ms ease;
}

.activity-card:hover {
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.07);
  transform: translateY(-2px);
}

.activity-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  font-size: 11px;
}

.activity-body {
  min-width: 0;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 9px;
}

.type-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.book-text {
  color: var(--book);
}

.course-text {
  color: var(--course);
}

.event-text {
  color: var(--event);
}

.webinar-text {
  color: var(--webinar);
}

.activity-meta time {
  color: var(--subtle);
  font-size: 11px;
}

.activity-body h3 {
  margin: 7px 0 0;
  font-size: 18px;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.activity-body p {
  margin: 7px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.activity-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 13px;
}

.activity-links a {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--blue);
  font-size: 12px;
  text-decoration: none;
}

.empty {
  padding: 65px 20px;
  border-radius: var(--radius-lg);
  background: #fff;
  color: var(--muted);
  text-align: center;
}

footer {
  display: flex;
  min-height: 110px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-top: 1px solid var(--line);
  color: var(--subtle);
  font-size: 12px;
}

footer p {
  margin: 0;
}

footer strong {
  color: var(--text);
}

footer a {
  text-decoration: none;
}

footer a:hover {
  color: var(--blue);
}

@media (max-width: 850px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart {
    overflow-x: auto;
  }

  .chart-column {
    min-width: 30px;
  }
}

@media (max-width: 680px) {
  .topbar {
    padding: 0 16px;
  }

  .topbar nav {
    gap: 17px;
  }

  .topbar nav a:first-child {
    display: none;
  }

  main,
  footer {
    width: min(100% - 28px, 1180px);
  }

  .hero {
    min-height: 690px;
    padding-top: 80px;
  }

  h1 {
    font-size: clamp(62px, 20vw, 90px);
  }

  .stats {
    grid-template-columns: 1fr 1fr;
    margin-top: 45px;
  }

  .stat {
    min-height: 105px;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .timeline-heading .search {
    width: 100%;
  }

  .glossary-grid {
    grid-template-columns: 1fr;
  }

  .month-group {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .month-label {
    position: static;
    justify-content: flex-start;
    gap: 9px;
  }

  .activity-card {
    padding: 18px;
  }

  footer {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
  }
}

@media (max-width: 420px) {
  .brand strong {
    display: none;
  }

  .stats {
    gap: 8px;
  }

  .stat {
    padding: 16px;
  }

  .activity-card {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  :global(html) {
    scroll-behavior: auto;
  }

  :global(*),
  :global(*::before),
  :global(*::after) {
    transition-duration: 0.01ms !important;
  }
}

</style>
