<template>
  <Button
    variant="secondary"
    :size="type"
    :disabled="isLoading && hasPermission('READ')"
    @click.prevent.stop="toggleFavorit"
  >
    <component
      :is="recipe.isFavorite ? Sparkles : Star"
      :class="recipe.isFavorite ? 'text-yellow-400' : ''"
    />
    <span :class="type === 'icon' ? 'sr-only' : ''">
      {{
        recipe.isFavorite
          ? "Nicht mehr als Favorit makieren"
          : "Als Favorit makieren"
      }}
    </span>
  </Button>
</template>

<script lang="ts" setup>
import { Star, Sparkles } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { useHousehold } from "~/composable/household";
import { hasPermission } from "~/composable/useRole";
import type { FrontEndRezept } from "~/types/HouseHold";

const household = useHousehold();
const isLoading = ref(false);

const { recipe, type } = defineProps<{
  recipe: FrontEndRezept;
  type: "icon" | "default";
}>();

const toggleFavorit = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const res = await $fetch("/api/v1/household/recipes/markRecipeAsFavorite", {
      method: "POST",
      body: {
        householdId: household.value?._id,
        recipeId: recipe._id,
      },
    });

    if (res) {
      toast.info("Als Favorit markiert!");
      recipe.isFavorite = !recipe.isFavorite;
    }
  } catch (error) {
    toast.error(
      "Ein Fehler ist aufgetreten während des Markierens deines Favoriten."
    );
    console.log(error);
  }

  isLoading.value = false;
};
</script>
