import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getSpotifyToken(): Promise<string> {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Spotify credentials not configured");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { songs } = await req.json();
    if (!songs || !Array.isArray(songs)) {
      return new Response(JSON.stringify({ error: "Songs array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getSpotifyToken();

    const enriched = await Promise.all(
      songs.map(async (song: { title: string; artist: string; language?: string }) => {
        try {
          const query = encodeURIComponent(`track:${song.title} artist:${song.artist}`);
          const res = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (data.tracks?.items?.length > 0) {
            const track = data.tracks.items[0];
            return {
              title: track.name,
              artist: track.artists.map((a: any) => a.name).join(", "),
              language: song.language,
              spotifyId: track.id,
              albumArt: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url,
              previewUrl: track.preview_url,
            };
          }

          // Fallback: broader search
          const fallbackQuery = encodeURIComponent(`${song.title} ${song.artist}`);
          const fallbackRes = await fetch(`https://api.spotify.com/v1/search?q=${fallbackQuery}&type=track&limit=1`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fallbackData = await fallbackRes.json();

          if (fallbackData.tracks?.items?.length > 0) {
            const track = fallbackData.tracks.items[0];
            return {
              title: track.name,
              artist: track.artists.map((a: any) => a.name).join(", "),
              language: song.language,
              spotifyId: track.id,
              albumArt: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url,
              previewUrl: track.preview_url,
            };
          }

          return { ...song, spotifyId: null, albumArt: null, previewUrl: null };
        } catch (error) {
          console.error(`Error searching for ${song.title}:`, error);
          return { ...song, spotifyId: null, albumArt: null, previewUrl: null };
        }
      })
    );

    return new Response(JSON.stringify({ songs: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Music search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
