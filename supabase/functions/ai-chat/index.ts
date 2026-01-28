import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type, moods, journals } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userContent = "";

    if (type === "summary") {
      systemPrompt = `You are a compassionate wellness analyst. Analyze the user's mood entries and journal entries from the past week. 
      Provide insights in a warm, supportive tone. Focus on patterns, emotional trends, and areas of growth.
      Be encouraging and constructive. Use bullet points for clarity.`;
      
      const moodSummary = moods?.length > 0 
        ? `Mood entries: ${moods.map((m: {mood: string, note: string | null, created_at: string}) => 
            `${m.mood}${m.note ? ` (${m.note})` : ''} on ${new Date(m.created_at).toLocaleDateString()}`
          ).join(', ')}`
        : 'No mood entries this week.';
      
      const journalSummary = journals?.length > 0
        ? `Journal entries: ${journals.map((j: {content: string, mood: string, created_at: string}) => 
            `"${j.content.slice(0, 100)}..." (${j.mood}) on ${new Date(j.created_at).toLocaleDateString()}`
          ).join(' | ')}`
        : 'No journal entries this week.';

      userContent = `Please analyze my week:\n\n${moodSummary}\n\n${journalSummary}\n\nProvide:\n1. A brief summary of my emotional patterns\n2. Key observations`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const summaryResult = await response.json();
      const summaryContent = summaryResult.choices?.[0]?.message?.content || "Unable to generate summary.";

      // Generate suggestions
      const suggestionsPrompt = `Based on the emotional patterns above, provide 3-5 specific, actionable wellness suggestions. 
      Be supportive and practical. Consider activities, mindfulness practices, social connections, and self-care.
      Format as a numbered list.`;

      const suggestionsResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: suggestionsPrompt },
            { role: "user", content: `${moodSummary}\n\n${journalSummary}` },
          ],
        }),
      });

      const suggestionsResult = await suggestionsResponse.json();
      const suggestionsContent = suggestionsResult.choices?.[0]?.message?.content || "Keep tracking your mood daily!";

      return new Response(
        JSON.stringify({ summary: summaryContent, suggestions: suggestionsContent }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Regular chat
    systemPrompt = `You are a compassionate and supportive AI wellness companion named Mindi. 
    Your role is to:
    - Listen empathetically to the user's feelings and concerns
    - Offer gentle, non-judgmental support
    - Suggest healthy coping strategies when appropriate
    - Encourage professional help when needed
    - Use warm, friendly language with occasional emojis
    - Keep responses concise but meaningful
    
    Important: You are not a therapist. If someone expresses serious mental health concerns or mentions self-harm, 
    gently encourage them to reach out to a mental health professional or crisis helpline.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const messageContent = result.choices?.[0]?.message?.content || "I'm here to listen. How are you feeling?";

    return new Response(
      JSON.stringify({ message: messageContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
