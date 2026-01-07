# AI Agents and Tools

This document outlines the AI agents, Model Context Protocol (MCP) servers, and internal engine components used in the development and operation of the **PromptArchitect-Studio** project.

## Reasoning Engines

### **Google Gemini Models (Cloud)**

- **Gemini 3.0 Flash**: The new standard for speed and intelligence (`gemini-3.0-flash`).
- **Gemini 3.0 Pro (Preview)**: Google's most powerful reasoning model (`gemini-3-pro-preview`).
- **Gemini Flash-Lite 2.5**: Extremely efficient model for high-frequency tasks (`gemini-2.5-flash-lite`).

- **Implementation**: Managed by the **Prompt Architect** service (Supabase Edge Function), utilizing a modern Google Generative AI SDK (v0.24+) for reliable multi-model support.

### **Local Models (Ollama)**

Hosted on your own server. Best for privacy and offline usage.

- **Llama 3.2 (3B)**: Meta's latest lightweight model. Fast and efficient.
- **Gemma 3 (4B)**: Google's latest multimodal model. Powerful reasoning in a compact size.
- **Gemma 2 (2B)**: Google's open model, optimized for local devices.
- **Note**: Larger models (8B+) are disabled to prevent server overload.

- **Implementation**: Containerized service running Ollama, accessed via Cloudflare Tunnel.

---

## Core Development Agents

### **Antigravity**

**Role:** Primary AI Coding Assistant

- **Task**: Intelligence Code Authoring, Workflow Automation, and Problem Solving.
- **Workflow**: Manages the development lifecycle from planning to verification using structured artifacts.

### **Scribe**

**Role:** Documentation Guardian

- **Task**: Maintaining project accuracy, clarity, and consistency across all documentation (README, INSTALL, USAGE, etc.).

---

## Internal Agentic Services

### **Prompt Architect (Service)**

**Role:** Expert Prompt Engineer

- **Description**: A specialized internal service (Supabase Edge Function) that transforms raw user ideas into structured prompt frameworks.
- **Privacy-by-Design**: Prompt history is strictly private and user-scoped. Each entry is tagged with the user's encrypted ID and protected by Row Level Security (RLS), ensuring that users can only access their own history.
- **Process**: Applies advanced techniques such as persona assignment, constraint definition, and variable extraction to ensure optimal LLM performance.

---

## Verification & Monitoring Agents

### **Playwright (Verification Agent)**

**Role:** Automated QA Engineer

- **Description**: Provides end-to-end (E2E) testing and verification of the application's user interface and functional flows.
- **Usage**: Runs automated verification steps to ensure that features remain stable across updates (`npm run test:e2e`).

### **Vitest (Unit Tester)**

**Role:** Component Inspector

- **Description**: Fast unit testing framework powered by Vite.
- **Usage**: Validates individual components and internal logic ensures correctness before code integration (`npm test`).

### **Security & Quality Hooks**

**Role:** Pre-Commit Guard

- **Husky & SecretLint**: Automated "agents" that intercept commits to prevent credential leaks and ensure code quality standards are met before code reaches the repository.

### **Cloudflare Access (Service Auth)**

**Role:** Infrastructure Security Guard

- **Description**: Protects the self-hosted Ollama instance by requiring Service Tokens for all API requests.
- **Effect**: Ensures that only the authorized Supabase Edge Function can access the reasoning engine.

---

## MCP Servers

Model Context Protocol (MCP) servers extend agent capabilities by providing specialized tools:

### [Supabase MCP Server](https://github.com/supabase-community/supabase-mcp-server)

- **Database Management**: Schema management and SQL execution.
- **Edge Functions**: Management and deployment of the "Prompt Architect" services.

### [Docker MCP Gateway](https://github.com/mcp-gateway/docker-mcp-gateway)

- **Container Control**: Direct interaction with the Docker environment.
- **System Interaction**: Shell command execution for maintenance and setup tasks.
- **GitHub Operations**: Integration with organizational workflows.

---

## CI/CD Pipeline

Automated GitHub Actions workflows handle testing, building, and deployment:

### **PR Validation Workflow**

- **Trigger**: Pull requests to `main`
- **Steps**: TypeScript build, unit tests (Vitest), security scan (secretlint + npm audit)

### **E2E Test Workflow**

- **Trigger**: Pull requests + pushes to `main`
- **Steps**: Playwright browser tests in headless Chrome

### **Docker Build Workflow**

- **Trigger**: Pushes to `main` or version tags (`v*`)
- **Steps**: Builds Docker image, pushes to GitHub Container Registry (GHCR)

### **Deploy Workflow**

- **Trigger**: After successful Docker build
- **Steps**: Connects to self-hosted server via Tailscale, pulls latest image, restarts container
