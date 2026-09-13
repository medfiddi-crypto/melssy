import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const base = "https://melssy.beauty"; return ["", "/products/beauty-night-ritual", "/a-propos", "/contact", "/collections/essentiels-de-nuit"].map((path) => ({ url: `${base}${path}`, lastModified: new Date() })); }
