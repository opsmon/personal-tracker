import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { repositoryRoot } from "./lib/activity-data.mjs";

const port = process.env.SMOKE_PORT || "4180";
const base = process.env.SITE_BASE_PATH || "/personal-tracker/";
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--config", "app/vite.config.js",
  "--host", "127.0.0.1", "--port", port, "--strictPort"], { cwd: repositoryRoot, stdio: "pipe" });
let logs = "";
server.stdout.on("data", (data) => { logs += data; });
server.stderr.on("data", (data) => { logs += data; });
server.on("error", (error) => { logs += error.message; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Preview exited: ${logs}`);
    try {
      const response = await fetch(origin + base);
      if (response.ok) { ready = true; break; }
    } catch { /* Wait for the preview server to bind. */ }
    await setTimeout(100);
  }
  assert.ok(ready, `Preview did not start: ${logs}`);
  const response = await fetch(origin + base);
  const html = await response.text();
  assert.match(html, /<div id="app"><\/div>/);
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((match) => match[1]);
  assert.ok(assets.length >= 2, "Built JS and CSS are referenced");
  for (const asset of assets) {
    assert.ok(asset.startsWith(base), `Asset outside configured base: ${asset}`);
    const assetResponse = await fetch(origin + asset);
    assert.equal(assetResponse.status, 200, asset);
    assert.doesNotMatch(assetResponse.headers.get("content-type") || "", /text\/html/);
  }
  const data = JSON.parse(readFileSync(path.join(repositoryRoot, "app/src/generated/activities.json"), "utf8"));
  const links = [...new Set(data.activities.flatMap((item) => item.links).map((link) => link.url).filter((url) => !/^https?:/.test(url)))];
  const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
  for (const link of links) {
    const result = await fetch(origin + base + link);
    assert.equal(result.status, 200, link);
    assert.match(result.headers.get("content-type"), /application\/pdf/, link);
    const bytes = Buffer.from(await result.arrayBuffer());
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-", link);
    const pathname = new URL(link, `${origin}${base}`).pathname.slice(base.length);
    const source = readFileSync(path.join(repositoryRoot, "app/public", decodeURIComponent(pathname)));
    assert.equal(sha256(bytes), sha256(source), `Published PDF differs from source: ${link}`);
    console.log(`200 PDF ${link} sha256:${sha256(bytes)}`);
  }
  console.log(`Preview passed at ${base}: ${data.activities.length} activities, ${assets.length} assets, ${links.length} local certificates`);
} finally {
  server.kill("SIGTERM");
}
