import * as path from "path";
import { promises as fs } from "fs";
import { scanCoreDirs } from "./scanCoreDirs";

const extMap: Record<string, string> = {
  ".tsx": "tsx",
  ".ts": "ts",
  ".js": "js",
  ".java": "java",
  ".kt": "kotlin",
  ".go": "go",
  ".py": "py",
};

export async function detectPrimaryLanguage(
  repoRoot: string = process.cwd()
): Promise<{
  language: "tsx" | "ts" | "js" | "java" | "kotlin" | "go" | "py" | "other";
}> {
  // 1. 依据特殊文件优先判断
  const specialFiles = [
    { file: "package.json", lang: "js" },
    { file: "pom.xml", lang: "java" },
    { file: "build.gradle", lang: "kotlin" },
    { file: "go.mod", lang: "go" },
  ];
  for (const { file, lang } of specialFiles) {
    try {
      await fs.access(path.join(repoRoot, file));
      if (file === "package.json") {
        try {
          await fs.access(path.join(repoRoot, "tsconfig.json"));
          return { language: "ts" };
        } catch {
          return { language: "js" };
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
  for (const [ext, count] of Object.entries(exts)) {
    if (extMap[ext] && count / total > 0.6) {
      return { language: extMap[ext] as any };
    }
  }
  return { language: "other" };
}
