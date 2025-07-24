<template>
  <div>
    <Toaster class="pointer-events-auto" />
    <NuxtLoadingIndicator />
    <NuxtPage />
  </div>
</template>

<script setup>
import { useLocalStorage } from "@vueuse/core";
import "vue-sonner/style.css";

const state = useLocalStorage("darkMode", false);

const bodyClass = computed(() => {
  return state.value ? "dark" : "";
});

useHead({
  bodyAttrs: {
    class: bodyClass,
  },
});
</script>
