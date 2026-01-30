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
    const { songs } = await req.json();

    if (!songs || !Array.isArray(songs)) {
      return new Response(
        JSON.stringify({ error: "Songs array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Search Deezer for each song and get preview URLs
    const songsWithPreviews = await Promise.all(
      songs.map(async (song: { title: string; artist: string; language?: string; mood?: string }) => {
        try {
          const query = encodeURIComponent(`${song.title} ${song.artist}`);
          const response = await fetch(`https://api.deezer.com/search?q=${query}&limit=1`);
          const data = await response.json();

          if (data.data && data.data.length > 0) {
            const track = data.data[0];
            return {
              title: track.title || song.title,
              artist: track.artist?.name || song.artist,
              language: song.language,
              mood: song.mood,
              audioUrl: track.preview, // 30-second preview
              albumArt: track.album?.cover_small,
            };
          }

          // Fallback if not found
          return {
            ...song,
            audioUrl: null,
            albumArt: null,
          };
        } catch (error) {
          console.error(`Error fetching song ${song.title}:`, error);
          return {
            ...song,
            audioUrl: null,
            albumArt: null,
          };
        }
      })
    );

    return new Response(
      JSON.stringify({ songs: songsWithPreviews }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Music search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
