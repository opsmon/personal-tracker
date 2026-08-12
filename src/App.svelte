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

  function groupedByMonth(month) {
    return filteredActivities.filter((activity) => activity.month === month);
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
        {@const activities = groupedByMonth(month)}
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
