<template>
    <div>
        <header class="w-full border-b mb-2 px-1">
            <h1 class="text-3xl flex items-center gap-2"><ShoppingCartIcon /> Einkaufswagen
                <ChevronsRight /> <span class="text-muted-foreground">{{ cart }}</span>
            </h1>
            <div class="flex items-center">
                <NuxtLink :to="{ name: 'authenticated-households-household', params: { household: household } }">
                    <Button variant="link">
                        <ChevronLeft />
                        Zurück
                    </Button>
                </NuxtLink>
                <Circle class="size-2 text-muted-foreground mr-3"/>
                <span class="">
                    Vor 5 Minuten Aktualisert
                </span>
            </div>
        </header>
        <main class="max-w-4xl mx-auto space-y-2">
            <Card>
                <CardHeader>
                    <CardTitle>Einkaufswagen</CardTitle>
                    <CardDescription>Einkäufe die erledigt werden müssen für das heutige Essen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ol class="space-y-2">
                        <template v-for="(entry, index) in allEntries" :key="entry.id">
                            <li v-if="entry.protected">
                                <label>
                                    <div class="flex gap-2 items-center">
                                        <input type="checkbox" :checked="entry.isToggled" @change="toggleEntry(index)">
                                        <Badge class="text-sm">{{ entry.description }}</Badge>
                                    </div>
                                </label>
                            </li>
                        </template>
                    </ol>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Zusätzliche Einkäufe</CardTitle>
                    <CardDescription>Zusätzliche einkäufe die getätigt werden müssen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ol class="space-y-2">
                        <template v-for="(entry, index) in allEntries" :key="entry.id">
                            <li v-if="!entry.protected">
                                <label>
                                    <div class="flex gap-2 items-center">
                                        <input type="checkbox" :checked="entry.isToggled" @change="toggleEntry(index)">
                                        <Badge class="text-sm w-auto">
                                            <input type="text" v-model="allEntries[index].description"
                                                class="outline-none" />
                                        </Badge>
                                        <Button class="ml-auto" @click="removeEntry(index)">
                                            <span class="sr-only">Eintrag Löschen</span>
                                            <Trash />
                                        </button>
                                    </div>
                                </label>
                            </li>
                        </template>
                    </ol>
                </CardContent>
                <CardFooter>
                    <label>
                        <div class="flex gap-2 items-center">
                            <input type="checkbox" disabled>
                            <Input type="text" class="w-full" v-model="additionInput" @keydown.enter="clearAndSubmit"
                                @blur="clearAndSubmit" minlength="3" placeholder="Neuer Eintrag" autocomplete="off" />
                        </div>
                    </label>
                </CardFooter>
            </Card>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ChevronsRight, ChevronLeft, RefreshCcw, Trash, ShoppingCartIcon, Circle } from 'lucide-vue-next';
import { v4 as uuidv4 } from 'uuid';

const household = useRoute().params.household;
const cart = useRoute().params.cart;

// Typ für Einträge
interface CartEntry {
    id: string;
    protected: boolean;
    description: string;
    isToggled: boolean;
}

// Alle Einträge in einer Liste, protected Einträge werden entsprechend markiert
const allEntries = ref<CartEntry[]>([
    { id: uuidv4(), protected: true, description: 'Brötchen', isToggled: false },
    { id: uuidv4(), protected: true, description: 'Wurst', isToggled: false },
]);

const additionInput = ref<string>("");

const clearAndSubmit = () => {
    if (!additionInput.value) return;
    allEntries.value.push({
        id: uuidv4(),
        protected: false,
        description: additionInput.value,
        isToggled: false
    });
    additionInput.value = "";
}

const removeEntry = (index: number) => {
    if (allEntries.value[index].protected) return;
    allEntries.value.splice(index, 1);
}

const toggleEntry = (index: number) => {
    allEntries.value[index].isToggled = !allEntries.value[index].isToggled;
}
</script>

<style scoped>
.size-4 {
    width: 1rem;
    height: 1rem;
}
</style>