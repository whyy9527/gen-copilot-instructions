import * as path from "path";
import { promises as fs } from "fs";

export async function detectFramework(
  repoRoot: string = process.cwd()
): Promise<{ framework: string | null }> {
  try {
    const pkgRaw = await fs.readFile(
      path.join(repoRoot, "package.json"),
      "utf8"
    );
    const pkg = JSON.parse(pkgRaw);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const frameworks: string[] = [];
    if (deps.react && deps["react-dom"]) frameworks.push("React");
    if (deps.next) frameworks.push("Next.js");
    if (deps.zustand) frameworks.push("Zustand");
    if (deps.tailwindcss) frameworks.push("Tailwind");
    if (deps.express || deps.nest) frameworks.push("Node API");
    if (frameworks.length) return { framework: frameworks.join(" + ") };
  } catch {}
  return { framework: null };
}
