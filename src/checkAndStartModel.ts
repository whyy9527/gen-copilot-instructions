// 检查 Ollama 是否运行
export async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:11434");
    return res.ok;
  } catch {
    return false;
  }
}

// 检查模型是否存在
export async function hasModel(modelName: string): Promise<boolean> {
  const { execSync } = await import("child_process");
  const output = execSync("ollama list").toString();
  return output.includes(modelName);
}

// 拉取模型
export async function pullModel(modelName: string): Promise<void> {
  const { spawn } = await import("child_process");
  console.log(`🔄 Pulling ${modelName}...`);
  const proc = spawn("ollama", ["pull", modelName], { stdio: "inherit" });
  await new Promise((res) => proc.on("exit", res));
}

// 后台运行 Ollama 模型（不阻塞主进程）
export async function runModelInBackground(modelName: string): Promise<void> {
  const { spawn } = await import("child_process");
  const proc = spawn("ollama", ["run", modelName], {
    detached: true,
    stdio: "ignore",
  });
  proc.unref();
  console.log(`🚀 Ollama model '${modelName}' started in background.`);
}

// 主流程
async function main() {
  const model = "deepseek-r1:14b";

  if (!(await isOllamaRunning())) {
    console.error("❌ Ollama not running. Please start it first.");
    process.exit(1);
  }

  if (!(await hasModel(model))) {
    await pullModel(model);
  }

  await runModelInBackground(model);
}

main();
