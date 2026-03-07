<div align="center">
  <img width="1200" height="475" alt="PromptArchitect Banner" src="docs/assets/banner.png" />
  
  # 🏛️ PromptArchitect-Studio
  
  **Transform basic ideas into professional-grade AI prompts with structured engineering techniques.**
  
  [![CI: Validation](https://github.com/sf-bcca/PromptArchitect-Studio/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/sf-bcca/PromptArchitect-Studio/actions/workflows/pr-validation.yml)
  [![CI: E2E Tests](https://github.com/sf-bcca/PromptArchitect-Studio/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/sf-bcca/PromptArchitect-Studio/actions/workflows/e2e-tests.yml)
  [![Build: Docker](https://github.com/sf-bcca/PromptArchitect-Studio/actions/workflows/docker-build.yml/badge.svg)](https://github.com/sf-bcca/PromptArchitect-Studio/actions/workflows/docker-build.yml)
  [![CD: Production](https://github.com/sf-bcca/PromptArchitect-Studio/actions/workflows/deploy.yml/badge.svg)](https://github.com/sf-bcca/PromptArchitect-Studio/actions/workflows/deploy.yml)
  <br />
  [![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-19.2.3-61DAFB.svg)](https://reactjs.org/)
  [![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash--Lite-4285F4.svg)](https://deepmind.google/technologies/gemini/)
</div>

---

> ⏱️ **Get started in under 5 minutes** — Clone, configure, and engineer your first prompt.

## 🌟 Overview

PromptArchitect-Studio is a powerful web-based tool designed to elevate your interaction with Large Language Models (LLMs). By applying advanced prompt engineering techniques—such as persona assignment, strict constraint definition, and output formatting—this tool transforms simple user inputs into comprehensive, high-performing prompt frameworks.

### 🚀 Key Features

- **👤 Persona Engineering**: Automatically assigns expert roles and personas to your tasks.
- **🎯 Constraint Driven**: Defines clear boundaries to ensure focused and high-quality AI outputs.
- **📋 Structured Output Control**: Generates prompts that demand specific formats for easy integration.
- **⚡ AI Powered**: Leverages **Gemini 2.5 Flash-Lite** (Default) for high-speed, high-quality prompt refinement.
- **🕰️ History, Favorites & Persistence**: Save, favorite, and revisit your engineered architectures using Supabase integration.

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Client
        A[React App]
    end
    subgraph Supabase
        B[Edge Function<br/>Prompt Architect]
        C[(PostgreSQL)]
    end
    subgraph LLM Providers
        D[Gemini API]
    end

    A -->|User Input| B
    B -->|Store History| C
    B -->|API Call| D
    B -->|Engineered Prompt| A
```

## 🚦 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ and [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) account and project
- A [Gemini API Key](https://aistudio.google.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/sf-bcca/PromptArchitect-Studio.git
cd PromptArchitect-Studio

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
pnpm dev
```

Open [http://localhost:5174](http://localhost:5174) — you're ready to engineer prompts!

## 📚 Documentation

| Guide                                 | Description                                    |
| ------------------------------------- | ---------------------------------------------- |
| [Installation Guide](INSTALL.md)      | Detailed setup and environment configuration   |
| [LLM Setup Guide](LLM_SETUP.md)       | Configure Gemini API                          |
| [Usage Guide](USAGE.md)               | How to use the application effectively         |
| [Deployment Guide](DEPLOY.md)         | Docker deployment for production               |
| [Contributing Guide](CONTRIBUTING.md) | Workflow and standards for developers          |
| [Agents & Tools](AGENTS.md)           | AI agents and MCP servers used in this project |

## 🛠️ Tech Stack

| Layer          | Technology                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------- |
| **Frontend**   | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)                      |
| **Build Tool** | [Vite 6](https://vite.dev/)                                                                         |
| **Styling**    | [Tailwind CSS 4](https://tailwindcss.com/)                                                           |
| **AI Engines** | [Gemini 2.5 Flash-Lite](https://ai.google.dev/) (Default)                                           |
| **Backend/DB** | [Supabase](https://supabase.com/)                                                                   |
| **Testing**    | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)                               |
| **Git Hooks**  | [Husky](https://typicode.github.io/husky/) + [SecretLint](https://github.com/secretlint/secretlint) |

## 🌐 Deployment

### Automated CI/CD Pipeline

Pushing to `main` triggers a fully automated deployment:

1. **Tests Run** — PR validation and E2E tests verify your changes
2. **Docker Build** — Image builds and pushes to [GitHub Container Registry](https://ghcr.io)
3. **Auto-Deploy** — Server pulls and restarts the container via Tailscale

### Manual Deployment

For manual or first-time deployment, see [DEPLOY.md](DEPLOY.md) for Docker Compose instructions.

## 🆘 Need Help?

- **Common Issues**: Check the [Troubleshooting](DEPLOY.md#5-troubleshooting) section
- **LLM Errors**: See [LLM Setup Guide](LLM_SETUP.md) for provider configuration
- **Bug Reports**: Open an [issue on GitHub](https://github.com/sf-bcca/PromptArchitect-Studio/issues)

---

<div align="center">
  <p>Developed with ❤️ by Expert Prompt Engineers</p>
</div>
