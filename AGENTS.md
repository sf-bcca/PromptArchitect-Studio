# AI Agents and Tools

This document outlines the AI agents and Model Context Protocol (MCP) servers used in the development and operation of the **PromptArchitect-Studio** project. These tools enhance productivity, ensure code quality, and provide seamless integration with external services.

## Core Agents

### **Antigravity**

**Role:** Primary AI Coding Assistant
Antigravity is the primary agentic AI coding assistant for this project. It provides:

- **Intelligent Code Authoring**: Assistance with React, TypeScript, and Vite-based development.
- **Workflow Automation**: Managing tasks, planning implementations, and verifying changes through structured artifacts.
- **Problem Solving**: Proactive debugging and architectural guidance.

### **Scribe**

**Role:** Documentation Guardian
Scribe is the meticulous Technical Writer responsible for the project's knowledge base. Scribe ensures:

- **Accuracy**: Documentation reflects the actual state of the codebase.
- **Clarity**: Guides and instructions are easy to understand for all users.
- **Consistency**: Documentation standards are maintained across all files (README, INSTALL, inline comments).

## MCP Servers

Model Context Protocol (MCP) servers extend the agents' capabilities by providing specialized tools for various domains.

### [Supabase MCP Server](https://github.com/supabase-community/supabase-mcp-server)

The project heavily relies on Supabase for its backend infrastructure. The Supabase MCP server provides:

- **Database Management**: Executing SQL queries and managing database schemas.
- **Migrations**: Applying and listing migrations to track schema changes.
- **Edge Functions**: Deploying and managing Supabase Edge Functions.
- **Security & Performance**: Retrieving advisory notices for project health.

### [Docker MCP Gateway](https://github.com/mcp-gateway/docker-mcp-gateway)

A versatile gateway providing several integrated capabilities for environment management and external service interaction:

- **GitHub Operations**: Searching code, managing pull requests, and tracking issues across the organization.
- **Container Control**: Direct interaction with the Docker CLI for managing services.
- **System Interaction**: Safe execution of shell commands within the project environment.
- **Monitoring**: Executing PromQL queries via integrated Prometheus tools.
- **Knowledge Base**: Accessing up-to-date library documentation via Context7.

---

## Project-Specific Usage

### Streamlined Development Flow

By leveraging these agents, we maintain a high-velocity development cycle:

1. **Planning**: Antigravity creates implementation plans for new features.
2. **Documentation**: Scribe ensures all new features and changes are accurately documented before release.
3. **Environment**: Docker ensures consistency across different development setups.
4. **Backend Integration**: Supabase MCP allows for direct interaction with our database and edge functions without leaving the development environment.
5. **Validation**: Automated tasks and walkthroughs ensure that every change is verified and documented.

### Maintenance & Security

The integration of `secretlint` and `husky` (pre-commit hooks) ensures that sensitive information is never leaked, a process managed and verified by the AI agents.
