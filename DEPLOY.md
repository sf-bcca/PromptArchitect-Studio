# Docker Deployment Guide for PromptArchitect-Studio

This guide provides step-by-step instructions for deploying the **PromptArchitect-Studio** application using Docker. It covers prerequisites, building the image, and running the container in a production-like environment.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your target machine (VM or local):

- **Docker Engine**: [Install Docker](https://docs.docker.com/engine/install/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/) (Included with Docker Desktop and recent Linux versions)
- **Git**: To clone the repository.
- **Supabase Credentials**: You will need your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## 2. Web Application Context

- **Framework**: React (Vite) + TypeScript
- **Production Server**: Nginx (Alpine Linux)
- **Internal Container Port**: 80
- **Secrets**: Public Supabase keys are baked into the build; **Private keys (like Gemini API Key) are NOT required** and should not be included.

## 3. Configuration Files Overview

We have added the following files to the repository to facilitate Docker deployment:

- **`Dockerfile`**: A multi-stage build script.
  - _Stage 1 (Builder)_: Uses `node:20-alpine` to install dependencies and compile the React app. It accepts build arguments for Supabase keys.
  - _Stage 2 (Production)_: Uses `nginx:alpine` to serve the static files. It copies the build artifacts from Stage 1 and a custom Nginx config.
- **`nginx.conf`**: A custom Nginx configuration that handles Single Page Application (SPA) routing (redirecting 404s to `index.html`) and enables Gzip compression.
- **`docker-compose.yml`**: Orchestrates the build and execution. It maps the host port to the container and passes environment variables.
- **`.dockerignore`**: Ensures strictly necessary files are sent to the Docker daemon, excluding `node_modules`, `.env`, and secrets.

## 4. Deployment Steps

### Step 1: Clone and Navigate

Clone the repository to your VM and navigate to the project directory:

```bash
git clone <repository_url>
cd PromptArchitect-Studio
```

### Step 2: Create Environment File

Create a `.env` file in the root directory to store your configuration. This file is excluded from Git for security.

```bash
nano .env
```

Add the following content (replace with your actual values):

```ini
# Supabase Configuration (Required for Build)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Host Port Configuration
# This determines which port on your VM the app will be accessible from.
# Default is 8080 if not specified.
APP_PORT=8080
```

> **Security Note:** Do **NOT** add your `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to this file or the Docker build. The application uses a Supabase Edge Function to handle API calls securely.

### Step 3: Build and Run with Docker Compose

Run the following command to build the image and start the container in detached mode (background):

```bash
docker-compose up -d --build
```

- `--build`: Forces a rebuild of the image (useful if you changed the code or `.env` vars).
- `-d`: Detached mode.

### Step 4: Verification

Check if the container is running:

```bash
docker-compose ps
```

You should see a service named `web` with status `Up`.

To verify the application is accessible, open your browser or use curl on the VM:

```bash
curl http://localhost:8080
```

(Replace `8080` with the port you defined in `APP_PORT`).

## 5. Troubleshooting

- **Port Conflicts**: If you see an error like `Bind for 0.0.0.0:8080 failed: port is already allocated`, change the `APP_PORT` in your `.env` file to a free port (e.g., 8081) and restart:
  ```bash
  docker-compose down
  docker-compose up -d
  ```
- **Missing Supabase Keys**: If the app loads but Supabase calls fail, ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` were correct in the `.env` file **before** you ran the build. Since Vite bakes these into the Javascript, you must rebuild the image if you change them:
  ```bash
  docker-compose build --no-cache
  docker-compose up -d
  ```
- **404 on Refresh**: If refreshing a sub-page (e.g., `/dashboard`) gives a 404 Nginx error, verify that the `nginx.conf` file is correctly copied and contains the `try_files $uri $uri/ /index.html;` directive.

## 6. Production Considerations

- **Reverse Proxy**: As mentioned, you plan to use **Nginx Proxy Manager**. Point it to your VM's IP and the `APP_PORT` (e.g., `http://10.0.0.5:8080`).
- **SSL/TLS**: Handle SSL termination at the Nginx Proxy Manager level. The Docker container serves plain HTTP on port 80.
- **Updates**: To update the application:
  1.  `git pull`
  2.  `docker-compose up -d --build`
  3.  `docker image prune -f` (to clean up old layers).

## 7. Edge Function Deployment

The Prompt Architect service (Edge Function) runs on Supabase's infrastructure, **separate from the Docker container**. It must be deployed whenever you change code in `supabase/functions/`.

### Automated Deployment (Recommended)

This repository includes a GitHub Action (`.github/workflows/deploy-functions.yml`) that automatically deploys the function when you push changes to the `main` branch.

**Requirements:**

- GitHub Secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` must be set.

### Manual Deployment (Fallback)

If the automation fails or you are developing locally, you can deploy manually using the Supabase CLI.

**CRITICAL**: You MUST use the `--no-verify-jwt` flag. This disables Supabase's default JWT verification gateway, allowing our application (which handles its own auth validation internally) to call the function.

```bash
supabase functions deploy engineer-prompt --no-verify-jwt
```

**If you forget the flag**, the app will fail with a "non-2xx status code" error.
