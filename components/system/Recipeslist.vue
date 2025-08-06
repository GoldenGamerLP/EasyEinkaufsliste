<template>
  <Card class="overflow-hidden">
    <CardHeader class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex-1 min-w-0">
        <CardTitle>Rezepte</CardTitle>
        <CardDescription>Alle derzeitigen Rezepte</CardDescription>
      </div>

      <div class="flex flex-wrap gap-2 items-center w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            id="search"
            type="text"
            placeholder="Rezepte suchen..."
            class="pl-10 w-full"
            v-model="recipeSearch"
            autocomplete="off"
          />
        </div>

        <Select v-model="sortState">
          <SelectTrigger class="w-full sm:w-auto">
            <SelectValue placeholder="Sortieren" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="alphabetical">
                <div class="flex items-center gap-2">
                  <Text class="h-4 w-4" />
                  Alphabetisch
                </div>
              </SelectItem>
              <SelectItem value="mostliked">
                <div class="flex items-center gap-2">
                  <Heart class="h-4 w-4" />
                  Beliebteste
                </div>
              </SelectItem>
              <SelectItem value="created">
                <div class="flex items-center gap-2">
                  <Clock class="h-4 w-4" />
                  Neueste
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <LazySystemSearchPublicRecipes
          @update:addrecipe="(recipe) => data?.push(recipe)"
        />
        <LazySystemNewRecipeDialog
          @update:recipe="(recipe) => data?.push(recipe)"
        />
      </div>
    </CardHeader>

    <CardContent>
      <div
        v-if="status === 'pending' || status === 'idle'"
        class="flex justify-center items-center h-64"
      >
        <Loader2 class="animate-spin h-8 w-8 text-primary" />
        <span class="ml-2 text-muted-foreground">Lade Rezepte...</span>
      </div>

      <div
        v-else-if="data?.length === 0"
        class="flex flex-col items-center justify-center h-64 text-center text-muted-foreground"
      >
        <div class="relative mb-4">
          <CookingPot class="h-12 w-12 opacity-50" />
        </div>
        <p class="text-lg font-medium">Keine Rezepte gefunden</p>
        <p class="text-sm mt-1">
          Füge dein erstes Rezept hinzu oder suche öffentliche Rezepte
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="recipe in data"
          :key="recipe._id"
          class="group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
        >
          <NuxtLink
            :to="{
              name: 'authenticated-households-household-recipe-recipeId',
              params: {
                household: useRoute().params.household,
                recipeId: recipe._id,
              },
            }"
            class="block"
          >
            <div class="relative h-48 overflow-hidden">
              <img
                :src="`/api/v1/cms/${recipe.bild_reference}`"
                alt="Rezeptbild"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                :style="{ 'view-transition-name': `rezept-bild-${recipe._id}` }"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
              ></div>
              <div class="absolute top-3 right-3">
                <SystemMarkRecipeAsFavorit type="icon" :recipe="recipe" />
              </div>
            </div>

            <div class="p-4 space-y-2">
              <h3
                class="text-lg font-semibold leading-tight"
                :style="{
                  'view-transition-name': `rezept-titel-${recipe._id}`,
                }"
              >
                {{ recipe.name }}
              </h3>
              <p class="text-sm text-muted-foreground line-clamp-2">
                {{ recipe.beschreibung }}
              </p>

              <div class="flex flex-wrap gap-1 mt-3">
                <Badge variant="secondary" class="text-xs">
                  <Clock class="h-3 w-3 mr-1" />
                  <NuxtTime relative :datetime="recipe.created" />
                </Badge>
                <Badge variant="secondary" class="text-xs">
                  <Carrot class="h-3 w-3 mr-1" />

                  {{ recipe.zutaten.length }} Zutaten
                </Badge>
                <Badge variant="secondary" class="text-xs">
                  {{ geldFormat.format(calculateCost(recipe)) }}/Portion
                </Badge>
                <Badge
                  v-if="recipe.isPublic"
                  variant="secondary"
                  class="text-xs"
                >
                  <Globe class="h-3 w-3 mr-1" />
                  Öffentlich
                </Badge>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script lang="ts" setup>
import { SelectTrigger as STrigger } from "reka-ui";
import {
  GlassesIcon as MagnifyingGlass,
  SortDesc as SortDescending,
  Clock,
  Globe,
  CookingPot,
  Loader2,
  Search,
  Text,
  Heart,
  Carrot,
} from "lucide-vue-next";
import { type FrontEndRezept } from "~/types/HouseHold";

const geldFormat = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const recipeSearch = ref("");
const sortState = ref();

const { data, status, error, refresh } = await useFetch(
  "/api/v1/household/recipes/list",
  {
    method: "get",
    query: {
      search: recipeSearch,
      sort: sortState,
      householdId: useRoute().params.household,
    },
    watch: [recipeSearch, sortState],
    deep: true,
  }
);

const calculateCost = (rezept: FrontEndRezept): number => {
  return rezept.zutaten.reduce((total, zutat) => {
    return total + (zutat.portion / zutat.verpackungsmenge) * zutat.preis;
  }, 0);
};
</script>
