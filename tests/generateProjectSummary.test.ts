import { strict as assert } from "assert";
import fs from "fs";
import path from "path";
import os from "os";
import { generateProjectSummary } from "../src/projectSummary";

(async () => {
  // ── 1. 假 React+TS 项目 ──
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "react-"));
  fs.mkdirSync(path.join(dir, "src"));
  fs.writeFileSync(path.join(dir, "src", "index.tsx"), 'console.log("hi")');
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({
      dependencies: {
        react: "^18.0.0",
        zustand: "^4.0.0",
        tailwindcss: "^3.3.0",
      },
    })
  );

  // ── 2. 执行分析 ──
  const summary = await generateProjectSummary(dir);

  // ── 3. 核心断言 ──
  assert.equal(summary.language, "tsx");
  assert.ok(summary.framework && summary.framework.includes("React"));
  assert.equal(summary.mainEntry, "src/index.tsx");
  assert.equal(summary.fileCount, 1);

  console.log("✅ generateProjectSummary test passed");
})();
