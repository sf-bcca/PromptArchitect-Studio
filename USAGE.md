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

4.  **History**
    - Your recent prompts are saved automatically.
    - Scroll down to the "Recent Architecture" section to view previous iterations.
    - Click on a history item to reload it into the main view.
