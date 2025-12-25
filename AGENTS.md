# AI Agents and Tools

This document outlines the AI agents, Model Context Protocol (MCP) servers, and internal engine components used in the development and operation of the **PromptArchitect-Studio** project.

## Reasoning Engines

### **Google Gemini Models (Cloud)**

- **Gemini 3.0 Flash (Latest)**: The new standard for speed and intelligence (`gemini-3.0-flash`).
- **Gemini 3.0 Pro (Preview)**: Google's most powerful reasoning model (`gemini-3-pro-preview`).
- **Gemini Flash-Lite 2.5**: Extremely efficient model for high-frequency tasks (`gemini-2.5-flash-lite`).

- **Implementation**: Accessed via Supabase Edge Function directly to Google AI Studio API.

### **Local Models (Ollama)**

Hosted on your own server. Best for privacy and offline usage.

- **Llama 3.2 (3B)**: Meta's latest lightweight model. Fast and efficient.
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
- **Process**: Applies advanced techniques such as persona assignment, constraint definition, and variable extraction to ensure optimal LLM performance.

---

## Verification & Monitoring Agents

### **Playwright (Verification Agent)** (Planned)

**Role:** Automated QA Engineer

- **Description**: Will provide end-to-end (E2E) testing and verification of the application's user interface and functional flows.
- **Usage**: Future automated verification steps to ensure that features remain stable across updates.

### **Security & Quality Hooks**

**Role:** Pre-Commit Guard

- **Husky & SecretLint**: Automated "agents" that intercept commits to prevent credential leaks and ensure code quality standards are met before code reaches the repository.

### **Cloudflare Access (Service Auth)**

**Role:** Infrastructure Security Guard

- **Description**: Projects the self-hosted Ollama instance by requiring Service Tokens for all API requests.
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
