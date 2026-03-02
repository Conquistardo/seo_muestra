import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://seo-muestra.vercel.app",
  output: "static",
  adapter: vercel(),
  security: {
    checkOrigin: true,
    allowedDomains: [
      {
        protocol: "https",
        hostname: "seo-muestra.vercel.app"
      },
      {
        protocol: "https",
        hostname: "**.vercel.app"
      }
    ]
  }
});
