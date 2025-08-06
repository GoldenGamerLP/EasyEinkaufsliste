<template>
  <template v-if="household">
    <header
      class="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-muted"
    >
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <NuxtLink
            to="/authenticated/households"
            class="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft class="h-5 w-5" />
            <span class="hidden sm:inline">Zurück</span>
          </NuxtLink>

          <div class="flex-1"></div>

          <div class="flex items-center gap-2">
            <SystemVisualChangeButton />
            <SystemLogoutButton />
          </div>
        </div>

        <div class="flex flex-col items-center justify-center py-3">
          <h1
            class="text-2xl sm:text-3xl font-bold tracking-tight text-center"
            :style="{
              'view-transition-name': `ueberschrift-household-${household._id}`,
            }"
          >
            {{ household.name }}
          </h1>
          <AddMember />
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto p-4 space-y-6">
      <!-- Deine bestehenden Content-Komponenten hier -->
      <LazySystemQAndA />
      <LazySystemRecipeslist />
    </main>
  </template>

  <template v-else>
    <!-- Dein bestehender Error-State bleibt unverändert -->
    <div class="flex flex-col items-center justify-center min-h-screen p-4">
      <div class="max-w-md w-full text-center space-y-6">
        <div class="relative mx-auto w-24 h-24">
          <div
            class="absolute inset-0 bg-destructive/20 rounded-full animate-ping"
          ></div>
          <div class="relative bg-destructive/10 rounded-full p-5">
            <TriangleAlert class="h-12 w-12 text-destructive mx-auto" />
          </div>
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">
            Haushalt nicht gefunden
          </h2>
          <p class="text-muted-foreground">
            Der gewünschte Haushalt konnte nicht geladen werden. Möglicherweise
            existiert er nicht oder es gab ein technisches Problem.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 pt-4">
          <NuxtLink to="/authenticated/households" class="flex-1">
            <Button variant="default" class="w-full">
              <Home class="h-4 w-4 mr-2" />
              Zur Übersicht
            </Button>
          </NuxtLink>
          <Button variant="outline" class="flex-1" @click="$router.back()">
            <RefreshCw class="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ChevronLeft, TriangleAlert, RefreshCw, Home } from "lucide-vue-next";
import AddMember from "~/components/system/AddMember.vue";
import { useHousehold } from "~/composable/household";

const household = useHousehold();

useHead({
  titleTemplate: "Haushalt - %s",
  title: () => household.value?.name || "???",
});

definePageMeta({
  pageTransition: {
    name: "slide-left",
    mode: "out-in",
  },
});

preloadRouteComponents("/authenticated/households/[household]/recipe/[recipe]");
</script>
