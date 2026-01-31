import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

async function getSpotifyToken(): Promise<string> {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get Spotify token: ${response.status}`);
  }

  const data: SpotifyToken = await response.json();
  return data.access_token;
}

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

    const token = await getSpotifyToken();

    // Search Spotify for each song
    const songsWithSpotify = await Promise.all(
      songs.map(async (song: { title: string; artist: string; language?: string }) => {
        try {
          const query = encodeURIComponent(`track:${song.title} artist:${song.artist}`);
          const response = await fetch(
            `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            console.error(`Spotify search failed for ${song.title}: ${response.status}`);
            return { ...song, spotifyId: null, albumArt: null };
          }

          const data = await response.json();

          if (data.tracks?.items?.length > 0) {
            const track = data.tracks.items[0];
            return {
              title: track.name || song.title,
              artist: track.artists?.[0]?.name || song.artist,
              language: song.language,
              spotifyId: track.id,
              albumArt: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url,
              previewUrl: track.preview_url, // 30-sec preview as fallback
            };
          }

          return { ...song, spotifyId: null, albumArt: null };
        } catch (error) {
          console.error(`Error fetching song ${song.title}:`, error);
          return { ...song, spotifyId: null, albumArt: null };
        }
      })
    );

    return new Response(
      JSON.stringify({ songs: songsWithSpotify }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Spotify search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
