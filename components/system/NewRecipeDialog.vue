<template>
  <Drawer v-model:open="drawerState">
    <DrawerTrigger as-child>
      <Button variant="outline" :disabled="hasPermission('READ')">
        <Plus />
        <span class="sr-only">Neues Rezept</span>
      </Button>
    </DrawerTrigger>
    <DrawerContent class="mx-auto w-full max-w-4xl">
      <DrawerHeader>
        <DrawerTitle>Neues Rezept</DrawerTitle>
        <DrawerDescription
          >Gib einen Namen ein und die Zutaten.</DrawerDescription
        >
      </DrawerHeader>
      <div class="p-4 pb-0 max-h-1/2 overflow-y-auto scrollbar">
        <AutoForm
          :schema="
            RezeptErstellSchema.omit({ householdId: true, isPublic: true })
          "
          :field-config="{
            zutaten: { component: 'lebensmittelArray' },
            bild: { component: 'profile' },
            beschreibung: { component: 'textarea' },
          }"
          class="space-y-8"
          @submit="submit"
        >
          <Button type="submit" class="w-full" :disabled="isLoading">
            <template v-if="isLoading">
              <Loader2Icon class="animate-spin" />
            </template>
            <template v-else> <Send /> Absenden </template>
          </Button>
        </AutoForm>
      </div>
      <DrawerFooter>
        <DrawerClose>
          <Button variant="destructive" class="w-full"> Zurück </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner";
import { hasPermission } from "~/composable/useRole";
import { Loader2Icon, Send, Plus } from "lucide-vue-next";

const emit = defineEmits(["update:recipes"]);

const drawerState = ref(false);
const isLoading = ref(false);
const submit = async (data: Record<string, any>) => {
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    const res = await $fetch("/api/v1/household/recipes/create", {
      method: "POST",
      body: {
        ...data,
        householdId: useRoute().params.household,
      },
    });

    //If success, then close this
    if (res) {
      drawerState.value = false;
      emit("update:recipes", res);
      toast("Rezept erstellt!", { description: "Dein Rezept wurde erstellt!" });
    }
  } catch (error) {
    console.error(error);
    toast("Fehler", {
      description:
        "Ein Fehler ist aufgetreten während des erstellen deines Rezept. Versuche es erneut.",
      important: true,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
