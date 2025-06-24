# gen-copilot-instructions

A CLI toolchain for generating concise GitHub Copilot instructions and project summaries using Node.js and Ollama LLMs.

## Features

- 📦 Auto-detects core source folders, main entry, language, and frameworks
- 🤖 Summarizes your project with deepseek-r1:14b via Ollama
- 📝 Outputs Copilot instructions to console and `copilot-instructions.md` in the target directory
- 🧪 Includes minimal regression tests (Node built-ins only)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Ensure Ollama is running and the model is available

```bash
ollama serve &
ollama pull deepseek-r1:14b
```

### 3. Generate Copilot instructions

```bash
# Generate for current directory:
npx tsx src/writeInstructions.ts

# Generate for a specific project path:
npx tsx src/writeInstructions.ts --path /path/to/your/project
```

### 4. Run regression tests

```bash
npx tsx tests/scanCoreDirs.test.ts
npx tsx tests/generateProjectSummary.test.ts
```

## File Structure

- `src/analyze/` — project analysis modules (core dirs, language, framework, summary)
- `src/ollama/` — Ollama chat and summarization logic
- `src/writeInstructions.ts` — CLI entry for generating Copilot instructions
- `tests/` — minimal regression tests

## Requirements

- Node.js 18+
- [Ollama](https://ollama.com/) with `deepseek-r1:14b` model
- [tsx](https://npm.im/tsx) or [ts-node](https://npm.im/ts-node) for running TypeScript scripts

## License

MIT
