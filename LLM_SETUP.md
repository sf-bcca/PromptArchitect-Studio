# LLM Setup Guide: Gemini

This guide explains how to configure PromptArchitect-Studio to use Gemini.

## Provider Overview

| Provider             | Best For                          | Requirements                                   |
| -------------------- | --------------------------------- | ---------------------------------------------- |
| **Gemini** (Default) | Fastest setup                    | Gemini API Key                                 |
| **Gemma 4** (Local)  | Privacy / No cost / Reliability  | Local Inference Service (Port 8080)            |

The `LLM_PROVIDER` environment variable in the Supabase Edge Function is set to `gemini` by default. The frontend automatically falls back to **Gemma 4** if Gemini is unavailable.

---

## Option 1: Gemini (Recommended)

### Step 1: Obtain API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key (or use an existing one)

### Step 2: Configure Supabase

Set the following secrets in your Supabase project:

```bash
supabase secrets set LLM_PROVIDER=gemini
supabase secrets set GEMINI_API_KEY=your_key_here
```

**✅ Done!** The Edge Function will now use Gemini 3.1 Flash-Lite (Stable) by default.

---

## Option 2: Gemma 4 (Local Inference)

PromptArchitect-Studio supports local inference using **Gemma 4** (LiteRT-LM). This is used as a manual selection or as an automatic fallback when Gemini returns `503 Service Unavailable` or `429 Too Many Requests`.

### Configuration

The local AI service must be reachable at the IP configured in `vite.config.ts`. By default, this is proxied through `/local-ai`.

1. **Proxy Setup**: Ensure `vite.config.ts` has the correct target IP:
   ```typescript
   proxy: {
     '/local-ai': {
       target: 'http://100.115.102.53:8080', // Update this to your local service IP
       changeOrigin: true,
       rewrite: (path) => path.replace(/^\/local-ai/, '')
     }
   }
   ```

2. **Automatic Fallback**: No manual configuration is needed for the fallback logic. It is handled in `services/geminiService.ts`.

3. **Manual Selection**: You can manually select "Gemma 4 (Local Inference)" from the model selector in the UI.

---

## Troubleshooting

| Error                                          | Cause                               | Solution                                                             |
| ---------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `Edge Function returned a non-2xx status code` | Invalid or missing API key          | Verify `GEMINI_API_KEY` is set correctly: `supabase secrets list`    |
| `CORS error` in browser console                | Supabase Edge Function issue        | Redeploy: `supabase functions deploy engineer-prompt`                |
| `Local AI returned 404/500`                    | Local service offline or misconfigured | Ensure the inference service is running on port 8080 at the target IP. |
| `Automatic fallback triggered` (Notification)  | Gemini is overloaded                | The system has automatically switched to your local Gemma 4 model.   |

> **Tip:** If you encounter issues with newer Gemini models, ensure the Supabase Edge Function is using the latest version of the `@google/genai` SDK.
