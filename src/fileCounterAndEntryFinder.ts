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

export async function detectPrimaryLanguage(repoRoot: string = process.cwd()): Promise<{ language: 'tsx' | 'ts' | 'js' | 'java' | 'kotlin' | 'go' | 'py' | 'other' }> {
  // 1. 依据特殊文件优先判断
  const specialFiles = [
    { file: 'package.json', lang: 'js' },
    { file: 'pom.xml', lang: 'java' },
    { file: 'build.gradle', lang: 'kotlin' },
    { file: 'go.mod', lang: 'go' },
  ];
  for (const { file, lang } of specialFiles) {
    try {
      await fs.access(path.join(repoRoot, file));
      if (file === 'package.json') {
        // 进一步判断 tsconfig.json 存在性
        try {
          await fs.access(path.join(repoRoot, 'tsconfig.json'));
          return { language: 'ts' };
        } catch {
          return { language: 'js' };
        }
      }
      return { language: lang as any };
    } catch {}
  }
  // 2. 统计源码文件扩展名
  const { folders } = await scanCoreDirs(repoRoot);
  const exts: Record<string, number> = {};
  let total = 0;
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      exts[ext] = (exts[ext] || 0) + 1;
      total++;
    }
  }
  for (const folder of folders) {
    await walk(path.join(repoRoot, folder));
  }
  const extMap: Record<string, string> = {
    '.tsx': 'tsx', '.ts': 'ts', '.js': 'js', '.java': 'java', '.kt': 'kotlin', '.go': 'go', '.py': 'py'
  };
  for (const [ext, count] of Object.entries(exts)) {
    if (extMap[ext] && count / total > 0.6) {
      return { language: extMap[ext] as any };
    }
  }
  return { language: 'other' };
}

export async function detectFramework(repoRoot: string = process.cwd()): Promise<{ framework: string | null }> {
  // 1. package.json
  try {
    const pkgRaw = await fs.readFile(path.join(repoRoot, 'package.json'), 'utf8');
    const pkg = JSON.parse(pkgRaw);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const frameworks: string[] = [];
    if (deps.react && deps['react-dom']) frameworks.push('React');
    if (deps.next) frameworks.push('Next.js');
    if (deps.zustand) frameworks.push('Zustand');
    if (deps.tailwindcss) frameworks.push('Tailwind');
    if (deps.express || deps.nest) frameworks.push('Node API');
    if (frameworks.length) return { framework: frameworks.join(' + ') };
  } catch {}
  // 2. pom.xml/gradle（略，因无文件）
  // 3. fallback
  return { framework: null };
}
