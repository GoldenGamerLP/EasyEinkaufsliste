<template>
    <Drawer>
        <DrawerTrigger as-child>
            <Button class="sm:flex-none flex-1" variant="outline">
                Öffentliche Rezepte Suchen
            </Button>
        </DrawerTrigger>
        <DrawerContent class="mx-auto w-full max-w-4xl">
            <DrawerHeader>
                <DrawerTitle>Öffentliche Rezepte Durchsuchen</DrawerTitle>
                <DrawerDescription>Gib einen Namen ein und wähle ein Rezept aus. Rezepte aus dem eigenen Haushalt werden
                    ausgeblendet.</DrawerDescription>
            </DrawerHeader>
            <div class="p-4 pb-0 space-y-4">
                <Combobox by="_id" v-model="selectedRecipe">
                    <ComboboxAnchor class="w-full">
                        <div class="relative items-center bg-input/40 w-full rounded-lg ">
                            <div class="flex h-9 items-center gap-2 px-2">
                                <component :is="isLoading ? Loader2 : CarrotIcon"
                                    :class="cn('size-4 shrink-0 opacity-50', isLoading ? 'animate-spin' : '')" />
                                <ComboboxInputReka v-model="search" :display-value="val => val?.name ?? ''"
                                    placeholder="Suche nach Rezepten..."
                                    class="placeholder:text-muted-foreground flex h-10 py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                                    auto-focus />
                            </div>
                        </div>
                    </ComboboxAnchor>

                    <ComboboxList class="w-full">
                        <ComboboxEmpty class="flex flex-col items-center">
                            Keine Rezepte gefunden!
                            <FrownIcon />
                        </ComboboxEmpty>

                        <ComboboxGroup>
                            <ComboboxItem v-for="recipe in data" :key="recipe._id" :value="recipe">
                                <div class="flex items-center">
                                    <component :is="recipe.bild_reference ? 'img' : CarrotIcon"
                                        :src="`/api/v1/cms/${recipe.bild_reference}`"
                                        class="size-10 rounded-full mr-4" />
                                    <div class="grid">
                                        <span class="text-xl">{{ recipe.name }}</span>
                                        <span class="text-muted-foreground max-w-sm line-clamp-1">{{ recipe.beschreibung
                                            }}</span>
                                    </div>
                                </div>
                                <ComboboxItemIndicator>
                                    <Check class="ml-auto h-4 w-4" />
                                </ComboboxItemIndicator>
                            </ComboboxItem>
                        </ComboboxGroup>
                        <ComboboxSeparator />
                    </ComboboxList>
                </Combobox>
                <Button class="w-full">
                    Hinzufügen!
                </Button>
            </div>
            <DrawerFooter>
                <DrawerClose>
                    <Button variant="outline" class="w-full">
                        Zurück
                    </Button>
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>

</template>

<script lang="ts" setup>
import { cn } from '~/lib/utils';
import { ComboboxInput as ComboboxInputReka } from 'reka-ui';
import { Loader2, CarrotIcon, Check, FrownIcon } from 'lucide-vue-next';
import { refDebounced } from '@vueuse/core';
import { type FrontEndRezept } from '~/types/HouseHold';
import { useHousehold } from '~/composable/household';

const selectedRecipe = ref<FrontEndRezept>();
const search = shallowRef();
const searchThrotthled = refDebounced(search);
const data = ref<FrontEndRezept[]>();
const isLoading = ref(false);
const household = useHousehold();

watch(searchThrotthled, async (newValue) => {
    if (newValue.length < 2) {
        data.value = [];
        isLoading.value = false;
        return;
    }

    isLoading.value = true;

    try {
        const response = await $fetch<FrontEndRezept[]>('/api/v1/household/recipes/findPublicRecipes', {
            query: {
                search: search.value,
                householdId: household.value?._id,
                limit: 3,
            }
        });
        data.value = response;
    } catch (error) {
        console.error("Error fetching Lebensmittel:", error);
        data.value = [];
    }

    isLoading.value = false;
});
</script>