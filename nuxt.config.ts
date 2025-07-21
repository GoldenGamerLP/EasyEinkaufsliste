import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  css: ["~/assets/css/tailwind.css"],
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: [
    "@nuxt/fonts",
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@formkit/auto-animate/nuxt",
    "@nuxtjs/critters",
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  fonts: {
    defaults: {
      preload: true,
    },
  },
  postcss: {
    plugins: {
      cssnano: {
        preset: "advanced",
      },
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "de",
      },
      title: "EasyHouseholds",
    },
  },
});
