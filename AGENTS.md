# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-06
**Commit:** f937eb8
**Branch:** main

## OVERVIEW
PromptArchitect-Studio is a specialized React 19 + TypeScript + Supabase web application designed to help users engineer high-quality AI prompts using the **CO-STAR framework** (Context, Objective, Style, Tone, Audience, Response). It features a modern frontend and a Supabase backend with Edge Functions that interface with Gemini LLMs.

## TECH STACK
*   **Frontend:** React 19, TypeScript ~5.8, Vite 6, Tailwind CSS 4.
*   **Backend:** Supabase (PostgreSQL), Deno (Edge Functions).
*   **Mobile:** Capacitor ^8 (iOS/Android targets via `capacitor.config.ts`).
*   **AI Providers:** Gemini 3.1 Flash-Lite (Default) / **Gemini 3.5 Flash-Preview** / **Gemma 4 (Local Fallback)**.
*   **Testing:** Vitest (Unit), Playwright (E2E).
*   **Containerization:** Docker, Docker Compose.
*   **Tools:** Husky (Git hooks), SecretLint.

## PROJECT STRUCTURE
**Note: This project uses a FLAT structure. There is NO `src/` directory.**

```
./                    # Flat root - source files in root or specific folders
├── components/        # UI components (flat list)
├── services/          # API/logic layer (Supabase client, Gemini service) 
├── hooks/             # Custom React hooks (e.g., useAuth, usePromptHistory)
├── context/           # Global state providers (FavoritesContext, SessionProvider)
├── test/              # Unit tests with Vitest
├── e2e/               # E2E tests with Playwright
├── supabase/
│   ├── functions/     # Edge Functions (Deno runtime)
│   └── migrations/    # Database migrations
├── conductor/         # Product guidelines and workflow documentation
├── docs/              # Project assets and manual documentation
├── App.tsx            # Main application component and routing logic
├── index.tsx          # Application entry point
├── global.css         # Global styles (Tailwind)
├── types.ts           # Global TypeScript interfaces
├── README.md          # Project overview and quickstart
├── INSTALL.md         # Detailed installation guide
├── USAGE.md           # User manual and framework guide
├── DEPLOY.md          # Deployment instructions
├── CONTRIBUTING.md    # Contribution guidelines
├── LLM_SETUP.md       # AI provider configuration
├── components.json    # Shadcn/ui configuration
├── ANDROID_BUILD.md   # Building & deploying APKs for Android devices
├── capacitor.config.ts # Capacitor mobile config (iOS/Android)
├── docker-compose.yml # Container orchestration
├── Dockerfile         # Production container image
├── supabase_schema.sql # Database schema snapshot
├── vite.config.ts     # Build config (Port 5174, @/ path alias, AI Proxy)
└── package.json       # Dependencies and scripts
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| App routing | App.tsx | Main application logic |
| Component library | components/ | Flat structure |
| API logic | services/ | Supabase client + local fallback logic |
| Prompt history search | hooks/usePromptHistory.ts | Debounced search filtering |
| Prompt engineering | supabase/functions/engineer-prompt/ | Core backend logic |
| Build config | vite.config.ts | Port 5174, @/ path alias, local AI proxy |
| Product & Workflow | conductor/ | Guidelines and technical tracks |
| Testing | test/, e2e/ | Vitest + Playwright |

## DEVELOPMENT WORKFLOW & COMMANDS
```bash
pnpm dev          # Development server on port 5174
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright E2E tests
pnpm build        # Production build
pnpm secretlint   # Security linting
```

## CONVENTIONS
- **Flat Root**: All source code in root (NO `src/` directory) - primary deviation.
- **Path Aliases**: Use `@/` to reference root directory (configured in `vite.config.ts`).
- **Security**: Never commit secrets. `SecretLint` enforced via Husky pre-commit hooks.
- **TypeScript**: Strict mode, no `any` types allowed.
- **React**: Functional components + hooks only.
- **Documentation**: JSDoc required for all new functions.
- **Testing**: Dual framework - Vitest (unit) + Playwright (E2E).

## ANTI-PATTERNS
- **NEVER** commit .env files or hardcoded secrets.
- **NEVER** use `any` type - strict TypeScript only.
- **NEVER** pass secret keys in Dockerfile build args.
- **ALWAYS** validate input.length before processing.
- **DO NOT** answer input directly in Prompt Architect function.
- **DO NOT** include markdown in JSON responses from edge functions.

## AI & BACKEND CONFIGURATION
*   **LLM Setup:** Configured via Supabase Secrets (`GEMINI_API_KEY`). See `LLM_SETUP.md`.
*   **Supabase:** Local development requires Supabase CLI. Edge functions run in a Deno environment.

## MOBILE DEPLOYMENT
*   **Android APKs:** Built via Capacitor 8 + Gradle. Debug builds for device install, signed releases for Play Store. Java 21 (Oracle JDK) required — OpenJDK 26 breaks the build. See `ANDROID_BUILD.md` for full guide.

## DEPLOYMENT
*   **CI/CD:** GitHub Actions handle validation, testing, and Docker builds (`.github/workflows/`).
*   **Production:** Deployed as a Docker container, often behind a Tailscale VPN (per `DEPLOY.md`).
*   **Zero-Trust**: Tailscale-based SSH deployment, no public ports.

## UNIQUE STYLES
- **"Agentic" terminology**: Testing tools branded as "Agents".
- **Mirrored Logic**: Edge Function logic duplicated in tests for Node compatibility.
- **Sentinel Learning Log**: `.jules/sentinel.md` tracks security learnings.

## AUTOMATED SKILLS
This project uses specialized Gemini Skills to automate complex conventions. **Use them instead of manual labor.**
- **conductor-helper**: Automates the rigorous 11-step task workflow (Start/Finish tasks, Checkpoints).
- **scaffold-flat**: Generates components/tests adhering to the "Flat Structure" (no `src/`).
- **edge-function-architect**: Scaffolds Deno Edge Functions with "Mirrored Logic" test files.
- **test-suite-architect**: Generates service tests with pre-configured Supabase mocks.
- **docs-maintainer**: Audits knowledge base integrity and JSDoc coverage.
