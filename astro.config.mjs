import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://yourdomain.com",
  output: "static",
  adapter: vercel()
});
