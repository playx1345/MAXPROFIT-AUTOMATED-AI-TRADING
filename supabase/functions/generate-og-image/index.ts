import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Page-specific OG configurations
const PAGE_CONFIGS: Record<string, { title: string; subtitle: string; accent: string }> = {
  home: {
    title: "Live Win Trade Investment",
    subtitle: "AI-Powered Crypto Trading Platform",
    accent: "Gold & deep navy gradient",
  },
  auth: {
    title: "Sign In to Live Win Trade",
    subtitle: "Start Trading Crypto with AI Today",
    accent: "Teal & midnight blue",
  },
  dashboard: {
    title: "Your Trading Dashboard",
    subtitle: "Real-Time Portfolio & Analytics",
    accent: "Electric blue & charcoal",
  },
  investments: {
    title: "Investment Plans",
    subtitle: "Choose Your Trading Strategy",
    accent: "Green & dark navy",
  },
  deposit: {
    title: "Fund Your Account",
    subtitle: "Secure USDT Deposits",
    accent: "Emerald & black",
  },
  withdraw: {
    title: "Withdraw Profits",
    subtitle: "Fast & Secure Withdrawals",
    accent: "Purple & deep navy",
  },
  referrals: {
    title: "Referral Program",
    subtitle: "Earn Bonuses for Every Referral",
    accent: "Orange & dark navy",
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || 'home';
    const customTitle = url.searchParams.get('title');
    const customSubtitle = url.searchParams.get('subtitle');

    const config = PAGE_CONFIGS[page] || PAGE_CONFIGS.home;
    const title = customTitle || config.title;
    const subtitle = customSubtitle || config.subtitle;

    // Generate a cache key based on the parameters
    const cacheKey = `og-${page}-${encodeURIComponent(title)}-${encodeURIComponent(subtitle)}.png`
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 200) + '.png';

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if cached image exists
    const { data: existingFile } = await supabase.storage
      .from('og-images')
      .list('', { search: cacheKey, limit: 1 });

    if (existingFile && existingFile.length > 0) {
      const { data: publicUrl } = supabase.storage
        .from('og-images')
        .getPublicUrl(cacheKey);

      console.log(`[OG] Serving cached image for page: ${page}`);
      
      // Redirect to the cached image
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': publicUrl.publicUrl,
          'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        },
      });
    }

    // Generate new OG image using Lovable AI
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('[OG] LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[OG] Generating new image for page: ${page}, title: ${title}`);

    const prompt = `Create a professional, modern Open Graph social sharing image (1200x630 pixels, 16:9 aspect ratio) for a cryptocurrency investment platform called "${title}". 
    
Subtitle: "${subtitle}"
Color theme: ${config.accent}

Design requirements:
- Clean, professional fintech aesthetic with a dark background
- The title "${title}" should be prominently displayed in large, bold white or gold text
- The subtitle "${subtitle}" should appear below in smaller, lighter text
- Include subtle abstract geometric patterns or crypto-themed decorative elements (NOT actual cryptocurrency logos)
- Add a subtle gradient overlay with the specified accent colors
- Include a small decorative element suggesting AI/technology (circuit patterns, data visualization lines)
- Keep it minimal and elegant - no cluttered elements
- The text must be clearly readable against the background
- No mockup devices, screenshots, or UI elements
- Professional quality suitable for LinkedIn, Twitter, and Facebook sharing
- Ultra high resolution`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          { role: 'user', content: prompt }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[OG] AI generation failed: ${aiResponse.status} - ${errorText}`);
      return new Response(JSON.stringify({ error: 'Image generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error('[OG] No image data in AI response');
      return new Response(JSON.stringify({ error: 'No image generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract base64 data and convert to binary
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('og-images')
      .upload(cacheKey, bytes.buffer, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '604800', // 7 days
      });

    if (uploadError) {
      console.error(`[OG] Upload failed: ${uploadError.message}`);
      // Still return the image even if caching fails
      return new Response(bytes, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const { data: publicUrl } = supabase.storage
      .from('og-images')
      .getPublicUrl(cacheKey);

    console.log(`[OG] Image generated and cached: ${publicUrl.publicUrl}`);

    // Redirect to the stored image
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': publicUrl.publicUrl,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      },
    });

  } catch (error) {
    console.error(`[OG] Error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
