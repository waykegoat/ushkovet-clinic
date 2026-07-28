import { copyFile, writeFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";

const fromRoot = (path) => fileURLToPath(new URL(path, new URL("../", import.meta.url)));

await copyFile(fromRoot("dist/client/index.html"), fromRoot("dist/client/404.html"));
await writeFile(fromRoot("dist/client/.nojekyll"), "");
