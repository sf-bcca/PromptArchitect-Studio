# AI Agents and Tools

This document outlines the AI agents, Model Context Protocol (MCP) servers, and internal engine components used in the development and operation of the **PromptArchitect-Studio** project.

## Reasoning Engines

### **Google Gemini 3 Flash**

- **Role**: High-performance intelligence provider.
- **Capabilities**: Expert prompt engineering, structural reasoning, and high-velocity response generation.
- **Implementation**: Default provider accessed via Supabase Edge Functions.

### **Ollama (Llama 3.2)**

- **Role**: Self-hosted intelligence provider.
- **Capabilities**: Local reasoning, privacy-focused engineering, and efficient processing on commodity hardware.
- **Implementation**: Containerized service running Llama 3.2, integrated via OpenAI-compatible API.

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
