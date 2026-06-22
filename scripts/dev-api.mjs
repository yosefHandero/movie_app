#!/usr/bin/env node
// Local API dev server (Vercel serverless functions on :3000).
//
// Why this wrapper exists:
//  1. `vercel dev` does NOT load `.env.local` into the serverless function
//     runtime (it only reads env vars pulled from the linked cloud project).
//     We load `.env.local` ourselves and pass it through so functions like
//     so functions can read POSTGRES_URL, etc.
//  2. On Windows, Metro/Expo (run by vercel's buildCommand) breaks with a
//     doubled drive letter ("c:\C:\...") when the cwd drive letter is
//     lowercase. We force an uppercase drive letter to avoid that.
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
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

const env = { ...process.env };
const envPath = path.join(projectRoot, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Real environment variables take precedence over the .env.local file.
    if (!(key in env)) env[key] = value;
  }
}

const child = spawn(
  "npx",
  ["vercel", "dev", "--yes", "--listen", "3000", ...process.argv.slice(2)],
  { cwd, env, stdio: "inherit", shell: true }
);
child.on("exit", (code) => process.exit(code ?? 0));
