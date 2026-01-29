# Contributing Guide

Thank you for your interest in contributing to PromptArchitect-Studio! We value your help in making this tool better.

## Workflow

We use a **trunk-based workflow** with automated CI/CD:

1.  **Fork and Clone**

    - Fork the repository to your GitHub account.
    - Clone it locally: `git clone https://github.com/YOUR_USERNAME/PromptArchitect-Studio.git`

2.  **Create a Branch**

    - Create a new branch from `main` for your feature or fix.
    - Naming convention: `feature/your-feature-name` or `fix/issue-description`.

3.  **Make Changes**

    - Write clean, documented code.
    - Ensure all new functions and components have JSDoc comments.
    - Run tests locally: `pnpm test` (unit) and `pnpm test:e2e` (E2E).

4.  **Security Checks**

    - We use `secretlint` to prevent accidental commit of secrets.
    - Before committing, run:
      ```bash
      pnpm secretlint
      ```
    - **Never** commit `.env` files or hardcoded API keys.

5.  **Open a Pull Request**

    - Push to your fork: `git push origin feature/your-feature-name`
    - Open a PR against `main` (trunk-based, no develop branch).
    - CI will automatically run: build, unit tests, E2E tests, and security scans.
    - Merging to `main` triggers automatic deployment.

## Gemini Skills
If you are using Gemini CLI, we have provided specialized skills to help you follow project conventions:
- **`conductor-helper`**: Manage tasks and phases.
- **`scaffold-flat`**: Create components with correct structure.
- **`edge-function-architect`**: Create backend functions with mirrored tests.
- **`test-suite-architect`**: Scaffold service tests with mocks.
- **`docs-maintainer`**: Check documentation coverage.

## Coding Standards

- **TypeScript**: Use strict typing. Avoid `any` whenever possible.
- **React**: Use functional components and Hooks.
- **Styling**: Use **Tailwind CSS 4** for all new components, following the project's established utility-first patterns.
- **Documentation**: Use JSDoc for functions; keep Markdown docs up-to-date.
