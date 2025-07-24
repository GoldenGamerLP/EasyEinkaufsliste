<template>
  <Card>
    <CardHeader class="flex flex-wrap">
      <div class="sm:w-full !w-auto mr-auto">
        <CardTitle>Rezepte</CardTitle>
        <CardDescription>Alle derzeitigen Rezepte</CardDescription>
      </div>
      <div class="flex gap-2 flex-wrap">
        <div class="relative">
          <Input
            id="search"
            type="text"
            placeholder="Rezepte suchen..."
            class="pl-12"
            v-model="recipeSearch"
            autocomplete="off"
          />
          <span
            class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
          >
            <Select v-model="sortState">
              <STrigger>
                <LucideSortDesc class="text-muted-foreground" />
                <span class="sr-only">Sortieren nach</span>
              </STrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="alphabetical"> Alphabetisch </SelectItem>
                  <SelectItem value="mostliked"> Beliebteste </SelectItem>
                  <SelectItem value="created"> Neueste </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Separator :orientation="'vertical'" class="mx-1.5 bg-input p-px" />
          </span>
        </div>
      </div>
      <LazySystemSearchPublicRecipes
        @update:addrecipe="(recipe) => data?.push(recipe)"
      />
      <LazySystemNewRecipeDialog
        @update:recipe="(recipe) => data?.push(recipe)"
      />
    </CardHeader>
    <CardContent>
      <ol
        class="grid grid-cols-1 md:grid-cols-2 gap-2"
        v-if="status === 'success'"
      >
        <li v-for="recipe in data" :key="recipe._id">
          <NuxtLink
            :to="{
              name: 'authenticated-households-household-recipe-recipeId',
              params: {
                household: useRoute().params.household,
                recipeId: recipe._id,
              },
            }"
            :prefetch-on="'interaction'"
            class="rounded-lg border p-4 h-72 relative flex justify-end flex-col group overflow-hidden flex-auto"
          >
            <div class="flex items-center z-10">
              <div class="grid mr-auto">
                <h3 class="text-xl">{{ recipe.name }}</h3>
                <span
                  class="text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap"
                  >{{ recipe.beschreibung }}</span
                >
              </div>
              <SystemMarkRecipeAsFavorit type="icon" :recipe="recipe" />
            </div>
            <div class="flex gap-2 mt-2 flex-wrap">
              <Badge>
                <NuxtTime
                  relative
                  :datetime="recipe.created"
                  style="long"
                  numeric="auto"
                />
              </Badge>
              <Badge>{{ recipe.zutaten.length }} Zutat(en)</Badge>
              <Badge
                >Ungefähr {{ geldFormat.format(calculateCost(recipe)) }} pro
                Portion</Badge
              >
              <Badge v-if="recipe.isPublic"> <DoorOpen /> Öffentlich </Badge>
            </div>

            <img
              :src="`/api/v1/cms/${recipe.bild_reference}`"
              alt="Rezeptbild"
              loading="lazy"
              class="absolute rounded-lg top-0 right-0 left-0 h-full w-full object-cover rounded-r-lg mask-t-from-100% mask-b-to-80% group-hover:scale-105 transition-transform"
            />
          </NuxtLink>
        </li>
      </ol>
      <div
        v-if="data?.length === 0"
        class="flex w-full items-center justify-center flex-col my-8 text-muted-foreground"
      >
        Keine Rezepte gefunden.
        <FrownIcon />
      </div>
      <div
        v-if="status === 'pending'"
        class="flex justify-center items-center flex-col h-64"
      >
        <Loader2Icon class="animate-spin" />
        <p>Laden...</p>
      </div>
    </CardContent>
  </Card>
</template>

<script lang="ts" setup>
import { SelectTrigger as STrigger } from "reka-ui";
import {
  LucideSortDesc,
  Loader2Icon,
  FrownIcon,
  DoorOpen,
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
