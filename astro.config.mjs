// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  // Output estático por padrão - Astro é server-first por natureza
  output: "static",
  
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
  
  // Otimizações de build
  build: {
    inlineStylesheets: "auto",
  },
});
