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
  costar: z.object({
    context: z.string().describe("The Context component"),
    objective: z.string().describe("The Objective component"),
    style: z.string().describe("The Style component"),
    tone: z.string().describe("The Tone component"),
    audience: z.string().describe("The Audience component"),
    response: z.string().describe("The Response component"),
  }).describe("Breakdown of the CO-STAR components"),
});

/**
 * Standard Error Codes mapping to frontend types.ts
 */
const ErrorCode = {
  LLM_SERVICE_UNAVAILABLE: 'LLM_SERVICE_UNAVAILABLE',
  LLM_GENERATION_FAILED: 'LLM_GENERATION_FAILED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

function errorResponse(message: string, code: string, status = 400, details?: any) {
  return new Response(JSON.stringify({
    error: message,
    errorCode: code,
    details
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userInput, model, provider: reqProvider, task = 'engineer', parentId } = await req.json();

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
        "gemini-2.5-flash-lite", "gemini-3.0-flash", "gemini-3-pro-preview",
        "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"
      ],
    };

    if (reqProvider && !ALLOWED_PROVIDERS.includes(reqProvider)) {
        return errorResponse(`Invalid provider. Allowed: ${ALLOWED_PROVIDERS.join(", ")}`, ErrorCode.VALIDATION_ERROR);
    }

    const provider = reqProvider || Deno.env.get("LLM_PROVIDER") || "gemini";

    if (model) {
        const validModelsForProvider = ALLOWED_MODELS[provider as keyof typeof ALLOWED_MODELS];
        if (validModelsForProvider && !validModelsForProvider.includes(model)) {
             return errorResponse(`Invalid model for provider '${provider}'. Allowed: ${validModelsForProvider.join(", ")}`, ErrorCode.VALIDATION_ERROR);
        }
    }

    if (!userInput) {
      return errorResponse("Missing userInput in request body", ErrorCode.VALIDATION_ERROR);
    }

    if (typeof userInput !== "string" || userInput.length > 5000) {
      return errorResponse("Input invalid or too long. Max 5000 characters.", ErrorCode.VALIDATION_ERROR);
    }

    let text = "";
    let systemPrompt = "";
    
    if (task === 'title') {
      systemPrompt = `
        ROLE: You are an expert Editor.
        INPUT: "${userInput}"
        OBJECTIVE: Summarize the input into a concise, punchy title (3-6 words max).
        DO NOT answer the input. Just label it.
        OUTPUT FORMAT (Strict JSON): { "title": "string" }
      `;
    } else {
      systemPrompt = `
        ROLE: You are an expert Prompt Engineer.
        INPUT: "${userInput}"
        OBJECTIVE:
        - Do NOT answer the input.
        - **MANDATORY FRAMEWORK**: You MUST use the **CO-STAR** framework for every "Refined Prompt".
          1. **C**ontext: detailed background.
          2. **O**bjective: precise goal.
          3. **S**tyle: specific expert persona.
          4. **T**one: emotion/attitude.
          5. **A**udience: target reader.
          6. **R**esponse: strict format requirements.
  
        OUTPUT FORMAT (Strict JSON):
        You MUST return a valid JSON object matching this schema. You MUST populate the 'costar' object with the specific content used in the refined prompt.
        {
          "refinedPrompt": "The complete, aggregated prompt string ready for an LLM",
          "whyThisWorks": "Explanation string",
          "suggestedVariables": ["string", "string"],
          "costar": {
             "context": "Context string",
             "objective": "Objective string",
             "style": "Style string",
             "tone": "Tone string",
             "audience": "Audience string",
             "response": "Response string"
          }
        }
        
        Do NOT include any markdown formatting like 
        ```json. Just return the raw JSON string.
      `;
    }

    try {
      if (provider === "ollama") {
        const ollamaUrl = Deno.env.get("OLLAMA_URL") || "http://localhost:11434";
        const ollamaModel = model || Deno.env.get("OLLAMA_MODEL") || "llama3.2";

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
            options: { temperature: 0.3 },
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
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = model || Deno.env.get("GEMINI_MODEL") || "gemini-3.0-flash"; 
        const genModel = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await genModel.generateContent(systemPrompt);
        const response = await result.response;
        text = response.text();
      }
    } catch (llmError: any) {
       console.error("LLM Provider Error:", llmError);
       return errorResponse(
         `The AI service (${provider}) is currently unavailable or returned an error.`, 
         ErrorCode.LLM_SERVICE_UNAVAILABLE,
         503,
         { originalError: llmError.message }
       );
    }

    // Parse and Validate
    let parsedResult;
    try {
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const json = JSON.parse(cleanedText);
        if (task === 'title') {
             if (!json.title) throw new Error("Missing 'title' field in response");
             parsedResult = { title: json.title };
        } else {
            parsedResult = RefinedPromptSchema.parse(json);
        }
    } catch (e: any) {
        console.error("Validation Failed:", e);
        if (task === 'title') {
             parsedResult = { title: text.substring(0, 50) };
        } else if (text.includes("refinedPrompt")) {
            parsedResult = {
                refinedPrompt: text,
                 whyThisWorks: "Output could not be strictly parsed. Providing raw response.",
                 suggestedVariables: [],
                 costar: {
                     context: "", objective: "", style: "", tone: "", audience: "", response: ""
                 }
            }
        } else {
             return errorResponse("The AI generated an invalid response. Please try again.", ErrorCode.LLM_GENERATION_FAILED, 500, { rawOutput: text });
        }
    }

    parsedResult.provider = provider;
    parsedResult.model = provider === "ollama" 
      ? (model || Deno.env.get("OLLAMA_MODEL") || "llama3.2")
      : (model || Deno.env.get("GEMINI_MODEL") || "gemini-3.0-flash");

    // PERSISTENCE
    if (userId && task === 'engineer') {
      const { data: insertedData, error: dbError } = await supabase
        .from("prompt_history")
        .insert({
          user_id: userId,
          original_input: userInput,
          result: parsedResult,
          parent_id: parentId // Save the reference to the parent version
        })
        .select()
        .single();
      
      if (dbError) {
        console.error("Database Save Error:", dbError);
      } else {
        parsedResult.id = insertedData.id;
      }
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Internal Error:", error);
    return errorResponse("An unexpected error occurred in the engineering function.", ErrorCode.UNKNOWN_ERROR, 500);
  }
});