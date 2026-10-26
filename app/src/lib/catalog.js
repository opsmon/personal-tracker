export const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const typeCopy = {
  books: { label: "Books", singular: "Book", className: "book", glyph: "B", statLabel: "Books read" },
  courses: { label: "Courses", singular: "Course", className: "course", glyph: "C", statLabel: "Courses completed" },
  events: { label: "Offline events", singular: "Offline event", className: "event", glyph: "E", statLabel: "Offline events" },
  webinars: { label: "Webinars", singular: "Webinar", className: "webinar", glyph: "W", statLabel: "Webinars" }
};

export const typeKeys = Object.keys(typeCopy);

export function pluralize(word, count) {
  if (word === "activity") return count === 1 ? "activity" : "activities";
  return count === 1 ? word : `${word}s`;
}

export function summarize(activities) {
  return Object.fromEntries(typeKeys.map((type) => [type, activities.filter((item) => item.type === type).length]));
}

export function groupByMonth(activities) {
  return Object.fromEntries(monthNames.map((month) => [month, activities.filter((item) => item.month === month)]));
}

export function filterActivities(activities, { filter = "all", month = null, query = "" } = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  return activities.filter((activity) => {
    const haystack = [activity.title, activity.meta, activity.month, activity.date,
      ...activity.links.map((link) => link.label)].join(" ").toLowerCase();
    return (filter === "all" || activity.type === filter)
      && (!month || activity.month === month)
      && haystack.includes(normalizedQuery);
  });
}

// Generated local URLs are relative to the site's public directory, not the Markdown file.
export function assetUrl(url, base = import.meta.env.BASE_URL) {
  return /^(https?:|mailto:)/i.test(url) ? url : `${base}${url}`;
}
