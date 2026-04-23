import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }
    try {
        // --- Authentication: require a valid user JWT ---
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
        const userClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } },
        });
        const token = authHeader.replace("Bearer ", "");
        const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
        if (claimsError || !claimsData?.claims) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }
        const userId = claimsData.claims.sub;
        const { messages, type, journalContent, answers } = await req.json();
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
                return new Response(JSON.stringify({
                    emotion_tags: parsed.emotion_tags || [],
                    reflection_questions: parsed.reflection_questions || ""
                }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
            catch {
                return new Response(JSON.stringify({ emotion_tags: [], reflection_questions: "" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
                return new Response(JSON.stringify({
                    message: parsed.message || "Here are some suggestions for you.",
                    songs: parsed.songs || [],
                    books: parsed.books || []
                }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
            catch {
                return new Response(JSON.stringify({ message: "Here are some suggestions.", songs: [], books: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
        }
        if (type === "summary") {
            // Fetch the user's own data server-side (RLS-scoped) — never trust client input
            const sinceIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const [moodsRes, journalsRes] = await Promise.all([
                userClient
                    .from("mood_entries")
                    .select("mood, note, created_at")
                    .eq("user_id", userId)
                    .gte("created_at", sinceIso)
                    .order("created_at", { ascending: true }),
                userClient
                    .from("journal_entries")
                    .select("content, mood, created_at")
                    .eq("user_id", userId)
                    .gte("created_at", sinceIso)
                    .order("created_at", { ascending: true }),
            ]);
            const moods = (moodsRes.data || []);
            const journals = (journalsRes.data || []);
            // Build rich context: mood distribution, trajectory, and notes
            const moodCounts = {};
            moods.forEach((m) => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
            const distribution = Object.entries(moodCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([mood, count]) => `${mood} (${count}x)`)
                .join(", ");
            const dayName = (iso) => new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
            const trajectory = moods.map((m) => `${dayName(m.created_at)}: ${m.mood}`).join(" → ");
            const moodNotes = moods
                .filter((m) => m.note && m.note.trim())
                .slice(-6)
                .map((m) => `- (${m.mood}) "${m.note}"`)
                .join("\n");
            const journalSnippets = journals
                .slice(-3)
                .map((j) => `- (${j.mood}) "${j.content.slice(0, 200)}${j.content.length > 200 ? "…" : ""}"`)
                .join("\n");
            const moodSummary = moods.length > 0
                ? `Mood distribution this week: ${distribution}\nDay-by-day: ${trajectory}`
                : "No moods logged this week.";
            const journalSummary = journals.length > 0
                ? `Journal entries: ${journals.length}`
                : "No journal entries this week.";
            const contextBlock = `${moodSummary}\n${journalSummary}${moodNotes ? `\n\nMood notes:\n${moodNotes}` : ""}${journalSnippets ? `\n\nRecent journal snippets:\n${journalSnippets}` : ""}`;
            const systemPrompt = `You are Mindi, a warm, perceptive wellness friend writing a weekly reflection.

Write a short, personal summary (3 bullet points, max 1 sentence each) that:
- Names a real pattern you notice in their moods (frequency, shifts, or recurring themes from their notes)
- Reflects empathy about what they're going through — quote or reference their own words when possible
- Ends with one grounded, hopeful observation about their week

Tone: human, warm, specific. No clichés ("hang in there", "you've got this"), no clinical language, no generic advice. Use markdown bullets (-).`;
            const userContent = `Here's my week:\n\n${contextBlock}`;
            const suggestionsPrompt = `You are Mindi, a thoughtful wellness friend giving personalized suggestions based on someone's actual week.

Give 3 specific, actionable suggestions tailored to the patterns and themes in their data:
- Each suggestion = 1 short sentence, starts with an action verb
- Reference their actual situation (their notes, recurring moods, or themes) — not generic advice
- Mix categories: one for emotional regulation, one practical/behavioral, one for connection or reflection
- Sound like a friend texting, not a therapist. No "try to" or "consider" — be direct.

Format as markdown bullets (-).`;
            const [response, suggestionsResponse] = await Promise.all([
                fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${LOVABLE_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "google/gemini-2.5-flash",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: userContent },
                        ],
                    }),
                }),
                fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${LOVABLE_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "google/gemini-2.5-flash",
                        messages: [
                            { role: "system", content: suggestionsPrompt },
                            { role: "user", content: `Here's my week:\n\n${contextBlock}` },
                        ],
                    }),
                }),
            ]);
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
            const suggestionsResult = await suggestionsResponse.json();
            const suggestionsContent = suggestionsResult.choices?.[0]?.message?.content || "Keep tracking your mood daily!";
            return new Response(JSON.stringify({ summary: summaryContent, suggestions: suggestionsContent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        // Regular chat with conversational suggestion flow
        const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
        const conversationHistory = messages.map((m) => m.content.toLowerCase()).join(' ');
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
2. Then ask: "Would you like me to suggest some music to help? 🎵"
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
    {"title": "Real Popular Song", "artist": "Real Artist", "language": "${detectedLanguage}", "youtubeUrl": "https://www.youtube.com/results?search_query=Real+Popular+Song+Real+Artist+official+audio"},
    {"title": "Real Popular Song", "artist": "Real Artist", "language": "${detectedLanguage}", "youtubeUrl": "https://www.youtube.com/results?search_query=Real+Popular+Song+Real+Artist+official+audio"},
    {"title": "Real Popular Song", "artist": "Real Artist", "language": "${detectedLanguage}", "youtubeUrl": "https://www.youtube.com/results?search_query=Real+Popular+Song+Real+Artist+official+audio"}
  ],
  "includeSuggestions": true
}
Use REAL, POPULAR songs that match their emotional state. For each song, create the youtubeUrl by URL-encoding the search query: https://www.youtube.com/results?search_query={title}+{artist}+official+audio`;
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
                return new Response(JSON.stringify({
                    message: parsed.message || content,
                    songs: parsed.songs || [],
                    includeSuggestions: true
                }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
            catch {
                return new Response(JSON.stringify({ message: content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
        }
        return new Response(JSON.stringify({ message: content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    catch (error) {
        console.error("Chat function error:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});
