<template>
    <Popover>
        <PopoverTrigger as-child>
            <Button variant="secondary" @click="logout" :disabled="isLoading">
                <component :is="isLoading ? Loader2 : UserRoundX" />
                {{ user?.name }}
                <span class="sr-only">Angemeldet als {{ user?.mail }}. Ausloggen?</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent>Ausloggen?</PopoverContent>
    </Popover>
</template>

<script lang="ts" setup>
import { UserRoundX, Loader2 } from 'lucide-vue-next';
import { useUser } from '~/composable/auth';
import { toast } from 'vue-sonner';

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