import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildData, parseLog, repositoryRoot } from "../scripts/lib/activity-data.mjs";
import { assetUrl, filterActivities, summarize } from "../app/src/lib/catalog.js";

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "tracker-data-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const publicDirectory = path.join(root, "app/public");
  const sourcePath = path.join(root, "content/courses/2026.md");
  mkdirSync(path.join(publicDirectory, "certificates/2026"), { recursive: true });
  writeFileSync(path.join(publicDirectory, "certificates/2026/Cloud.ru certificate.pdf"), "%PDF-1.7");
  return { root, type: "courses", year: 2026, sourcePath, publicDirectory };
}

test("Markdown certificate links become public URLs and preserve provider metadata", (t) => {
  const options = fixture(t);
  const entries = parseLog("# 2026\n### October\n- ML systems - Cloud.ru - [certificate](../../app/public/certificates/2026/Cloud.ru%20certificate.pdf)\n", options);
  assert.equal(entries[0].title, "ML systems");
  assert.equal(entries[0].meta, "Cloud.ru");
  assert.equal(entries[0].links[0].url, "certificates/2026/Cloud.ru%20certificate.pdf");
  assert.equal(assetUrl(entries[0].links[0].url, "/personal-tracker/"), "/personal-tracker/certificates/2026/Cloud.ru%20certificate.pdf");
  assert.equal(assetUrl(entries[0].links[0].url, "/"), "/certificates/2026/Cloud.ru%20certificate.pdf");
  assert.equal(assetUrl("https://example.com/cert.pdf", "/personal-tracker/"), "https://example.com/cert.pdf");
});

test("filename mismatch, private files and unsupported schemes fail with the source line", (t) => {
  const options = fixture(t);
  for (const url of ["../../app/public/certificates/2026/Cloud_ru.pdf", "../../app/public/certificates/2026/cloud.ru%20certificate.pdf", "../../package.json", "javascript:alert", "//example.com/file"]) {
    assert.throws(() => parseLog(`# 2026\n### October\n- ML - [certificate](${url})`, options), /2026\.md:3:/);
  }
});

test("date ranges, titles, authors, empty placeholders and external links survive parsing", (t) => {
  const options = fixture(t);
  const [event] = parseLog("# 2026\n### October\n- **Conference** (22.10.2026 – 24.10.2026) - Moscow - [talk](https://example.com/talk)\n- \n", { ...options, type: "events" });
  assert.equal(event.title, "Conference");
  assert.equal(event.date, "22.10.2026 – 24.10.2026");
  assert.equal(event.meta, "Moscow");
  const [book] = parseLog("# 2026\n### January\n- Book: A - B (01.01.2026) - First Author, Second Author", { ...options, type: "books" });
  assert.equal(book.title, "Book: A - B");
  assert.equal(book.meta, "First Author, Second Author");
});

test("invalid headings and dates cannot silently drop or misgroup records", (t) => {
  const options = fixture(t);
  for (const text of ["# 2025\n### October\n- Course", "# 2026\n### Octber\n- Course", "# 2026\n- Course", "# 2026\n### October\n- Course (31.02.2026)", "# 2026\n### October\n- Course (01.09.2026)"]) {
    assert.throws(() => parseLog(text, options));
  }
});

test("all yearly files are discovered and output is deterministic", (t) => {
  const { root } = fixture(t);
  for (const type of ["books", "courses", "events", "webinars"]) {
    mkdirSync(path.join(root, "content", type), { recursive: true });
  }
  writeFileSync(path.join(root, "content/courses/2026.md"), "# 2026\n### October\n- Course (24.10.2026) - Provider");
  writeFileSync(path.join(root, "content/books/2027.md"), "# 2027\n### January\n- Book - Author");
  const data = buildData(root);
  assert.deepEqual(data.years, [2027, 2026]);
  assert.equal(data.year, 2027);
  assert.equal(data.activities.length, 2);
  const output = path.join(root, "app/src/generated/activities.json");
  const before = readFileSync(output, "utf8");
  buildData(root);
  assert.equal(readFileSync(output, "utf8"), before);
});

test("repository data validates; search and category/month filters combine", () => {
  const { activities } = buildData(repositoryRoot);
  assert.ok(activities.length > 0);
  assert.equal(Object.values(summarize(activities)).reduce((a, b) => a + b, 0), activities.length);
  const cloudCourses = filterActivities(activities, { filter: "courses", month: "October", query: "  CLOUD.RU " });
  assert.ok(cloudCourses.some((activity) => activity.title === "ML in production"));
  assert.ok(cloudCourses.every((activity) => activity.type === "courses" && activity.month === "October"));
  assert.deepEqual(filterActivities(activities, { query: "no-matching-activity-xyz" }), []);
});
