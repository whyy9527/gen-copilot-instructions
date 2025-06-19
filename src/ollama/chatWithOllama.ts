export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  duration: number;
}

export async function chatWithOllama(
  model: string,
  messages: ChatMessage[]
): Promise<ChatResponse> {
  const start = Date.now();
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });
  const duration = Date.now() - start;
  if (!res.ok) {
    throw new Error("❌ Failed to get response from Ollama /chat.");
  }
  const data = await res.json();
  // Ollama /chat 返回格式：{ message: { role, content }, ... }
  return { message: data.message, duration };
}
