import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";

const fromRoot = (path) => fileURLToPath(new URL(path, new URL("../", import.meta.url)));

await mkdir(fromRoot("dist/migrations"), { recursive: true });
await cp(fromRoot("drizzle"), fromRoot("dist/migrations"), {
  recursive: true,
});
