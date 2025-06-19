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
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };
    const frameworks: string[] = [];
    if (allDeps.react || allDeps["react-dom"]) frameworks.push("React");
    if (allDeps.next) frameworks.push("Next.js");
    if (allDeps.zustand) frameworks.push("Zustand");
    if (allDeps.tailwindcss) frameworks.push("Tailwind");
    if (allDeps.express || allDeps.nest) frameworks.push("Node API");
    if (frameworks.length) return { framework: frameworks.join(" + ") };
  } catch {}
  return { framework: null };
}
