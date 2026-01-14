# Installation Guide

> ⏱️ **Setup takes ~5 minutes**

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement                    | Version | Notes                                 |
| ------------------------------ | ------- | ------------------------------------- |
| [Node.js](https://nodejs.org/) | v18+    | LTS recommended                       |
| [pnpm](https://pnpm.io/)       | Latest  | `npm install -g pnpm` to install      |
| Supabase Account               | —       | [Sign up free](https://supabase.com/) |

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/sf-bcca/PromptArchitect-Studio.git
cd PromptArchitect-Studio
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your values:

```ini
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** The `GEMINI_API_KEY` or `OLLAMA_URL` are securely managed by the Supabase Edge Function. See [LLM Setup Guide](LLM_SETUP.md) for backend configuration.

### 4. Start Development Server

```bash
pnpm dev
```

### 5. Verify Installation

You should see output similar to:

```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

Open [http://localhost:5174](http://localhost:5174) in your browser. You should see the PromptArchitect-Studio interface.

**✅ Success!** You're ready to start engineering prompts.

---

## Common Issues

| Problem                    | Solution                                                                         |
| -------------------------- | -------------------------------------------------------------------------------- |
| `pnpm: command not found`  | Install pnpm: `npm install -g pnpm`                                              |
| Port 5174 already in use   | Stop other dev servers or use `pnpm dev -- --port 5175`                          |
| Supabase connection errors | Verify `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Module not found errors    | Delete `node_modules` and run `pnpm install` again                               |

## Next Steps

- [Configure LLM Provider](LLM_SETUP.md) — Set up Gemini or Ollama
- [Learn the Interface](USAGE.md) — How to use the application
- [Deploy to Production](DEPLOY.md) — Docker deployment guide
