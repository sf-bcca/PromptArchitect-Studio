
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.24.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Define the validation schema for the LLM output
const RefinedPromptSchema = z.object({
  refinedPrompt: z.string().describe("The fully engineered prompt text"),
  whyThisWorks: z.string().describe("Explanation of techniques used"),
  suggestedVariables: z.array(z.string()).describe("List of dynamic variables like [Audience]"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userInput, model, provider: reqProvider } = await req.json();

    // Initialize Supabase Client for DB persistence
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Identify the user from the Authorization header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    // Input Validation
    const ALLOWED_PROVIDERS = ["gemini", "ollama"];
    const ALLOWED_MODELS = {
      ollama: ["llama3.2", "gemma2:2b", "gemma3:4b"],
      gemini: [
        // App.tsx models
        "gemini-2.5-flash-lite", "gemini-3.0-flash", "gemini-3-pro-preview",
        // Standard/Legacy models
        "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"
      ],
    };

    if (reqProvider && !ALLOWED_PROVIDERS.includes(reqProvider)) {
        return new Response(JSON.stringify({ error: `Invalid provider. Allowed: ${ALLOWED_PROVIDERS.join(", ")}` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }

    // Allow client to override provider, default to env var or gemini
    const provider = reqProvider || Deno.env.get("LLM_PROVIDER") || "gemini";

    if (model) {
        const validModelsForProvider = ALLOWED_MODELS[provider as keyof typeof ALLOWED_MODELS];
        if (validModelsForProvider && !validModelsForProvider.includes(model)) {
             return new Response(JSON.stringify({ error: `Invalid model for provider '${provider}'. Allowed: ${validModelsForProvider.join(", ")}` }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        }
    }

    if (!userInput) {
      throw new Error("Missing userInput in request body");
    }

    if (typeof userInput !== "string" || userInput.length > 5000) {
      return new Response(JSON.stringify({ error: "Input invalid or too long. Max 5000 characters." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

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

      OUTPUT FORMAT (Strict JSON):
      You MUST return a valid JSON object matching this schema:
      {
        "refinedPrompt": "string",
        "whyThisWorks": "string",
        "suggestedVariables": ["string", "string"]
      }
      
      Do NOT include any markdown formatting like \`\`\`json. Just return the raw JSON string.
    `;

    if (provider === "ollama") {
      const ollamaUrl = Deno.env.get("OLLAMA_URL") || "http://localhost:11434";
      const ollamaModel = model || Deno.env.get("OLLAMA_MODEL") || "llama3.2";

      console.log(`Using Ollama provider at ${ollamaUrl} with model ${ollamaModel}`);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const cfId = Deno.env.get("CF_ACCESS_CLIENT_ID");
      const cfSecret = Deno.env.get("CF_ACCESS_CLIENT_SECRET");
      
      if (cfId && cfSecret) {
        headers["CF-Access-Client-Id"] = cfId;
        headers["CF-Access-Client-Secret"] = cfSecret;
      }

      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: ollamaModel,
          messages: [{ role: "user", content: systemPrompt }],
          format: "json",
          stream: false,
          options: {
            temperature: 0.3,
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
      const apiKey = Deno.env.get("GEMINI_API_KEY");
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = model || Deno.env.get("GEMINI_MODEL") || "gemini-3.0-flash"; 
      const genModel = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
              responseMimeType: "application/json",
          } 
      });

      console.log(`Using Gemini provider with model ${modelName}`);
      
      const result = await genModel.generateContent(systemPrompt);
      const response = await result.response;
      text = response.text();
    }

    // Attempt to clean and parse
    let cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedResult;
    try {
        const json = JSON.parse(cleanedText);
        // Validating with Zod
        parsedResult = RefinedPromptSchema.parse(json);
    } catch (e: any) {
        console.error("Validation Failed:", e);
        console.warn("Raw Output was:", text);
        
        // Fallback: Attempt to reconstruct a minimal valid object if at least prompt is present
        // This is a "best effort" repair for models that refuse to output perfect JSON
        if (text.includes("refinedPrompt")) {
            parsedResult = {
                refinedPrompt: text,
                 whyThisWorks: "Output could not be strictly parsed. Providing raw response.",
                 suggestedVariables: []
            }
        } else {
             throw new Error("Model failed to generate valid JSON: " + e.message);
        }
    }

    parsedResult.provider = provider;
    parsedResult.model = provider === "ollama" 
      ? (model || Deno.env.get("OLLAMA_MODEL") || "llama3.2")
      : (model || Deno.env.get("GEMINI_MODEL") || "gemini-3.0-flash");

    // PERSISTENCE: Save result to DB if user is authenticated
    if (userId) {
      console.log(`Saving history for user: ${userId}`);
      const { data: insertedData, error: dbError } = await supabase
        .from("prompt_history")
        .insert({
          user_id: userId,
          original_input: userInput,
          result: parsedResult
        })
        .select()
        .single();
      
      if (dbError) {
        console.error("Failed to save history to DB:", dbError);
      } else {
        // Add the inserted ID to the result so the frontend can track it
        parsedResult.id = insertedData.id;
      }
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
