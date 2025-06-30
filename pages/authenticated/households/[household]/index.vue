<template>
    <template v-if="status === 'success'">
        <header class="w-full border-b mb-2">
            <h1 class="text-3xl flex items-center"><span class="text-muted-foreground">Haushalt</span>
                <ChevronRight /> {{ data?.name }}
            </h1>
            <div class="flex gap-2 mt-2">
                <NuxtLink to="/authenticated/households">
                    <Button variant="link">
                        <ChevronLeft />
                        Zurück
                    </Button>
                </NuxtLink>
                <SystemAddMember />
                <SystemVisualChangeButton />
            </div>
        </header>
        <main class="max-w-4xl w-full mx-auto space-y-4">
            <SystemQAndA />
            <SystemRecipeslist />
        </main>
    </template>
    <template v-else-if="status === 'error'">
        <div class="flex flex-col items-center justify-center h-screen">
            <TriangleAlert class="h-16 w-16 text-red-500" />
            <h2 class="text-xl font-semibold">Fehler beim Laden des Haushalts</h2>
            <p class="text-muted-foreground">{{ error?.statusMessage }}</p>
            <NuxtLink to="/authenticated/households" class="mt-4">
                <Button variant="default">
                    <ChevronLeft />
                    Zurück zur Übersicht
                </Button>
            </NuxtLink>
        </div>
    </template>
</template>

<script setup lang="ts">
import { ChevronLeft, User, Settings2, ChevronRight, ShoppingCart, RefreshCcw, TriangleAlert } from 'lucide-vue-next';
import { useUser } from '~/composable/auth';
import type { Rezept } from '~/types/HouseHold';

const currentHousehold = useRoute().params.household;
const { data, status, error } = useFetch("/api/v1/household/get", {
    method: "get",
    query: {
        householdId: currentHousehold,
    }
});
</script>