import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { monthNames, typeKeys } from "../../src/lib/catalog.js";

export const appRoot = fileURLToPath(new URL("../../", import.meta.url));
export const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

function cleanText(text) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ").replace(/^\s*[-–—]\s*|\s*[-–—]\s*$/g, "").trim();
}

export function resolveLink(url, sourcePath, publicDirectory) {
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(url)) throw new Error(`Unsupported link: ${url}`);
  const [, pathname, suffix] = url.match(/^([^?#]*)(.*)$/);
  const file = path.resolve(path.dirname(sourcePath), decodeURIComponent(pathname));
  const relative = path.relative(publicDirectory, file);
  if (!relative || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Local link must point into app/public: ${url}`);
  }
  if (!existsSync(file) || !statSync(file).isFile()) throw new Error(`Missing local file: ${url}`);
  let directory = publicDirectory;
  for (const segment of relative.split(path.sep)) {
    if (!readdirSync(directory).includes(segment)) throw new Error(`Local filename case mismatch: ${url}`);
    directory = path.join(directory, segment);
  }
  return relative.split(path.sep).map(encodeURIComponent).join("/") + suffix;
}

export function parseLog(text, { type, year, sourcePath, publicDirectory }) {
  const headingYear = Number(text.match(/^#\s+(\d{4})\s*$/m)?.[1]);
  if (headingYear !== year) throw new Error(`Expected heading # ${year}`);
  let month;
  const activities = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    try {
      const heading = line.match(/^###\s+(.+)$/);
      if (heading) {
        month = heading[1].trim();
        if (!monthNames.includes(month)) throw new Error(`Unknown month: ${month}`);
        continue;
      }
      if (!/^-(?:\s|$)/.test(line)) continue;
      const raw = line.replace(/^-\s*/, "").trim();
      if (!raw) continue;
      if (!month) throw new Error("Activity must follow a month heading");
      const links = [...raw.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(([, label, url]) => ({
        label, url: resolveLink(url, sourcePath, publicDirectory)
      }));
      const date = raw.match(/\((\d{2}\.\d{2}\.\d{4}(?:\s*[-–—]\s*\d{2}\.\d{2}\.\d{4})?)\)/)?.[1] || null;
      if (date) {
        const dates = date.match(/\d{2}\.\d{2}\.\d{4}/g);
        for (const value of dates) {
          const [day, number, dateYear] = value.split(".").map(Number);
          const parsed = new Date(Date.UTC(dateYear, number - 1, day));
          if (dateYear !== year || parsed.getUTCMonth() !== number - 1 || parsed.getUTCDate() !== day) {
            throw new Error(`Invalid date: ${value}`);
          }
        }
        if (Number(dates[0].split(".")[1]) !== monthNames.indexOf(month) + 1) {
          throw new Error(`Date does not match ${month}: ${date}`);
        }
      }
      let title, meta;
      if (type === "books") {
        const separator = raw.lastIndexOf(" - ");
        title = separator < 0 ? raw : raw.slice(0, separator);
        meta = separator < 0 ? "" : raw.slice(separator + 3);
      } else {
        const boldTitle = raw.match(/^\*\*([^*]+)\*\*/);
        title = boldTitle?.[1] || raw.split(/\s+\(\d{2}\.\d{2}\.\d{4}/, 1)[0];
        // Undated course entries still have a provider after the first separator.
        if (!boldTitle && !date) title = raw.split(" - ", 1)[0];
        meta = raw.slice(boldTitle ? boldTitle[0].length : title.length);
      }
      if (date) {
        title = title.replace(`(${date})`, "");
        meta = meta.replace(`(${date})`, "");
      }
      activities.push({ type, month, month_index: monthNames.indexOf(month), year,
        title: cleanText(title), meta: cleanText(meta), date, links });
    } catch (error) {
      throw new Error(`${sourcePath}:${index + 1}: ${error.message}`);
    }
  }
  return activities;
}

export function buildData(root = repositoryRoot) {
  const activities = [];
  const publicDirectory = path.join(root, "app/public");
  for (const type of typeKeys) {
    const directory = path.join(root, "content", type);
    for (const filename of readdirSync(directory).filter((name) => /^\d{4}\.md$/.test(name)).sort()) {
      const sourcePath = path.join(directory, filename);
      activities.push(...parseLog(readFileSync(sourcePath, "utf8"), {
        type, year: Number(filename.slice(0, 4)), sourcePath, publicDirectory
      }));
    }
  }
  if (!activities.length) throw new Error("No activities found in content/");
  activities.sort((a, b) => a.year - b.year || a.month_index - b.month_index
    || Number(a.date?.slice(0, 2) || 1) - Number(b.date?.slice(0, 2) || 1)
    || a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
  const years = [...new Set(activities.map((item) => item.year))].sort((a, b) => b - a);
  const payload = { year: years[0], years, activities };
  const output = path.join(root, "app/src/generated/activities.json");
  const serialized = `${JSON.stringify(payload, null, 2)}\n`;
  mkdirSync(path.dirname(output), { recursive: true });
  if (!existsSync(output) || readFileSync(output, "utf8") !== serialized) writeFileSync(output, serialized);
  return payload;
}
