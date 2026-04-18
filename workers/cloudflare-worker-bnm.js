// Cloudflare Worker — Proxy BNM rates
// Deploy: Cloudflare Dashboard → Workers & Pages → Create → Worker → paste this code
// Route: bnm-proxy.myavvo.md sau orice subdomain

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // CORS headers — permite doar de pe calc.myavvo.md
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Doar GET permis
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const bnmUrl = 'https://www.bnm.md/ro/content/ratele-dobanzilor';

      const response = await fetch(bnmUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ro-MD,ro;q=0.9,en;q=0.8',
        },
        cf: {
          cacheTtl: 3600,        // cache 1 ora pe edge
          cacheEverything: true,
        },
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'BNM returned ' + response.status }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const html = await response.text();

      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',  // cache 1 ora
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Fetch failed', detail: err.message }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
