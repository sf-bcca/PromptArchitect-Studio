
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
    const { userInput, model, provider: reqProvider } = await req.json();

    if (!userInput) {
      throw new Error("Missing userInput in request body");
    }

    // Allow client to override provider, default to env var or gemini
    const provider = reqProvider || Deno.env.get("LLM_PROVIDER") || "gemini";
    let text = "";

    const systemPrompt = `
      ROLE: You are an expert Prompt Engineer. You are NOT an AI assistant that answers questions. Your ONLY goal is to take a raw idea and rewrite it into a professional, high-quality prompt for ANOTHER AI to answer.

      INPUT: "${userInput}"

      OBJECTIVE:
      - Do NOT answer the input.
      - **MANDATORY FRAMEWORK**: You MUST use the **CO-STAR** framework for every "Refined Prompt".
        1. **C**ontext: detailed background.
        2. **O**bjective: precise goal.
        3. **S**tyle: specific expert persona (e.g., "Cynical VC with 20 years exp").
        4. **T**one: emotion/attitude (e.g., "Direct, skeptical").
        5. **A**udience: target reader.
        6. **R**esponse: strict format requirements.

      - **Expert Profile**: Do not just say "You are an X". Add specificity: "You are an X with Y years experience in Z field."
      - **Geographical Constraints**: Respect locations (e.g., "Grenada, MS" vs "Grenada").

      EXAMPLE:
      Input: "Pitch a B2B SaaS."
      Refined Prompt: "CONTEXT: We are pre-seed B2B SaaS founders. OBJECTIVE: Critique our pitch deck. STYLE: You are a cynical Silicon Valley Venture Capitalist with 20 years of experience in SaaS. TONE: Direct, professional, slightly skeptical. AUDIENCE: Internal founding team. RESPONSE: Provide a bulleted list of the top 3 risks, followed by a raw 'Investment Verdict'."

      OUTPUT FORMAT (Strict JSON):
      {
        "refinedPrompt": "The fully engineered prompt text...",
        "whyThisWorks": "A detailed explanation of the prompt engineering techniques used...",
        "suggestedVariables": ["variable1", "variable2"]
      }
    `;

    if (provider === "ollama") {
      const ollamaUrl = Deno.env.get("OLLAMA_URL") || "http://localhost:11434";
      // Allow overriding the model from the client, otherwise fallback to env or default
      const ollamaModel = model || Deno.env.get("OLLAMA_MODEL") || "llama3.2";

      console.log(`Using Ollama provider at ${ollamaUrl} with model ${ollamaModel}`);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      
      // Cloudflare Access Service Auth headers
      const cfId = Deno.env.get("CF_ACCESS_CLIENT_ID");
      const cfSecret = Deno.env.get("CF_ACCESS_CLIENT_SECRET");
      
      if (cfId && cfSecret) {
        console.log("Adding Cloudflare Access headers to request");
        headers["CF-Access-Client-Id"] = cfId;
        headers["CF-Access-Client-Secret"] = cfSecret;
      }

      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: ollamaModel,
          messages: [{ role: "user", content: systemPrompt }],
          format: "json", // Force valid JSON output
          stream: false,
          options: {
            temperature: 0.3, // Slightly higher creativity for better explanations
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
      // Use model from request, or env var, or default to flash
      const modelName = model || Deno.env.get("GEMINI_MODEL") || "gemini-3.0-flash"; 
      const genModel = genAI.getGenerativeModel({ model: modelName });

      console.log(`Using Gemini provider with model ${modelName}`);
      
      const result = await genModel.generateContent(systemPrompt);
      const response = await result.response;
      text = response.text();
    }

    // Clean up potentially messy JSON
    let cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Fix common JSON errors from small models (unescaped newlines)
    cleanedText = cleanedText.replace(/(?<!\\)\n/g, "\\n");

    let parsedResult;
    try {
        parsedResult = JSON.parse(cleanedText);
        
        // Handle field mapping
        if (parsedResult.explanation && !parsedResult.whyThisWorks) {
            parsedResult.whyThisWorks = parsedResult.explanation;
        }
    } catch (e) {
        console.warn("JSON Parse Failed, attempting Regex fallback:", e);
        
        // Regex Fallback Strategy
        const promptMatch = text.match(/"refinedPrompt":\s*"([^"]*)"/);
        const whyMatch = text.match(/"whyThisWorks":\s*"([^"]*)"/);
        
        if (promptMatch) {
            parsedResult = {
                refinedPrompt: promptMatch[1],
                whyThisWorks: whyMatch ? whyMatch[1] : "Explanation could not be parsed.",
                suggestedVariables: []
            };
        } else {
            // Last resort: Just show the raw text as the refined prompt
            parsedResult = {
                refinedPrompt: text,
                whyThisWorks: "Raw output returned due to parsing error. Provider: " + provider,
                suggestedVariables: []
            };
        }
    }

    // Add metadata
    parsedResult.provider = provider;
    // Add metadata
    parsedResult.provider = provider;
    parsedResult.model = provider === "ollama" 
      ? (model || Deno.env.get("OLLAMA_MODEL") || "llama3.2")
      : (model || Deno.env.get("GEMINI_MODEL") || "gemini-3.0-flash");

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
