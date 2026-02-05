import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte()],
  // GitHub Pages serves from /repo-name/ path
  // Replace 'styx-monorepo' with your actual repository name
  base: process.env.NODE_ENV === "production" ? "/styx-monorepo/" : "/",
});