export interface CSVProduct {
  handle: string;
  title: string;
  description: string;
  category: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  tags: string;
  images: string;
  featured: string;
}

const HEADERS = ['title', 'handle', 'description', 'category', 'price', 'compare_at_price', 'sku', 'tags', 'images', 'featured'];

export function generateCsvTemplate(): string {
  const header = HEADERS.join(',');
  const example = [
    'Darwin 7-Seater Corner Set',
    'darwin-7-seater-corner-set',
    'A beautiful rattan corner dining set for 7 people.',
    'Garden Furniture',
    '899.99',
    '1299.99',
    'DAR-7SEC',
    'rattan,outdoor,dining',
    'https://example.com/image1.jpg|https://example.com/image2.jpg',
    'true',
  ].map((v) => `"${v}"`).join(',');
  return `${header}\n${example}\n`;
}

export function downloadCsvTemplate() {
  const csv = generateCsvTemplate();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'product-import-template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

export function parseCsv(text: string): CSVProduct[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headerRow = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const headerMap = new Map<string, number>();
  HEADERS.forEach((h) => {
    const idx = headerRow.indexOf(h);
    if (idx >= 0) headerMap.set(h, idx);
  });

  const products: CSVProduct[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const get = (key: string): string => {
      const idx = headerMap.get(key);
      return idx !== undefined && idx < cols.length ? cols[idx].trim() : '';
    };

    products.push({
      title: get('title'),
      handle: get('handle'),
      description: get('description'),
      category: get('category'),
      price: get('price'),
      compareAtPrice: get('compare_at_price'),
      sku: get('sku'),
      tags: get('tags'),
      images: get('images'),
      featured: get('featured'),
    });
  }
  return products;
}

export function csvToProductPayload(p: CSVProduct) {
  return {
    handle: p.handle || p.title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
    title: p.title,
    description: p.description,
    category: p.category,
    tags: p.tags ? p.tags.split('|').map((s) => s.trim()).filter(Boolean) : [],
    price: parseFloat(p.price) || 0,
    compare_at_price: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
    sku: p.sku,
    images: p.images ? p.images.split('|').map((s) => s.trim()).filter(Boolean) : [],
    variants: [],
    variant_rows: [],
    featured: p.featured.toLowerCase() === 'true' || p.featured === '1',
  };
}
