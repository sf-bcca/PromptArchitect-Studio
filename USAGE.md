# Usage Guide

## Overview

PromptArchitect-Studio is a tool designed to help you engineer high-quality prompts for Large Language Models (LLMs). It uses an AI-powered backend to refine your basic ideas into structured, professional prompts.

## How to Use

1.  **Enter Your Idea**

    - In the main input box, describe what you want to achieve in plain English.
    - _Example:_ "I need a prompt to help me write a python script for scraping a website."
    - _Example:_ "Create a persona for a fitness coach who is strict but encouraging."

2.  **Engineer the Prompt**

    - Click the **"Transform Prompt"** button.
    - The system will process your request using either **Gemini 3 Flash** or **Llama 3.2** (via Ollama) depending on the project configuration.

3.  **Review the Results**

    - **Refined Prompt:** The main output. This is the engineered prompt you can copy and paste into ChatGPT, Claude, Gemini, etc.
    - **Why This Works:** An explanation of the techniques used (e.g., persona assignment, constraints).
    - **Suggested Variables:** Dynamic parts of the prompt you might want to customize (e.g., `[Target Audience]`, `[Tone]`).
    - **CO-STAR Breakdown:** A detailed breakdown of the Context, Objective, Style, Tone, Audience, and Response components.

4.  **History & Versioning**
    - Your recent prompts are saved automatically.
    - **Sidebar:** Access your full history from the sidebar (click the menu icon in the header).
    - **Forking:** Click the "Fork" button on any result or history item to use it as a base for a new prompt. This creates a version chain in the database.
    - **Management:** You can rename or delete items directly from the history sidebar.

5.  **Favorites**
    - Click the heart icon on any engineered prompt to save it to your "Favorites".
    - Favorites are persisted across sessions and can be accessed at the bottom of the main workbench.

6.  **Personalization & Settings**
    - Click the gear icon in the header to open the **Settings Panel**.
    - **Default Model:** Choose your preferred AI engine (Gemini or Ollama) to be used by default.
    - **Theme:** Switch between Light and Dark modes. The studio defaults to a premium Dark theme on first load.

## Tips for Better Results

- **Be Specific:** The more context you provide in your initial idea, the better the engineered prompt will be.
- **Iterate:** Use the "Fork" feature to refine your prompts multiple times.
- **Variables:** Pay attention to the `[Suggested Variables]`—filling these in before using the prompt in an LLM often yields significantly better results.
