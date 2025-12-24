
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userInput } = await req.json();

    if (!userInput) {
      throw new Error("Missing userInput in request body");
    }

    const provider = Deno.env.get("LLM_PROVIDER") || "gemini";
    let text = "";

    const systemPrompt = `
      You are an expert Prompt Engineer. Your goal is to rewrite the following raw user idea into a strictly structured, high-performance prompt for an LLM.
      
      User Idea: "${userInput}"
      
      Return the response in pure JSON format with the following structure:
      {
        "refinedPrompt": "The fully engineered prompt text...",
        "explanation": "A brief explanation of the techniques used (e.g., persona, constraints)...",
        "suggestedVariables": ["variable1", "variable2"]
      }
      
      Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.
    `;

    if (provider === "ollama") {
      const ollamaUrl = Deno.env.get("OLLAMA_URL") || "http://localhost:11434";
      const ollamaModel = Deno.env.get("OLLAMA_MODEL") || "llama3.2";

      console.log(`Using Ollama provider at ${ollamaUrl} with model ${ollamaModel}`);

      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages: [{ role: "user", content: systemPrompt }],
          stream: false,
          options: {
            temperature: 0.1, // Keep it deterministic for structured output
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      text = data.message?.content || "";

    } else {
      // Default to Gemini
      const apiKey = Deno.env.get("GEMINI_API_KEY");
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = Deno.env.get("GEMINI_MODEL") || "gemini-3-flash-preview";
      const model = genAI.getGenerativeModel({ model: modelName });

      console.log(`Using Gemini provider with model ${modelName}`);
      
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      text = response.text();
    }

    // Clean up potential markdown formatting if the model persists in sending it
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedResult;
    try {
        parsedResult = JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse JSON:", cleanedText);
        parsedResult = {
            refinedPrompt: cleanedText,
            explanation: "Raw output returned due to parsing error. Provider: " + provider,
            suggestedVariables: []
        };
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
