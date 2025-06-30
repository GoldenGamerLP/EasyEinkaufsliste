<template>
    <Card>
        <CardHeader class="flex flex-wrap">
            <div class="mr-auto">
                <CardTitle>Rezepte</CardTitle>
                <CardDescription>Alle derzeitigen Rezepte</CardDescription>
            </div>
            <div class="flex gap-2">
                <div class="relative">
                    <Input id="search" type="text" placeholder="Rezepte suchen..." class="pl-10"
                        v-model="recipeSearch" />
                    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                        <SearchIcon class="size-6 text-muted-foreground" />
                    </span>
                </div>
                <Select v-model="sortState">
                    <SelectTrigger>
                        <SelectValue placeholder="Sortieren nach" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="alphabetical">
                                Alphabetisch
                            </SelectItem>
                            <SelectItem value="mostliked">
                                Beliebteste
                            </SelectItem>
                            <SelectItem value="created">
                                Neueste
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
            <ol class="grid grid-cols-1 md:grid-cols-2 gap-2" v-if="status === 'success'">
                <li v-for="recipe in data" :key="recipe._id">
                    <NuxtLink
                        :to="{ name: 'authenticated-households-household-recipe-recipeId', params: { household: useRoute().params.household, recipeId: recipe._id } }" :prefetch-on="'interaction'"
                        class="rounded-lg border p-4 h-72 relative flex justify-end flex-col group overflow-hidden flex-auto">
                        
                        <div class="flex items-center z-10">
                            <div class="grid mr-auto">
                                <h3 class="text-xl">{{ recipe.name }}</h3>
                                <span class="text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap">{{
                                    recipe.beschreibung }}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 mt-2 flex-wrap-reverse">
                            <Badge>
                                <NuxtTime relative :datetime="recipe.created" style="long" numeric="auto" />
                            </Badge>
                            <Badge>{{ recipe.zutaten.length }} Zutat(en)</Badge>
                            <Badge>Ungefähr {{ geldFormat.format(calculateCost(recipe)) }} pro Portion</Badge>
                        </div>

                        <img :src="`/api/v1/cms/${recipe.bild_reference}`" alt="Rezeptbild"
                            class="absolute rounded-lg top-0 right-0 left-0 h-full w-full object-cover rounded-r-lg mask-t-from-100% mask-b-to-80% group-hover:scale-105 transition-transform" />
                    </NuxtLink>
                </li>
                <li v-if="data?.length === 0"
                    class="flex-auto flex items-center justify-center w-full gap-2 my-8 text-muted-foreground">
                    Keine Rezepte gefunden.
                    <FrownIcon />
                </li>
                <li class="flex-auto flex items-center">
                    <Drawer v-model:open="drawerState">
                        <DrawerTrigger as-child>
                            <Button class="w-full">
                                <CarrotIcon /> Neues Rezept
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent class="mx-auto w-full max-w-4xl">
                            <DrawerHeader>
                                <DrawerTitle>Neues Rezept</DrawerTitle>
                                <DrawerDescription>Gib einen Namen ein und die Zutaten.</DrawerDescription>
                            </DrawerHeader>
                            <div class="p-4 pb-0 max-h-1/2 overflow-y-auto scrollbar">
                                <AutoForm :schema="RezeptErstellSchema.omit({ householdId: true })"
                                    :field-config="{ zutaten: { component: 'lebensmittelArray' }, bild: { component: 'profile' }, beschreibung: { component: 'textarea' } }"
                                    class="space-y-8" @submit="submit">
                                    <Button type="submit" class="w-full">
                                        <template v-if="isLoading">
                                            <Loader2Icon class="animate-spin" />
                                        </template>
                                        <template v-else>
                                            <Send /> Absenden
                                        </template>
                                    </Button>
                                </AutoForm>
                            </div>
                            <DrawerFooter>
                                <DrawerClose>
                                    <Button variant="destructive" class="w-full">
                                        Cancel
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </li>
            </ol>
            <div v-if="status === 'pending'" class="flex justify-center items-center flex-col">
                <Loader2Icon class="animate-spin" />
                <p>Laden...</p>
            </div>
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
import { SearchIcon, CarrotIcon, Loader2Icon, Send, FrownIcon } from "lucide-vue-next";
import { RezeptErstellSchema, type FrontEndRezept } from "~/types/HouseHold";
import { toast } from "vue-sonner";

const geldFormat = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
});

const recipeSearch = ref("");
const sortState = ref();
const isLoading = ref(false);
const drawerState = ref(false);

const { data, status, error, refresh } = await useLazyFetch("/api/v1/household/recipes/list", {
    method: "get",
    query: {
        search: recipeSearch,
        sort: sortState,
        householdId: useRoute().params.household,
    },
    watch: [recipeSearch, sortState],
});

const submit = async (data: Record<string, any>) => {
    try {
        isLoading.value = true;
        await $fetch("/api/v1/household/recipes/create", {
            method: "POST",
            body: {
                ...data,
                householdId: useRoute().params.household,
            },
        });

        //If success, then close this
        drawerState.value = false;
        await refresh();
        toast("Rezept erstellt!", { description: "Dein Rezept wurde erstellt!" });
    } catch (error) {
        console.error(error);
        toast("Fehler", { description: "Ein Fehler ist aufgetreten während des erstellen deines Rezept. Versuche es erneut.", important: true });
    } finally {
        isLoading.value = false;
    }
}

const calculateCost = (rezept: FrontEndRezept): number => {
    return rezept.zutaten.reduce((total, zutat) => {
        return total + (zutat.portion / zutat.verpackungsmenge) * zutat.preis;
    }, 0);
}
</script>