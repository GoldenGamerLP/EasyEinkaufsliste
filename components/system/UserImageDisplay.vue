<template>
    <component :is="currentUser?.bild_reference ? 'img' : User" :class="cn('rounded-full w-10 h-10', props.class)"
        :src="`/api/v1/cms/${currentUser?.bild_reference}`" />
</template>

<script setup lang="ts">
import { User } from 'lucide-vue-next';
import type { HTMLAttributes } from 'vue';
import { useUser } from '~/composable/auth';
import { cn } from '~/lib/utils';
import type { FrontEndUser } from '~/types/User';

const props = defineProps<{ class?: HTMLAttributes['class'] } & { member?: FrontEndUser}>()


const user = useUser();

const currentUser = computed(() => {
    return props.member || user.value;
});
</script>