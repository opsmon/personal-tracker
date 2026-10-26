import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import { buildData, repositoryRoot } from "../scripts/lib/activity-data.mjs";

export default defineConfig({
  root: path.join(repositoryRoot, "app"),
  base: process.env.SITE_BASE_PATH || "/personal-tracker/",
  build: { outDir: path.join(repositoryRoot, "dist"), emptyOutDir: true },
  plugins: [
    {
      name: "activity-data",
      buildStart() { buildData(); },
      configureServer(server) {
        const content = path.join(repositoryRoot, "content");
        const certificates = path.join(repositoryRoot, "app/public");
        server.watcher.add([content, certificates]);
        const update = (file) => {
          if (!file.startsWith(content + path.sep) && !file.startsWith(certificates + path.sep)) return;
          try {
            buildData();
            server.ws.send({ type: "full-reload" });
          } catch (error) {
            server.config.logger.error(error.message);
            server.ws.send({ type: "error", err: { message: error.message, stack: "" } });
          }
        };
        server.watcher.on("add", update).on("change", update).on("unlink", update);
      }
    },
    svelte()
  ]
});
