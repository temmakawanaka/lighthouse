import { cp, rm, stat } from "node:fs/promises";

const source = new URL("../frontend/out/", import.meta.url);
const output = new URL("../out/", import.meta.url);
await stat(new URL("index.html", source));
await rm(output, { recursive: true, force: true });
await cp(source, output, { recursive: true });
console.log("Static output staged for hosting.");
