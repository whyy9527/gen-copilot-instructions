import { promises as fs } from "fs";
import * as path from "path";

const DEFAULT_CORE_DIRS = ["src", "app", "lib", "api", "controller"];
const IGNORE_PATTERNS = [
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".git",
  /^test/i,
  /^\./,
  /\.(jpg|jpeg|png|gif|bmp|svg|ico|webp)$/i,
  /\.(exe|dll|so|bin)$/i,
];

function shouldIgnore(name: string): boolean {
  return IGNORE_PATTERNS.some((pattern) =>
    typeof pattern === "string" ? name === pattern : pattern.test(name)
  );
}

export async function scanCoreDirs(
  repoRoot: string = process.cwd()
): Promise<{ folders: string[] }> {
  const entries = await fs.readdir(repoRoot, { withFileTypes: true });
  const folders: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (shouldIgnore(entry.name)) continue;
    if (DEFAULT_CORE_DIRS.includes(entry.name)) {
      folders.push(entry.name);
    }
  }
  return { folders };
}
