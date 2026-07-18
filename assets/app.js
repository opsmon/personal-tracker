const data = window.readingLogData || {
  year: new Date().getFullYear(),
  summary: { books: 0, courses: 0, events: 0, webinars: 0 },
  activities: []
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const shortMonths = monthNames.map((month) => month.slice(0, 3));

const typeCopy = {
  books: { singular: "Book", className: "book", glyph: "B" },
  courses: { singular: "Course", className: "course", glyph: "C" },
  events: { singular: "Offline event", className: "event", glyph: "E" },
  webinars: { singular: "Webinar", className: "webinar", glyph: "W" }
};

const state = {
  filter: "all",
  query: "",
  monthFilter: null
};

const activityList = document.querySelector("#activityList");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll("[data-filter]");
const monthChart = document.querySelector("#monthChart");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setText(selector, value) {
  document.querySelector(selector).textContent = value;
}

function filteredActivities() {
  return data.activities.filter((activity) => {
    const matchesType = state.filter === "all" || activity.type === state.filter;
    const matchesMonth = !state.monthFilter || activity.month === state.monthFilter;
    const haystack = [
      activity.title,
      activity.meta,
      activity.month,
      activity.date,
      ...activity.links.map((link) => link.label)
    ].join(" ").toLowerCase();

    return matchesType && matchesMonth && haystack.includes(state.query);
  });
}

function renderActivity(activity) {
  const type = typeCopy[activity.type];
  const links = activity.links.map((link) => `
    <a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">
      ${escapeHtml(link.label)}
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg>
    </a>
  `).join("");

  return `
    <article class="activity-card">
      <span class="activity-icon ${type.className}-icon" aria-hidden="true">${type.glyph}</span>
      <div class="activity-body">
        <div class="activity-meta">
          <span class="type-label ${type.className}-text">${type.singular}</span>
          ${activity.date ? `<time>${escapeHtml(activity.date)}</time>` : ""}
        </div>
        <h3>${escapeHtml(activity.title)}</h3>
        ${activity.meta ? `<p>${escapeHtml(activity.meta)}</p>` : ""}
        ${links ? `<div class="activity-links">${links}</div>` : ""}
      </div>
    </article>
  `;
}

function renderTimeline() {
  const activities = filteredActivities();
  const grouped = activities.reduce((groups, activity) => {
    const items = groups.get(activity.month) || [];
    items.push(activity);
    groups.set(activity.month, items);
    return groups;
  }, new Map());

  activityList.innerHTML = monthNames
    .filter((month) => grouped.has(month))
    .map((month) => `
      <section class="month-group" id="month-${month.toLowerCase()}">
        <div class="month-label">
          <span>${month}</span>
          <small>${grouped.get(month).length}</small>
        </div>
        <div class="month-items">
          ${grouped.get(month).map(renderActivity).join("")}
        </div>
      </section>
    `).join("");

  emptyState.hidden = activities.length !== 0;
}

function renderChart() {
  const totals = monthNames.map((month) =>
    data.activities.filter((activity) => activity.month === month).length
  );
  const max = Math.max(...totals, 1);

  monthChart.innerHTML = totals.map((total, index) => {
    const month = monthNames[index];
    const active = state.monthFilter === month;
    const activityLabel = `${total} activit${total === 1 ? "y" : "ies"}`;

    return `
    <button class="chart-column${active ? " is-active" : ""}" type="button" data-month-filter="${month}" aria-pressed="${active}" aria-label="${active ? "Clear" : "Show"} ${month} filter, ${activityLabel}" title="${month}: ${total}">
      <div class="chart-value">${total || ""}</div>
      <div class="chart-track">
        <span style="height: ${total ? Math.max(8, (total / max) * 100) : 3}%"></span>
      </div>
      <small>${shortMonths[index]}</small>
    </button>
  `;
  }).join("");

  const active = totals.filter((total) => total > 0).length;
  if (state.monthFilter) {
    const selectedTotal = totals[monthNames.indexOf(state.monthFilter)] || 0;
    setText("#activeMonths", `Showing ${state.monthFilter}: ${selectedTotal} activit${selectedTotal === 1 ? "y" : "ies"}`);
  } else {
    setText("#activeMonths", `Activity across ${active} month${active === 1 ? "" : "s"}`);
  }
}

function scrollToTimeline() {
  document.querySelector("#timeline").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function initializeSummary() {
  const books = data.summary.books || 0;
  const courses = data.summary.courses || 0;
  const events = data.summary.events || 0;
  const webinars = data.summary.webinars || 0;
  const total = books + courses + events + webinars;

  setText("#yearLabel", data.year);
  setText("#booksCount", books);
  setText("#coursesCount", courses);
  setText("#eventsCount", events);
  setText("#webinarsCount", webinars);
  setText("#totalCount", total);
  setText("#allBadge", total);
  setText("#booksBadge", books);
  setText("#coursesBadge", courses);
  setText("#eventsBadge", events);
  setText("#webinarsBadge", webinars);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderTimeline();
  });
});

monthChart.addEventListener("click", (event) => {
  const button = event.target.closest("[data-month-filter]");
  if (!button) return;

  state.monthFilter = state.monthFilter === button.dataset.monthFilter
    ? null
    : button.dataset.monthFilter;

  renderChart();
  renderTimeline();
  scrollToTimeline();
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  renderTimeline();
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

initializeSummary();
renderChart();
renderTimeline();
