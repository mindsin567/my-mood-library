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
    const { messages, type, moods, journals, journalContent, answers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analyze journal entry for emotions and generate reflection
    if (type === "analyze_journal") {
      const analyzePrompt = `You are an emotion analyzer. Analyze this journal entry and:
1. Detect the primary emotions (return as JSON array of tags like: stress, motivation, anxiety, joy, gratitude, fear, hope, frustration, peace, excitement, loneliness, confidence)
2. Generate 2-3 thoughtful reflection questions to help the user explore their feelings deeper

Journal entry: "${journalContent}"

Respond in this exact JSON format:
{
  "emotion_tags": ["tag1", "tag2"],
  "reflection_questions": "1. Question one?\\n2. Question two?\\n3. Question three?"
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "user", content: analyzePrompt },
          ],
          response_format: { type: "json_object" },
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

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || "{}";
      
      try {
        const parsed = JSON.parse(content);
        return new Response(
          JSON.stringify({
            emotion_tags: parsed.emotion_tags || [],
            reflection_questions: parsed.reflection_questions || ""
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        return new Response(
          JSON.stringify({ emotion_tags: [], reflection_questions: "" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate personalized music and book recommendations
    if (type === "recommendations") {
      const userAnswers = answers || {};
      const recommendPrompt = `You're a caring friend giving music and book suggestions.

User feels: ${userAnswers.mood || 'not specified'}
Needs: ${userAnswers.intention || 'not specified'}
Language: ${userAnswers.language || 'any'}

Return JSON:
{
  "message": "One warm sentence (be human, not robotic)",
  "songs": [
    {"title": "Real Song", "artist": "Real Artist", "language": "lang"},
    {"title": "Real Song", "artist": "Real Artist", "language": "lang"},
    {"title": "Real Song", "artist": "Real Artist", "language": "lang"}
  ],
  "books": [
    {"title": "Book", "author": "Author", "reason": "Why it helps (8 words max)"}
  ]
}

Rules: Real popular songs in chosen language. One helpful book. Sound like a friend.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: recommendPrompt }],
          response_format: { type: "json_object" },
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

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || "{}";

      try {
        const parsed = JSON.parse(content);
        return new Response(
          JSON.stringify({
            message: parsed.message || "Here are some suggestions for you.",
            songs: parsed.songs || [],
            books: parsed.books || []
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        return new Response(
          JSON.stringify({ message: "Here are some suggestions.", songs: [], books: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (type === "summary") {
      const systemPrompt = `You're a supportive wellness friend. Give brief, warm insights. Max 3 bullet points. Sound human.`;
      
      const moodSummary = moods?.length > 0 
        ? `Moods: ${moods.map((m: {mood: string, note: string | null, created_at: string}) => m.mood).join(', ')}`
        : 'No moods logged.';
      
      const journalSummary = journals?.length > 0
        ? `Journals: ${journals.length} entries`
        : 'No journals.';

      const userContent = `${moodSummary}\n${journalSummary}\n\nGive 2-3 quick observations about my week.`;

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
      const suggestionsPrompt = `Give 2-3 quick, practical tips. One line each. Sound like a friend, not a therapist.`;

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

    // Regular chat with conversational suggestion flow
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const conversationHistory = messages.map((m: {role: string, content: string}) => m.content.toLowerCase()).join(' ');
    
    // Check for emotional content
    const emotionalKeywords = ['sad', 'happy', 'anxious', 'stressed', 'angry', 'tired', 'lonely', 'overwhelmed', 'depressed', 'worried', 'scared', 'excited', 'frustrated', 'hurt', 'feel', 'feeling', 'mood', 'day was', 'not good', 'bad day', 'great day', 'low', 'down'];
    const isEmotional = emotionalKeywords.some(kw => lastUserMessage.includes(kw));
    
    // Check if user wants suggestions
    const wantsSuggestions = ['yes', 'sure', 'okay', 'ok', 'yeah', 'yep', 'please', 'suggest', 'recommend'].some(w => lastUserMessage.includes(w));
    const declinesSuggestions = ['no', 'nope', 'not now', 'maybe later', 'skip'].some(w => lastUserMessage.includes(w));
    
    // Check if AI already asked about suggestions in conversation
    const alreadyAskedAboutSuggestions = conversationHistory.includes('would you like me to suggest');
    const alreadyAskedAboutLanguage = conversationHistory.includes('which language') || conversationHistory.includes('what language');
    
    // Detect language preference
    const languages = ['english', 'hindi', 'spanish', 'korean', 'japanese', 'arabic', 'french', 'tamil', 'punjabi', 'telugu', 'any'];
    const detectedLanguage = languages.find(lang => lastUserMessage.includes(lang));
    
    let systemPrompt = `You are Mindi, a warm and empathetic wellness companion.
Keep responses brief (2-3 sentences max). Use occasional emojis.

CONVERSATION FLOW for emotional messages:
1. First, acknowledge their feelings warmly
2. Then ask: "Would you like me to suggest some music and books to help? 🎵📚"
3. If they say yes, ask: "What language would you like the songs in? (English, Hindi, Spanish, Korean, or any)"
4. Once you have the language, provide suggestions

Current context:
- User shared emotions: ${isEmotional}
- Already asked about suggestions: ${alreadyAskedAboutSuggestions}
- Already asked about language: ${alreadyAskedAboutLanguage}
- User wants suggestions: ${wantsSuggestions}
- User declines suggestions: ${declinesSuggestions}
- Detected language preference: ${detectedLanguage || 'none'}`;

    // Determine if we should provide suggestions with this response
    const shouldProvideSuggestions = alreadyAskedAboutLanguage && detectedLanguage;
    
    if (shouldProvideSuggestions) {
      systemPrompt += `

The user has chosen ${detectedLanguage} songs. NOW provide suggestions.
Respond with JSON:
{
  "message": "Brief warm message (1 sentence)",
  "songs": [
    {"title": "Real Popular Song", "artist": "Real Artist", "language": "${detectedLanguage}"},
    {"title": "Real Popular Song", "artist": "Real Artist", "language": "${detectedLanguage}"},
    {"title": "Real Popular Song", "artist": "Real Artist", "language": "${detectedLanguage}"}
  ],
  "books": [
    {"title": "Book Title", "author": "Author", "reason": "Brief reason (5 words)"}
  ],
  "includeSuggestions": true
}
Use REAL, POPULAR songs that match their emotional state.`;
    }

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
        ...(shouldProvideSuggestions && { response_format: { type: "json_object" } }),
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
    const content = result.choices?.[0]?.message?.content || "I'm here to listen. How are you feeling?";

    // Parse JSON response if we're providing suggestions
    if (shouldProvideSuggestions) {
      try {
        const parsed = JSON.parse(content);
        return new Response(
          JSON.stringify({
            message: parsed.message || content,
            songs: parsed.songs || [],
            books: parsed.books || [],
            includeSuggestions: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        return new Response(
          JSON.stringify({ message: content }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ message: content }),
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
