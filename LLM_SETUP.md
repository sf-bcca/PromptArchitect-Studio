# LLM Setup Guide: Gemini

This guide explains how to configure PromptArchitect-Studio to use Gemini.

## Provider Overview

| Provider             | Best For                          | Requirements                                   |
| -------------------- | --------------------------------- | ---------------------------------------------- |
| **Gemini** (Default) | Fastest setup                    | Gemini API Key                                 |

The `LLM_PROVIDER` environment variable in the Supabase Edge Function is set to `gemini` by default.

---

## Option 1: Gemini (Recommended)
...
**✅ Done!** The Edge Function will now use Gemini 3.1 Flash-Lite by default.

---

## Option 2: Local Gemma 3 (LiteRT-LM)

For developers wanting a high-reliability fallback or offline inference, the studio supports local Gemma 3 via [LiteRT-LM](https://github.com/google/litert-lm).

### Step 1: Install & Run LiteRT-LM

1. Ensure you have Node.js installed.
2. Follow the LiteRT-LM documentation to install and download the Gemma 3 model.
3. Start the inference server on port `8080` (the studio's default endpoint):
   ```bash
   # Example LiteRT-LM command
   npx @google/litert-lm serve --port 8080 --model gemma-3-4b-it
   ```

### Step 2: Automatic Detection

The studio automatically pings `localhost:8080` on load. If a valid server is detected:
- **"Gemma 3 (Local)"** will appear in the model selector.
- Requests will be routed directly from your browser to the local server, bypassing Supabase.

> **Note:** Local inference is only available when the server is running on the same machine as your browser.

---

## Troubleshooting

| Error                                          | Cause                               | Solution                                                             |
| ---------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `Edge Function returned a non-2xx status code` | Invalid or missing API key          | Verify `GEMINI_API_KEY` is set correctly: `supabase secrets list`    |
| `CORS error` in browser console                | Supabase Edge Function issue        | Redeploy: `supabase functions deploy engineer-prompt`                |

> **Tip:** If you encounter issues with newer Gemini models, ensure the Supabase Edge Function is using the latest version of the `@google/genai` SDK.
