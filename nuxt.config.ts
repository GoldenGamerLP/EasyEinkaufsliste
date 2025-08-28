// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  css: ["~/assets/css/tailwind.css"],
  builder: "vite",
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
    "@nuxtjs/critters",
    "nuxt-booster",
  ],
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
  booster: {
    disableNuxtFontaine: true,
    disableNuxtImage: false,
    optimizeSSR: {
      inlineStyles: true,
      cleanPrefetches: true,
      cleanPreloads: false,
    },
    detection: {
      performance: false,
      browserSupport: false,
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "de",
      },
      title: "EasyHouseholds",
    },
    keepalive: true,
  },
  experimental: {
    lazyHydration: true,
    viewTransition: true,
    componentIslands: true,
  },
  features: {
    inlineStyles: true,
  },
  build: {
    transpile: ["shadcn-nuxt", "@headlessui/vue"],
  },
});
