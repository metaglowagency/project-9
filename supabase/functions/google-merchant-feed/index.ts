import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const BASE_URL = 'https://markatkinscarpentry.co.uk';

interface ProductRow {
  handle: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  compare_at_price: number | null;
  sku: string;
  images: string[];
  variants: unknown;
  variant_rows: {
    options: { name: string; value: string }[];
    sku: string;
    price: number;
    image?: string;
  }[];
}

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
      .select('handle, title, description, category, tags, price, compare_at_price, sku, images, variants, variant_rows')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const rows = (products || []) as ProductRow[];

    const items = rows.map((p) => {
      const link = `${BASE_URL}/product/${p.handle}`;
      const image = (p.images && p.images.length > 0) ? p.images[0] : '';
      const additionalImages = (p.images || []).slice(1, 10).map((img) => `    <g:additional_image_link>${xmlEscape(img)}</g:additional_image_link>`).join('\n');
      const desc = p.description || p.title;
      const googleCategory = mapGoogleProductCategory(p.category);
      const availability = 'in_stock';
      const price = Number(p.price).toFixed(2);
      const salePrice = p.compare_at_price && p.compare_at_price > p.price
        ? `    <g:sale_price>${Number(p.price).toFixed(2)} GBP</g:sale_price>\n    <g:sale_price_effective_date>2026-01-01T00:00:00Z/2026-12-31T23:59:59Z</g:sale_price_effective_date>`
        : '';

      return `  <item>
    <g:id>${xmlEscape(p.sku)}</g:id>
    <title>${xmlEscape(p.title)}</title>
    <description>${xmlEscape(desc.slice(0, 5000))}</description>
    <link>${xmlEscape(link)}</link>
    <g:image_link>${xmlEscape(image)}</g:image_link>
${additionalImages}
    <g:product_type>${xmlEscape(p.category)}</g:product_type>
    <g:google_product_category>${xmlEscape(googleCategory)}</g:google_product_category>
    <g:availability>${availability}</g:availability>
    <g:price>${price} GBP</g:price>
${salePrice}
    <g:brand>Mark Atkins Carpentry</g:brand>
    <g:mpn>${xmlEscape(p.sku)}</g:mpn>
    <g:identifier_exists>yes</g:identifier_exists>
    <g:condition>new</g:condition>
    <g:shipping>
      <g:country>GB</g:country>
      <g:service>Standard</g:service>
      <g:price>0.00 GBP</g:price>
    </g:shipping>
  </item>`;
    }).join('\n');

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Mark Atkins Carpentry - Product Feed</title>
    <link>${BASE_URL}</link>
    <description>Premium outdoor furniture and garden furniture from Mark Atkins Carpentry</description>
${items}
  </channel>
</rss>`;

    return new Response(feed, {
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

function mapGoogleProductCategory(category: string): string {
  const map: Record<string, string> = {
    'Garden Furniture Sets': '5821 > 8203',
    'Garden Loungers': '5821 > 8203',
    'Gazebos & Shelters': '5821 > 8203',
    'Fire Pits & Heating': '5821 > 8203',
    'Garden Cushions': '5821 > 8203',
    'Parasols': '5821 > 8203',
    'Bespoke Carpentry': '5821 > 8203',
  };
  return map[category] || '5821 > 8203';
}
