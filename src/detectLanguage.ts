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
  // 1. 统计源码文件扩展名（优先）
  const { folders } = await scanCoreDirs(repoRoot);
  const exts: Record<string, number> = {};
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      exts[ext] = (exts[ext] || 0) + 1;
    }
  }
  for (const folder of folders) {
    await walk(path.join(repoRoot, folder));
  }
  // 统计 .tsx/.ts/.js 文件数
  const tsxCount = exts[".tsx"] ?? 0;
  const tsCount = exts[".ts"] ?? 0;
  const jsCount = exts[".js"] ?? 0;
  const total = Object.values(exts).reduce((a, b) => a + b, 0);
  if ((tsxCount + tsCount) / total > 0.6) {
    if (tsxCount / (tsxCount + tsCount) > 0.2) return { language: "tsx" };
    return { language: "ts" };
  }
  if (jsCount / total > 0.6) return { language: "js" };

  // 2. 依据特殊文件判断
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
  return { language: "other" };
}
