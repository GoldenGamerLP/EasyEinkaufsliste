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

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translate(50px, 0);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translate(-50px, 0);
}
.slide-right-enter-from {
  opacity: 0;
  transform: translate(-50px, 0);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translate(50px, 0);
}
</style>
