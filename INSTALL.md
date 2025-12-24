# Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js) or [pnpm](https://pnpm.io/)

## Setup Steps

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/sf-bcca/PromptArchitect-Studio.git
    cd PromptArchitect-Studio
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Configuration**

    Create a `.env.local` file in the root directory. You will need Supabase credentials.

    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

    > **Note:** The `GEMINI_API_KEY` or `OLLAMA_URL` are securely managed by the Supabase Edge Function (`engineer-prompt`). See [LLM Setup Guide](LLM_SETUP.md) for backend configuration instructions.

4.  **Start Development Server**

    ```bash
    npm run dev
    # or
    pnpm dev
    ```

5.  **Access the Application**

    Open your browser and navigate to the local URL provided in the terminal (usually `http://localhost:5173`).
