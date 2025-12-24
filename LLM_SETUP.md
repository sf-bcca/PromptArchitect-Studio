# LLM Setup Guide: Gemini & Ollama

This document explains how to configure PromptArchitect-Studio to use either Google Gemini or a self-hosted Llama 3.2 via Ollama.

## 1. Provider Configuration

The application uses the `LLM_PROVIDER` environment variable in the Supabase Edge Function to determine which model to use.

- **`gemini` (Default)**: Uses Google Gemini 3 Flash. Requires `GEMINI_API_KEY`.
- **`ollama`**: Uses a self-hosted Ollama instance. Requires `OLLAMA_URL` and `OLLAMA_MODEL`.

## 2. Setting up Google Gemini

1. Obtain an API Key from the [Google AI Studio](https://aistudio.google.com/).
2. Set the following secrets in your Supabase project:
   ```bash
   supabase secrets set LLM_PROVIDER=gemini
   supabase secrets set GEMINI_API_KEY=your_key_here
   ```

## 3. Setting up Ollama (Self-Hosted)

### Step 1: Start Ollama

The `docker-compose.yml` is already configured with an `ollama` service. To start it:

```bash
docker-compose up -d ollama
```

### Step 2: Initialize Llama 3.2

Run the provided helper script to pull the model:

```bash
./ollama-init.sh
```

Or manually:

```bash
docker exec -it ollama ollama pull llama3.2
```

### Step 3: Networking (Cloudflare Tunnel)

If you are using **Supabase Cloud**, the Edge Function cannot reach `localhost`. You must use a tunnel.
According to your choice, use **Cloudflare Tunnel** to expose port `11434` and get a public URL (e.g., `https://ollama.yourdomain.com`).

### Step 4: Configure Supabase

Set the provider and your tunnel URL:

```bash
supabase secrets set LLM_PROVIDER=ollama
supabase secrets set OLLAMA_URL=https://ollama.yourdomain.com
supabase secrets set OLLAMA_MODEL=llama3.2
```

## 4. Local Development

If running Supabase locally (`supabase start`), you can use the internal Docker network. The `OLLAMA_URL` would be `http://ollama:11434`.

---

**Tip**: You can switch between providers at any time by updating the `LLM_PROVIDER` secret.
