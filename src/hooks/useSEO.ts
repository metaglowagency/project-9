import { useEffect } from 'react';

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
}

const BASE_URL = 'https://markatkinscarpentry.co.uk';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSONLD_ID = 'dynamic-json-ld';

function setJsonLd(data: object | object[]) {
  const existing = document.getElementById(JSONLD_ID);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = JSONLD_ID;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function removeJsonLd() {
  const existing = document.getElementById(JSONLD_ID);
  if (existing) existing.remove();
}

export function useSEO({ title, description, canonical, ogType = 'website', ogImage, jsonLd, noindex }: SEOConfig) {
  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:url', canonical || BASE_URL);
    if (ogImage) setMeta('property', 'og:image', ogImage);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    if (noindex) {
      setMeta('name', 'robots', 'noindex, nofollow');
    } else {
      setMeta('name', 'robots', 'index, follow');
    }
    if (canonical) {
      setLink('canonical', canonical);
    }
    if (jsonLd) {
      setJsonLd(jsonLd);
    } else {
      removeJsonLd();
    }
    return () => {
      removeJsonLd();
    };
  }, [title, description, canonical, ogType, ogImage, jsonLd, noindex]);
}

export { BASE_URL };
