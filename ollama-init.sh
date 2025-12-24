#!/bin/bash

echo "🚀 Initializing Ollama with Llama 3.2..."

# Wait for Ollama service to be ready
echo "Waiting for Ollama to start..."
until curl -s http://localhost:11434/api/tags > /dev/null; do
  sleep 2
done

echo "✅ Ollama is up. Pulling Llama 3.2 model..."
docker exec -it ollama ollama pull llama3.2

echo "🎉 Done! Llama 3.2 is ready to use."
