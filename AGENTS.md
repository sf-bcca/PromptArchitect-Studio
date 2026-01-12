# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-12
**Commit:** HEAD
**Branch:** main

## OVERVIEW
PromptArchitect-Studio is a React 19 + TypeScript + Supabase web application for engineering AI prompts using the CO-STAR framework.

## STRUCTURE
```
./                    # Flat structure - NO src/ directory (major deviation)
├── components/        # UI components (10 files)
├── services/          # API/logic layer (3 files) 
├── hooks/             # React hooks (2 files)
├── context/           # React context (2 files)
├── test/              # Unit tests with Vitest
├── e2e/               # E2E tests with Playwright
├── supabase/
│   ├── functions/     # Edge Functions (Deno runtime)
│   └── migrations/    # Database migrations
└── docs/              # Project documentation
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| App routing | App.tsx | Main application logic |
| Component library | components/ | Flat structure, needs subdirs soon |
| API logic | services/ | Supabase client setup |
| Prompt engineering | supabase/functions/engineer-prompt/ | Core backend logic |
| Build config | vite.config.ts | Port 5174, @/ path alias |
| Testing | test/, e2e/ | Vitest + Playwright |

## CONVENTIONS
- **Flat Root**: All source code in root (NO src/ directory) - primary deviation
- **Path Aliases**: Use @/ to reference root directory
- **Security**: SecretLint enforced via Husky pre-commit hooks
- **TypeScript**: Strict mode, no `any` types allowed
- **React**: Functional components + hooks only
- **Documentation**: JSDoc required for all new functions
- **Testing**: Dual framework - Vitest (unit) + Playwright (E2E)

## ANTI-PATTERNS (THIS PROJECT)
- **NEVER** commit .env files or hardcoded secrets
- **NEVER** use `any` type - strict TypeScript only
- **NEVER** pass secret keys in Dockerfile build args
- **ALWAYS** validate input.length before processing
- **DO NOT** answer input directly in Prompt Architect function
- **DO NOT** include markdown in JSON responses from edge functions

## UNIQUE STYLES
- **"Agentic" terminology**: Testing tools branded as "Agents"
- **Mirrored Logic**: Edge Function logic duplicated in tests for Node compatibility
- **Zero-Trust Deployment**: Tailscale-based SSH deployment, no public ports
- **Sentinel Learning Log**: .jules/sentinel.md tracks security learnings

## COMMANDS
```bash
pnpm dev          # Development server on port 5174
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright E2E tests
pnpm build        # Production build
pnpm lint         # TypeScript + SecretLint
```

## NOTES
- Dev server runs on port 5174 (not default 5173)
- LSP TypeScript server not installed - needs global install
- Project uses "Flat Structure" - major deviation from standard React/Vite patterns
- Tailscale required for deployment access
- Supabase Edge Functions run on Deno (not Node)