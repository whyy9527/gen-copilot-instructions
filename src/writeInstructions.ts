import fs from "fs";
import path from "path";
import { summarizeWithOllama } from "./ollama/summarizeWithOllama";
import { generateProjectSummary } from "./analyze/projectSummary";

function parseArgs() {
  const args = process.argv.slice(2);
  const path = args.includes("--path")
    ? args[args.indexOf("--path") + 1]
    : process.cwd();
  return { path };
}

async function writeInstructions() {
  const { path: projectPath } = parseArgs();
  const summary = await generateProjectSummary(projectPath);
  const instructions = await summarizeWithOllama(summary);

  // Write to file in the specified project directory
  const outputPath = path.join(projectPath, "copilot-instructions.md");
  fs.writeFileSync(outputPath, instructions + "\n");
  console.log(`✅ Copilot instructions written to ${outputPath}`);

  // Also output to console
  console.log("\n--- Copilot Instructions ---\n");
  console.log(instructions);
}

if (require.main === module) {
  writeInstructions().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
