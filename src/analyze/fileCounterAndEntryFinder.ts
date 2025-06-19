import { promises as fs } from "fs";
import * as path from "path";
import { scanCoreDirs } from "./scanCoreDirs";

const ENTRY_PRIORITY = [
  /src\/index\.(tsx|ts)/,
  /src\/main\.(ts|js)/,
  /src\/main\.go/,
  /Application\.java/,
  /Main\.kt/,
];

async function walkFiles(
  dir: string,
  ignore: (name: string) => boolean,
  base = dir
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    if (ignore(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(base, fullPath);
    if (entry.isDirectory()) {
      files = files.concat(await walkFiles(fullPath, ignore, base));
    } else {
      files.push(relPath);
    }
  }
  return files;
}

export async function countFilesAndFindEntry(
  repoRoot: string = process.cwd()
): Promise<{ fileCount: number; mainEntry: string | null }> {
  const { folders } = await scanCoreDirs(repoRoot);
  let allFiles: string[] = [];
  for (const folder of folders) {
    const abs = path.join(repoRoot, folder);
    allFiles = allFiles.concat(await walkFiles(abs, () => false, repoRoot));
  }
  let mainEntry: string | null = null;
  for (const pattern of ENTRY_PRIORITY) {
    const found = allFiles.find((f) => pattern.test(f.replace(/\\/g, "/")));
    if (found) {
      mainEntry = found;
      break;
    }
  }
  return { fileCount: allFiles.length, mainEntry };
}
