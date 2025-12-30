# LLM Setup Guide: Gemini & Ollama

This guide explains how to configure PromptArchitect-Studio to use either Google Gemini (cloud) or a self-hosted Llama 3.2 via Ollama.

## Provider Overview

| Provider             | Best For                          | Requirements                                   |
| -------------------- | --------------------------------- | ---------------------------------------------- |
| **Gemini** (Default) | Fastest setup, cloud-hosted       | Gemini API Key                                 |
| **Ollama**           | Privacy, offline use, self-hosted | Docker, Cloudflare Tunnel (for Supabase Cloud) |

The `LLM_PROVIDER` environment variable in the Supabase Edge Function determines which model to use.

---

## Option 1: Google Gemini (Recommended)

### Step 1: Obtain API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key (or use an existing one)

### Step 2: Configure Supabase

Set the following secrets in your Supabase project:

```bash
supabase secrets set LLM_PROVIDER=gemini
supabase secrets set GEMINI_API_KEY=your_key_here
```

**✅ Done!** The Edge Function will now use Gemini 3 Flash.

---

## Option 2: Ollama (Self-Hosted)

> **Prerequisites:**
>
> - Docker installed on your server
> - A domain name (for Cloudflare Tunnel)
> - [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)

### Step 1: Start Ollama

The `docker-compose.yml` is already configured with an `ollama` service:

```bash
docker-compose up -d ollama
```

### Step 2: Pull the LLM Model

Run the provided helper script:

```bash
./ollama-init.sh
```

Or manually:

```bash
docker exec -it ollama ollama pull llama3.2
```

### Step 3: Expose via Cloudflare Tunnel

**Why is this needed?** Supabase Cloud Edge Functions cannot reach `localhost`. You must expose Ollama through a public, secure tunnel.

#### Quick Cloudflare Setup:

1. Install `cloudflared`:

   ```bash
   # macOS
   brew install cloudflared

   # Linux
   curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
   chmod +x cloudflared && sudo mv cloudflared /usr/local/bin/
   ```

2. Authenticate with Cloudflare:

   ```bash
   cloudflared tunnel login
   ```

3. Create a tunnel:

   ```bash
   cloudflared tunnel create ollama-tunnel
   ```

4. Configure the tunnel (create `~/.cloudflared/config.yml`):

   ```yaml
   tunnel: ollama-tunnel
   credentials-file: /path/to/credentials.json

   ingress:
     - hostname: ollama.yourdomain.com
       service: http://localhost:11434
     - service: http_status:404
   ```

5. Route DNS:

   ```bash
   cloudflared tunnel route dns ollama-tunnel ollama.yourdomain.com
   ```

6. Start the tunnel:
   ```bash
   cloudflared tunnel run ollama-tunnel
   ```

Your Ollama instance is now available at `https://ollama.yourdomain.com`.

### Step 4: Configure Supabase

Set the provider and your tunnel URL:

```bash
supabase secrets set LLM_PROVIDER=ollama
supabase secrets set OLLAMA_URL=https://ollama.yourdomain.com
supabase secrets set OLLAMA_MODEL=llama3.2
```

---

## Local Development

If running Supabase locally (`supabase start`), you can use the internal Docker network. The Ollama URL would be `http://ollama:11434` (no tunnel required).

---

## Troubleshooting

| Error                                          | Cause                               | Solution                                                             |
| ---------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `Edge Function returned a non-2xx status code` | Invalid or missing API key          | Verify `GEMINI_API_KEY` is set correctly: `supabase secrets list`    |
| `Connection refused` to Ollama                 | Tunnel not running or misconfigured | Check `cloudflared tunnel run` is active; verify URL in `OLLAMA_URL` |
| `Model not found`                              | Model not pulled                    | Run `./ollama-init.sh` or `docker exec ollama ollama pull llama3.2`  |
| `CORS error` in browser console                | Supabase Edge Function issue        | Redeploy: `supabase functions deploy engineer-prompt`                |
| Slow responses from Ollama                     | Model too large for hardware        | Use a smaller model: `gemma2:2b` or `llama3.2:3b`                    |

---

## Switching Providers

You can switch between providers at any time:

```bash
# Switch to Gemini
supabase secrets set LLM_PROVIDER=gemini

# Switch to Ollama
supabase secrets set LLM_PROVIDER=ollama
```

> **Tip:** If you encounter issues with newer Gemini models, ensure the Supabase Edge Function is using the latest version of the `@google/genai` SDK.
