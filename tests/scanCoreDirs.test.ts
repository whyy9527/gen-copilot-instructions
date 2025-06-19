import { strict as assert } from "assert";
import fs from "fs";
import path from "path";
import os from "os";
import { scanCoreDirs } from "../src/analyze/scanCoreDirs";

(async () => {
  // ── 1. 在系统临时目录构造一个假项目 ──
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "proj-"));
  const keepDirs = ["src", "app", "api", "node_modules", "dist"];
  keepDirs.forEach((d) => fs.mkdirSync(path.join(tempDir, d)));

  // ── 2. 调用函数 ──
  const { folders } = await scanCoreDirs(tempDir);

  // ── 3. 断言过滤效果 ──
  assert.deepEqual(
    folders.sort(),
    ["app", "api", "src"].sort(),
    "should ignore node_modules/dist and keep core dirs"
  );

  console.log("✅ scanCoreDirs test passed");
})();
