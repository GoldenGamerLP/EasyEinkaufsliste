<template>
    <div v-if="status === 'success' && data" class="max-w-3xl mx-auto mt-8">
        <Card>
            <CardHeader class="h-52 relative flex flex-col justify-between">
                <img :src="`/api/v1/cms/${data.bild_reference}`" alt="Rezept Bild"
                    class="absolute inset-0 w-full h-80 object-cover -top-6 object-center rounded-t-lg mask-t-from-100% mask-b-to-80%" />

                <div class="flex justify-between w-full z-10">
                    <NuxtLink
                        :to="{ name: 'authenticated-households-household', params: { household: useRoute().params.household } }">
                        <Button variant="outline">
                            <ChevronsLeft /> Zurück
                        </Button>
                    </NuxtLink>
                    <DropdownMenu v-if="recipeBelongsToHousehold">
                        <DropdownMenuTrigger as-child>
                            <Button variant="outline">
                                <MoreVertical />
                                <span class="sr-only">Mehr</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <SystemRecipeVisibillityChange :recipe="data" />
                            <DropdownMenuItem>Löschen</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
                <div class="flex z-10 w-full items-center justify-between">
                    <div class="grid">
                        <h1 class="text-2xl font-bold mb-2">{{ data.name }}</h1>
                        <div class="flex flex-wrap gap-2">
                            <Badge>
                                <NuxtTime relative :datetime="data.created" style="long" numeric="auto" />
                            </Badge>
                            <Badge>{{ data.zutaten?.length || 0 }} Zutat(en)</Badge>
                            <Badge>
                                Ungefähr {{ geldFormat.format(calculateCost(data)) }} pro Portion
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
                    <span class="mt-2 text-base text-muted-foreground">
                        {{ data.beschreibung }}
                    </span>
                </div>
                <div>
                    <NumberField id="portion" :default-value="members?.length || 0" :min="1" class="mb-4"
                        v-model="portions">
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
                            {{ zutat.name }} – {{ portions * zutat.portion }} {{ zutat.verpackungsmenge_einheit }}
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    </div>
    <div v-else-if="status === 'pending'" class="flex justify-center items-center h-96">
        <Loader2Icon class="animate-spin mr-2" />
        <span>Laden...</span>
    </div>
    <div v-else>
        {{ status }} - {{ error }}
    </div>
</template>

<script setup lang="ts">
import { Loader2Icon, ChevronsLeft, MoreVertical, DoorOpen } from "lucide-vue-next";
import { useHousehold } from "~/composable/household";
import { useMembers } from "~/composable/members";
import type { FrontEndRezept } from "~/types/HouseHold";

const portions = ref(1);
const recipeId = useRoute().params.recipeId;
const members = useMembers();
const household = useHousehold();

const { data, status, error } = await useFetch<FrontEndRezept>("/api/v1/household/recipes/get", {
    query: {
        recipeId,
        householdId: household.value?._id,
    },
    deep: true,
});

const recipeBelongsToHousehold = computed(() => {
    return data.value?.householdId === household.value?._id;
});

const geldFormat = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
});

const calculateCost = (rezept: any): number => {
    if (!rezept?.zutaten) return 0;
    return rezept.zutaten.reduce((total: number, zutat: any) => {
        return total + ((zutat.portion / zutat.verpackungsmenge) * zutat.preis);
    }, 0);
};
</script>