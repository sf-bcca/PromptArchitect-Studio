# Tech Stack: PromptArchitect-Studio

## Frontend & Styling
- **React 19:** Modern functional component architecture with full concurrent mode support.
- **TypeScript (~5.8):** Strict typing enforced across the entire application to ensure high maintainability.
- **Vite 6:** Ultra-fast development server and optimized production build pipeline.
- **Tailwind CSS 4:** Utility-first styling with advanced CSS-in-JS capabilities and full design token integration.

## Backend & Persistence
- **Supabase:** Core backend-as-a-service providing real-time data synchronization and authentication.
- **PostgreSQL:** Reliable relational database for storing prompt history, favorites, user settings, and metadata.
- **Deno (Edge Functions):** Serverless logic execution at the edge for low-latency prompt engineering transformations.

## AI Infrastructure
- **Google Gemini 3 Flash:** Primary cloud-based LLM for high-performance, cost-effective prompt engineering.
- **Ollama:** Self-hosted fallback or privacy-centric engine running **Llama 3.2**.
- **GenAI SDK:** Direct integration with Gemini's advanced multimodal and instruction-following capabilities.

## Quality & Security
- **Vitest:** Blazing fast unit and integration testing framework compatible with the Vite ecosystem.
- **Playwright:** Robust end-to-end testing ensuring cross-browser stability and performance.
- **SecretLint & Husky:** Automated security scans and git hooks to prevent credential leakage and ensure code quality.
- **Docker:** Consistent environment orchestration via Docker Compose for both development and production.
