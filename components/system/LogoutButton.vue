<template>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger as-child> <Button variant="secondary" @click="logout" :disabled="isLoading"
                    :class="props.class">
                    <SystemUserImageDisplay class="size-6" />
                    {{ user?.name }}
                    <span class="sr-only">Angemeldet als {{ user?.mail }}. Ausloggen?</span>
                </Button></TooltipTrigger>
            <TooltipContent>
                <p>Als {{ user?.name }} {{ user?.lastname }} ausloggen?</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>


</template>

<script lang="ts" setup>
import { useUser } from '~/composable/auth';
import { toast } from 'vue-sonner';
import type { HTMLAttributes } from 'vue';
import { cn } from '~/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const user = useUser();
const isLoading = ref(false);

const logout = async () => {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
        await $fetch("/api/v1/auth/actions/logout");
        toast.info("Du wurdest ausgeloggt.", { description: "Du wirst nun weitergeleitet." });
        await useRouter().push("/");
    } catch (error) {
        toast.error("Ein fehler beim ausloggen ist augetreten.", { description: "Versuche es bitte noch einmal." });
    }

    isLoading.value = false;
}
</script>