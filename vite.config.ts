import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  build: {
    outDir: "dist/client",
    sourcemap: true,
  },
  ssgOptions: {
    includedRoutes: (paths) =>
      paths.filter((path) => ["/", "/services", "/contacts"].includes(path)),
    dirStyle: "nested",
    formatting: "minify",
    script: "defer",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,vue}", "worker/**/*.ts"],
      exclude: ["src/main.ts", "src/env.d.ts"],
    },
  },
});
