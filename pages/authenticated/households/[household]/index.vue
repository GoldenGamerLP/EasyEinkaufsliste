<template>
  <template v-if="household">
    <header class="grid w-full border-b border-muted p-2">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl flex items-center">
          <span class="text-muted-foreground">Haushalt</span> <ChevronRight />
          {{ household.name }}
        </h1>

        <SystemLogoutButton />
      </div>
      <div class="flex gap-2 mt-2">
        <NuxtLink to="/authenticated/households">
          <Button variant="link">
            <ChevronLeft />
            Zurück
          </Button>
        </NuxtLink>
        <Separator orientation="vertical" />
        <LazySystemAddMember />
        <Separator orientation="vertical" />
        <SystemVisualChangeButton />
      </div>
    </header>
    <main class="max-w-4xl w-full mx-auto space-y-4 mt-2">
      <LazySystemQAndA />
      <LazySystemRecipeslist />
    </main>
  </template>
  <template v-else>
    <div class="flex flex-col items-center justify-center h-screen">
      <TriangleAlert class="h-16 w-16 text-red-500" />
      <h2 class="text-xl font-semibold">Fehler beim Laden des Haushalts</h2>
      <p class="text-muted-foreground">
        Es ist ein Problem aufgetreten, während der Haushalt geladen wurde.
        Bitte versuche es später erneut.
      </p>
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
import { ChevronLeft, ChevronRight, TriangleAlert } from "lucide-vue-next";
import { useHousehold } from "~/composable/household";

const household = useHousehold();

useHead({
  titleTemplate: "Haushalt - %s",
  title: () => household.value?.name || "???",
});

preloadRouteComponents("/authenticated/households/[household]/recipe/[recipe]");
</script>
