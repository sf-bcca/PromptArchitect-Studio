# LLM Setup Guide: Gemini

This guide explains how to configure PromptArchitect-Studio to use Gemini.

## Provider Overview

| Provider             | Best For                          | Requirements                                   |
| -------------------- | --------------------------------- | ---------------------------------------------- |
| **Gemini** (Default) | Fastest setup                    | Gemini API Key                                 |

The `LLM_PROVIDER` environment variable in the Supabase Edge Function is set to `gemini` by default.

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

**✅ Done!** The Edge Function will now use Gemini 2.5 Flash-Lite by default.

---

## Troubleshooting

| Error                                          | Cause                               | Solution                                                             |
| ---------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `Edge Function returned a non-2xx status code` | Invalid or missing API key          | Verify `GEMINI_API_KEY` is set correctly: `supabase secrets list`    |
| `CORS error` in browser console                | Supabase Edge Function issue        | Redeploy: `supabase functions deploy engineer-prompt`                |

> **Tip:** If you encounter issues with newer Gemini models, ensure the Supabase Edge Function is using the latest version of the `@google/genai` SDK.
