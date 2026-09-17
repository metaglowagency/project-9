import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const BASE_URL = 'https://markatkinscarpentry.co.uk';

interface ProductRow {
  handle: string;
  updated_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: products, error } = await supabase
      .from('products')
      .select('handle, updated_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const rows = (products || []) as ProductRow[];
    const now = new Date().toISOString();

    const staticUrls = [
      { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly' },
      { loc: `${BASE_URL}/shop`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${BASE_URL}/about`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${BASE_URL}/contact`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${BASE_URL}/delivery`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${BASE_URL}/returns`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${BASE_URL}/privacy`, priority: '0.4', changefreq: 'monthly' },
      { loc: `${BASE_URL}/terms`, priority: '0.4', changefreq: 'monthly' },
    ];

    const staticEntries = staticUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

    const productEntries = rows.map((p) => `  <url>
    <loc>${BASE_URL}/product/${p.handle}</loc>
    <lastmod>${p.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${productEntries}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
