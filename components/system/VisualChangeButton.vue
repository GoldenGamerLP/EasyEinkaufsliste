<template>
    <ClientOnly>
        <Button variant="ghost" size="icon" @click="state ? toWhite() : toDark()">
            <component :is="state ? Moon : Sun" class="w-5 h-5" />
            <span class="sr-only">Hellen oder Dunklen modus aktivieren</span>
        </Button>
    </ClientOnly>
</template>

<script lang="ts" setup>
import { useLocalStorage } from '@vueuse/core';
import { Sun, Moon } from 'lucide-vue-next';
const state = useLocalStorage("darkMode", false);

const toWhite = () => {
    state.value = false;
};

const toDark = () => {
    state.value = true;
};

const bodyClass = computed(() => {
    return state.value ? 'dark' : '';
});

useHead({
    bodyAttrs: {
        class: bodyClass,
    }
})
</script>