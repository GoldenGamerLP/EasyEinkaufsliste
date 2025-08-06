<template>
  <div v-if="status === 'success' && data" class="max-w-3xl mx-auto mt-8">
    <Card>
      <CardHeader class="h-52 relative flex flex-col justify-between">
        <img
          :src="`/api/v1/cms/${data.bild_reference}`"
          alt="Rezept Bild"
          class="absolute inset-0 w-full h-80 object-cover -top-6 object-center rounded-t-lg mask-t-from-100% mask-b-to-80%"
          :style="{ 'view-transition-name': `rezept-bild-${data._id}` }"
        />

        <div class="flex justify-between w-full z-10">
          <NuxtLink
            :to="{
              name: 'authenticated-households-household',
              params: { household: useRoute().params.household },
            }"
          >
            <Button variant="outline"> <ChevronsLeft /> Zurück </Button>
          </NuxtLink>
          <DropdownMenu v-if="recipeBelongsToHousehold">
            <DropdownMenuTrigger as-child>
              <Button variant="outline">
                <MoreVertical />
                <span class="sr-only">Mehr</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="flex flex-col gap-y-2">
              <SystemRecipeVisibillityChange :recipe="data" />
              <Button
                variant="outline"
                @click.native="deleteRecipe"
                :disabled="hasPermission('READ')"
              >
                Das Rezept löschen
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div class="flex z-10 w-full items-center justify-between">
          <div class="grid">
            <h3
              class="text-2xl font-bold mb-2"
              :style="{
                'view-transition-name': `rezept-titel-${data._id}`,
              }"
            >
              {{ data.name }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <Badge>
                <NuxtTime
                  relative
                  :datetime="data.created"
                  style="long"
                  numeric="auto"
                />
              </Badge>
              <Badge>{{ data.zutaten?.length || 0 }} Zutat(en)</Badge>
              <Badge>
                Ungefähr {{ geldFormat.format(calculateCost(data)) }} pro
                Portion
              </Badge>
              <Badge v-if="data.isPublic">
                <DoorOpen />
                Öffentlich
              </Badge>
            </div>
          </div>
          <SystemMarkRecipeAsFavorit :recipe="data" type="icon" />
        </div>
      </CardHeader>
      <CardContent class="space-y-8">
        <div>
          <Label class="text-lg font-semibold">Beschreibung</Label>
          <span
            class="mt-2 text-base text-muted-foreground whitespace-pre-wrap"
          >
            {{ data.beschreibung }}
          </span>
        </div>
        <div>
          <NumberField
            id="portion"
            :default-value="members?.length || 0"
            :min="1"
            class="mb-4"
            v-model="portions"
          >
            <Label for="portion" class="text-lg font-semibold">Portionen</Label>
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>
        <div>
          <Label class="text-lg font-semibold">Zutaten</Label>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="zutat in data.zutaten" :key="zutat._id">
              {{ zutat.name }} – {{ portions * zutat.portion }}
              {{ zutat.verpackungsmenge_einheit }}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
  <div
    v-else-if="status === 'pending'"
    class="flex justify-center items-center h-96"
  >
    <Loader2Icon class="animate-spin mr-2" />
    <span>Laden...</span>
  </div>
  <div v-else>{{ status }} - {{ error }}</div>
</template>

<script setup lang="ts">
import {
  Loader2Icon,
  ChevronsLeft,
  MoreVertical,
  DoorOpen,
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import { useHousehold } from "~/composable/household";
import { useMembers } from "~/composable/members";
import { hasPermission } from "~/composable/useRole";
import type { FrontEndRezept } from "~/types/HouseHold";

const portions = ref(1);
const recipeId = useRoute().params.recipeId;
const members = useMembers();
const household = useHousehold();

const { data, status, error } = await useFetch<FrontEndRezept>(
  "/api/v1/household/recipes/get",
  {
    query: {
      recipeId,
      householdId: household.value?._id,
    },
    deep: true,
  }
);

const recipeBelongsToHousehold = computed(() => {
  return data.value?.householdId === household.value?._id;
});

useHead({
  titleTemplate: "Rezept - %s",
  title: () => data.value?.name || "???",
});

const geldFormat = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const calculateCost = (rezept: any): number => {
  if (!rezept?.zutaten) return 0;
  return rezept.zutaten.reduce((total: number, zutat: any) => {
    return total + (zutat.portion / zutat.verpackungsmenge) * zutat.preis;
  }, 0);
};

const deleteRecipe = async () => {
  try {
    const res = await $fetch("/api/v1/household/recipes/delete", {
      method: "DELETE",
      body: {
        recipeId,
      },
    });

    if (res) {
      toast.info("Das Rezept würde erfolgreich gelöscht!");
      useRouter().back();
    } else {
      toast.error("Not working!");
    }
  } catch (error) {
    console.log("Not working.");
  }
};
</script>
