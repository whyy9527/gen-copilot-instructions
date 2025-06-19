import { chatWithOllama } from "./chatWithOllama";
import { Summary } from "../analyze/projectSummary";
import { isOllamaRunning } from "../checkAndStartModel";
import { generateProjectSummary } from "../analyze/projectSummary";

/**
 * Use deepseek-r1:14b to summarize a project summary as English instructions.
 * @param summary Project summary object
 * @returns English instructions string
 */
export async function summarizeWithOllama(summary: Summary): Promise<string> {
  if (!(await isOllamaRunning())) {
    throw new Error(
      "❌ Ollama is not running. Please start Ollama and ensure the model is available."
    );
  }
  const prompt = `You are GitHub Copilot Instructions Generator.\nHere is a project summary (JSON): ${JSON.stringify(
    summary
  )}\nWrite concise English instructions (≤150 words) covering:\n• purpose & tech stack\n• coding style conventions\n• entry file / key folders\nFormat: first line single-sentence overview, then 3-5 bullet points.\nOutput only the final instructions.`;
  try {
    const { message } = await chatWithOllama("deepseek-r1:14b", [
      { role: "user", content: prompt },
    ]);
    // 清洗 LLM 输出，去除 <think> 标签及其内容和多余空行
    return message.content
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/^hello!?$/im, "")
      .trim();
  } catch (e) {
    throw new Error(
      "❌ Failed to get summary from Ollama: " +
        (e instanceof Error ? e.message : e)
    );
  }
}

if (require.main === module) {
  (async function cliSummarize() {
    try {
      const summary = await generateProjectSummary();
      const instructions = await summarizeWithOllama(summary);
      console.log(instructions);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
