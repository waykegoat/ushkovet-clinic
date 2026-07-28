import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/server",
    emptyOutDir: true,
    ssr: "worker/index.ts",
    sourcemap: true,
    minify: true,
    rollupOptions: {
      output: {
        entryFileNames: "index.js",
      },
    },
  },
  ssr: {
    target: "webworker",
    noExternal: true,
  },
});
