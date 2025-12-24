
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userInput } = await req.json();

    if (!userInput) {
      throw new Error("Missing userInput in request body");
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using 'gemini-3-flash-preview' as requested.
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown formatting if the model persists in sending it
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedResult;
    try {
        parsedResult = JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse JSON:", cleanedText);
        // Fallback if JSON parsing fails
        parsedResult = {
            refinedPrompt: cleanedText,
            explanation: "Raw output returned due to parsing error.",
            suggestedVariables: []
        };
    }

    // Save to Supabase DB (Optional - keeping it simple for now, relying on client to fetch history or adding insert logic here if needed)
    // For this recreation, we'll return the result directly. 
    // If the original function saved to DB, we'd need the Supabase client here too.
    // Based on previous logs, the client fetches history separately, so saving here is good practice.
    
    // TODO: Verify if DB insert is required. For now, returning data to frontend.

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
