<template>
  <div>
    <header
      class="flex items-center justify-between border-b mb-6 px-4 py-2 shadow-md"
    >
      <div>
        <h1 class="text-3xl font-bold">EasyHouseholds</h1>
        <p class="text-sm text-muted-foreground">
          Verwalte deine Haushalte hier.
        </p>
      </div>
      <SystemLogoutButton class="ml-auto" />
    </header>
    <ol
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-0 sm:px-2"
    >
      <!-- Household Cards -->
      <li
        v-for="household in data"
        :key="household._id"
        class="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
      >
        <NuxtLink
          :to="`/authenticated/households/${household._id}`"
          class="block h-full"
        >
          <div class="relative h-48 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0"
              alt="Household Image"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
            ></div>
            <div class="absolute top-3 right-3">
              <Badge variant="outline" class="backdrop-blur-sm bg-accent/40">
                <Users class="w-3 h-3 mr-1" />
                {{ household.members.length }}
              </Badge>
            </div>
          </div>
          <div class="p-4 grid">
            <h2
              class="text-xl font-semibold flex items-center gap-2"
              :style="{
                'view-transition-name': `ueberschrift-household-${household._id}`,
              }"
            >
              {{ household.name }}
            </h2>
            <p class="flex items-center text-muted-foreground">
              Erstellt am <NuxtTime :datetime="household.createdAt" />
            </p>
          </div>
        </NuxtLink>
      </li>

      <!-- New Household Card -->
      <li class="h-full">
        <Drawer>
          <DrawerTrigger as-child>
            <Button
              variant="outline"
              class="h-full w-full flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl transition-all duration-300 hover:border-primary hover:bg-accent hover:text-accent-foreground"
            >
              <Plus class="w-8 h-8" />
              <span class="text-lg font-medium">Neuer Haushalt</span>
              <span class="text-sm text-muted-foreground text-center">
                Erstelle einen neuen Haushalt
              </span>
            </Button>
          </DrawerTrigger>
          <DrawerContent class="max-w-4xl mx-auto w-full">
            <DrawerHeader class="text-left">
              <DrawerTitle class="flex items-center gap-2">
                <Home class="w-5 h-5" />
                Haushalt erstellen
              </DrawerTitle>
              <DrawerDescription>
                Erstelle einen Haushalt und füge Personen hinzu!
              </DrawerDescription>
            </DrawerHeader>
            <div class="p-4 pb-0 max-h-[60vh] overflow-y-auto">
              <AutoForm
                :schema="validation.omit({ members: true })"
                class="space-y-6"
                @submit="onSubmit"
                :loading="isLoading"
              >
                <div class="flex gap-3">
                  <Button type="submit" class="flex-1" :disabled="isLoading">
                    <Send v-if="!isLoading" class="w-4 h-4 mr-2" />
                    <Loader2
                      v-if="isLoading"
                      class="w-4 h-4 mr-2 animate-spin"
                    />
                    {{ isLoading ? "Erstelle..." : "Absenden" }}
                  </Button>
                  <DrawerClose as-child>
                    <Button variant="outline">
                      <X class="w-4 h-4 mr-2" />
                      Abbrechen
                    </Button>
                  </DrawerClose>
                </div>
              </AutoForm>
            </div>
          </DrawerContent>
        </Drawer>
      </li>
    </ol>
  </div>
</template>

<script lang="ts" setup>
import { Plus, Loader2, Send, X, Home, Users } from "lucide-vue-next";
import * as z from "zod";
import { toast } from "vue-sonner";

const isLoading = ref(false);

preloadRouteComponents("/authenticated/households/test");

const { data, status, refresh } = useFetch("/api/v1/household/households", {
  method: "get",
});

const validation = z.object({
  name: z.string().min(5),
  description: z.string().optional().default("Mein Haushalt"),
  members: z.array(z.string()).default([]),
});

useHead({
  titleTemplate: "EasyHouseholds - %s",
  title: () => data.value?.length,
});

const onSubmit = async (data: Record<string, any>) => {
  isLoading.value = true;
  try {
    await $fetch("/api/v1/household/create", {
      method: "post",
      body: data,
    });

    await refresh();

    toast("Haushalt erfolgreich erstellt!", {
      description: `Der Haushalt "${data.name}" wurde erfolgreich erstellt.`,
    });
  } catch (error) {
    toast("Fehler beim Erstellen des Haushalts", {
      description:
        "Es gab ein Problem beim Erstellen des Haushalts. Bitte versuche es später erneut.",
      important: true,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
