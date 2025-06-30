<template>
  <div>
    <Toaster class="pointer-events-auto" />
    <NuxtLoadingIndicator />
    <KeepAlive :max="3">
      <NuxtPage />
    </KeepAlive>
  </div>
</template>

<script setup>
import { useLocalStorage } from '@vueuse/core';
import 'vue-sonner/style.css'

const state = useLocalStorage("darkMode", false);

const bodyClass = computed(() => {
    return state.value ? 'dark' : '';
});

useHead({
    bodyAttrs: {
        class: bodyClass,
    }
})
</script>
