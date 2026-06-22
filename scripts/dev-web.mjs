#!/usr/bin/env node
// Expo web dev server (frontend on :8081).
//
// On Windows, Metro fails with a doubled drive letter ("c:\C:\...") ENOENT
// when launched from a lowercase-drive cwd (common in VS Code / Git Bash).
// Forcing an uppercase drive letter keeps Metro's file map consistent.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

let cwd = projectRoot;
if (process.platform === "win32" && /^[a-z]:/.test(cwd)) {
  cwd = cwd.charAt(0).toUpperCase() + cwd.slice(1);
}

const child = spawn(
  "npx",
  ["expo", "start", "--web", "--port", "8081", ...process.argv.slice(2)],
  { cwd, stdio: "inherit", shell: true }
);
child.on("exit", (code) => process.exit(code ?? 0));
