# PromptArchitect-Studio Context

## Project Overview
PromptArchitect-Studio is a specialized web application designed to help users engineer high-quality AI prompts using the **CO-STAR framework** (Context, Objective, Style, Tone, Audience, Response). It features a modern React frontend and a Supabase backend with Edge Functions that interface with LLMs (Google Gemini or Ollama).

## Tech Stack
*   **Frontend:** React 19, TypeScript ~5.8, Vite 6, Tailwind CSS 4.
*   **Backend:** Supabase (PostgreSQL), Deno (Edge Functions).
*   **AI Providers:** Google Gemini 1.5 Flash (Cloud) or Ollama/Llama 3.2 (Self-hosted).
*   **Testing:** Vitest (Unit), Playwright (E2E).
*   **Containerization:** Docker, Docker Compose.
*   **Tools:** Husky (Git hooks), SecretLint.

## Project Structure
**Note: This project uses a FLAT structure. There is NO `src/` directory.**

*   `./App.tsx`: Main application component and routing logic.
*   `./components/`: UI components (flat list).
*   `./services/`: API interaction logic (Supabase client, Gemini service).
*   `./hooks/`: Custom React hooks (e.g., `useAuth`, `usePromptHistory`).
*   `./context/`: Global state providers (`FavoritesContext`, `SessionProvider`).
*   `./supabase/`: Backend logic.
    *   `functions/engineer-prompt/`: Core Edge Function for prompt processing (Deno).
    *   `migrations/`: SQL files for database schema updates.
*   `./test/`: Unit tests (Vitest).
*   `./e2e/`: End-to-end tests (Playwright).
*   `./AGENTS.md`: "Knowledge Base" for AI agents/developers.
*   `./docs/`: Additional documentation (`DEPLOY.md`, `INSTALL.md`, etc.).

## Development Workflow

### Key Commands
*   **Start Dev Server:** `npm run dev` (Runs on port **5174**, not 5173).
*   **Build:** `npm run build`
*   **Unit Tests:** `npm run test` (Vitest)
*   **E2E Tests:** `npm run test:e2e` (Playwright)
*   **Linting:** `npm run secretlint`

### conventions
1.  **Flat Structure:** Do not create a `src/` folder. Place source files in the root or their respective type directories (`components`, `hooks`, etc.).
2.  **Path Aliases:** Use `@/` to reference the root directory (configured in `vite.config.ts`).
3.  **Strict TypeScript:** No `any` types allowed.
4.  **Security:** Never commit secrets. `SecretLint` runs on pre-commit.
5.  **Documentation:** JSDoc is required for all new functions.

## AI & Backend Configuration
*   **LLM Setup:** Configured via Supabase Secrets (`LLM_PROVIDER`, `GEMINI_API_KEY` or `OLLAMA_URL`). See `LLM_SETUP.md`.
*   **Supabase:** Local development requires Supabase CLI. Edge functions run in a Deno environment.
*   **AI Providers:** Google Gemini 3.0 Flash (Cloud) or Ollama/Llama 3.2 (Self-hosted).

## Deployment
*   **CI/CD:** GitHub Actions handle validation, testing, and Docker builds (`.github/workflows/`).
*   **Production:** Deployed as a Docker container, often behind a Tailscale VPN (per `DEPLOY.md`).
