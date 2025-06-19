import { chatWithOllama, ChatMessage } from "./chatWithOllama";

export async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:11434");
    return res.ok;
  } catch {
    return false;
  }
}

export async function hasModel(modelName: string): Promise<boolean> {
  const { execSync } = await import("child_process");
  const output = execSync("ollama list").toString();
  return output.includes(modelName);
}

export async function pullModel(modelName: string): Promise<void> {
  const { spawn } = await import("child_process");
  console.log(`🔄 Pulling ${modelName}...`);
  const proc = spawn("ollama", ["pull", modelName], { stdio: "inherit" });
  await new Promise((res) => proc.on("exit", res));
}

export async function runModelInBackground(modelName: string): Promise<void> {
  const { spawn } = await import("child_process");
  const proc = spawn("ollama", ["run", modelName], {
    detached: true,
    stdio: "ignore",
  });
  proc.unref();
  console.log(`🚀 Started model "${modelName}" in background.`);
}

export async function sayHelloToModel(modelName: string): Promise<void> {
  await new Promise((res) => setTimeout(res, 5000));
  const messages: ChatMessage[] = [{ role: "user", content: "hello" }];
  try {
    const { message, duration } = await chatWithOllama(modelName, messages);
    console.log(`🤖 Model says: ${message.content}`);
    console.log(`⏱️ Duration: ${duration} ms`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

export async function checkAndStartModel() {
  const model = "deepseek-r1:14b";

  if (!(await isOllamaRunning())) {
    console.error("❌ Ollama not running. Please start it first.");
    process.exit(1);
  }

  if (!(await hasModel(model))) {
    await pullModel(model);
  }

  await runModelInBackground(model);
  await sayHelloToModel(model);
}
