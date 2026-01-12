# BACKEND SERVICE DOMAIN (Score: 10)

## OVERVIEW
Serverless Deno-based backend handling prompt engineering logic, LLM orchestration, and data persistence.

## STRUCTURE
- `engineer-prompt/index.ts`: Primary Edge Function implementing the CO-STAR framework.
- `serve()`: Standard Deno HTTP server entry point for processing requests.
- `RefinedPromptSchema`: Zod schema enforcing strict JSON structure for LLM outputs.
- `supabase.auth.getUser()`: Middleware-style authentication via Authorization headers.
- `supabase.from("prompt_history").insert()`: Async persistence layer for audit logs.

## WHERE TO LOOK
- **LLM Switching**: Provider logic (Gemini vs Ollama) located in the main `serve` block.
- **Framework Injection**: The CO-STAR system prompt is hardcoded as a template string.
- **Validation Logic**: Input length (5000 chars) and model/provider allowlists.
- **Error Handling**: Try-catch blocks returning standardized JSON error responses.

## CONVENTIONS
- **Deno Runtime**: Uses URL-based ESM imports (e.g., `https://deno.land`, `https://esm.sh`).
- **Zero-Markdown**: LLM prompts strictly forbid backticks (\`\`\`json) in responses.
- **Strict Typing**: Zod validation ensures the backend never returns malformed prompt data.
- **Statelessness**: No local storage; all persistent state goes to Supabase DB.
- **Environment Driven**: API keys and URLs fetched exclusively via `Deno.env.get()`.

## ANTI-PATTERNS
- **NEVER** answer the user's input directly; the service is a prompt engineer, not a chatbot.
- **DO NOT** use Node.js built-ins (e.g., `process.env`, `fs`); use Deno equivalents.
- **AVOID** hardcoding secrets; always use Supabase Vault/Environment Variables.
- **NO** manual JSON string concatenation; use `JSON.stringify` to ensure valid formats.
- **DO NOT** bypass validation; every LLM response must pass through the Zod schema.
