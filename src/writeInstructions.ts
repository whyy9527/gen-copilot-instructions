import fs from "fs";
import path from "path";
import { summarizeWithOllama } from "./ollama/summarizeWithOllama";
import { generateProjectSummary } from "./projectSummary";

function parseArgs() {
  const args = process.argv.slice(2);
  const to = args.includes("--to") ? args[args.indexOf("--to") + 1] : "console";
  return { to };
}

async function writeInstructions() {
  const { to } = parseArgs();
  const summary = await generateProjectSummary();
  const instructions = await summarizeWithOllama(summary);

  if (to === "md" || to === "both") {
    const mdPath = path.join(
      process.cwd(),
      ".github",
      "copilot-instructions.md"
    );
    fs.mkdirSync(path.dirname(mdPath), { recursive: true });
    fs.writeFileSync(mdPath, instructions + "\n");
    console.log(`✅ Copilot instructions written to ${mdPath}`);
  }
  if (to === "console" || to === "both") {
    console.log("\n--- Copilot Instructions ---\n");
    console.log(instructions);
  }
}

if (require.main === module) {
  writeInstructions().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
