import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { siteConfig } from "@/config";

export async function GET(context: APIContext) {
  const posts = await getCollection("posts");
  
  // Sort posts by published date
  posts.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
  
  // Get all pages
  const pages = [
    "/",
    "/archive/",
    "/about/",
    "/donate/",
  ];

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Generate sitemap entries for posts
  const postEntries = posts.map(post => {
    const lastMod = post.data.updated ? formatDate(post.data.updated) : formatDate(post.data.published);
    return `
  <url>
    <loc>${context.site}posts/${post.slug}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('');

  // Generate sitemap entries for pages
  const pageEntries = pages.map(page => `
  <url>
    <loc>${context.site}${page === '/' ? '' : page}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${context.site}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${pageEntries}${postEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}