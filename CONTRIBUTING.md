# Contributing Guide

Thank you for your interest in contributing to PromptArchitect-Studio! We value your help in making this tool better.

## Workflow

1.  **Fork and Clone**
    *   Fork the repository to your GitHub account.
    *   Clone it locally: `git clone https://github.com/YOUR_USERNAME/PromptArchitect-Studio.git`

2.  **Create a Branch**
    *   Create a new branch for your feature or fix.
    *   Naming convention: `feature/your-feature-name` or `fix/issue-description`.

3.  **Make Changes**
    *   Write clean, documented code.
    *   Ensure all new functions and components have JSDoc comments.

4.  **Security Checks**
    *   We use `secretlint` to prevent accidental commit of secrets.
    *   Before committing, run:
        ```bash
        npm run secretlint
        ```
    *   **Never** commit `.env` files or hardcoded API keys.
    *   Note: Backend logic resides in `supabase/functions/`, not a root `functions/` directory.

5.  **Commit and Push**
    *   Commit your changes with a clear message.
    *   Push to your fork: `git push origin feature/your-feature-name`

6.  **Pull Request**
    *   Open a Pull Request (PR) against the `main` branch of the original repository.
    *   Describe your changes and link to any relevant issues.

## Coding Standards

*   **TypeScript**: Use strict typing. Avoid `any` whenever possible.
*   **React**: Use functional components and Hooks.
*   **Styling**: Use Tailwind CSS (via utility classes) or standard CSS as established in the project.
*   **Documentation**:
    *   Use JSDoc for functions and interfaces.
    *   Keep Markdown documentation up-to-date with code changes.
