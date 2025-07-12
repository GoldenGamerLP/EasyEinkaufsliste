<template>
    <div>
        <header class="w-full border-b mb-2 px-1">
            <h1 class="text-3xl">EasyHouseholds</h1>
            <p class="text-muted-foreground">Verwalte deine Haushalte hier.</p>
        </header>
        <ol class="px-1 flex flex-row gap-2">
            <li class="rounded-lg border max-w-sm relative group overflow-hidden w-full" v-for="household in data">
                <NuxtLink :to="`/authenticated/households/${household._id}`" class="block">
                    <div class="mask-b-from-50% mask-b-to-70%">
                        <img src="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0" alt="Household Image"
                            class="rounded-lg w-full object-cover h-64 group-hover:scale-110 transition-transform duration-300">
                    </div>
                    <div class="p-4 -mt-28">
                        <h2 class="text-xl font-semibold">
                            {{ household.name }}
                            <Badge>{{ household.members.length }} Teilnehmer</Badge>
                        </h2>
                        <p class="text-muted-foreground">Erstellt am <NuxtTime :datetime="household.createdAt" /></p>
                    </div>
                </NuxtLink>
            </li>
            <li>
                <Drawer>
                    <DrawerTrigger as-child>
                        <Button variant="outline" class="h-full aspect-square">
                            <PlusIcon />
                            Neuer Haushalt
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent class="max-w-4xl mx-auto w-full">
                        <DrawerHeader>
                            <DrawerTitle>Haushalt erstellen</DrawerTitle>
                            <DrawerDescription>Erstelle einen Haushalt und füge Personen hinzu!</DrawerDescription>
                        </DrawerHeader>
                        <div class="p-4 pb-0 max-h-1/2 overflow-y-auto scrollbar">
                            <AutoForm :schema="validation.omit({members: true})" class="space-y-8 px-2" @submit="onSubmit"
                                :loading="isLoading">
                                <Button type="submit" class="w-full">
                                    <SendIcon /> Absenden!
                                </Button>
                            </AutoForm>
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
            </li>
        </ol>
    </div>
</template>

<script lang="ts" setup>
import { PlusIcon, SendIcon } from 'lucide-vue-next';
import * as z from "zod";
import { toast } from 'vue-sonner';

const isLoading = ref(false);

definePageMeta({
    middleware: ["only-logged-in"]
})

const { data, status, refresh } = useFetch("/api/v1/household/households", {
    method: "get",
});

const validation = z.object({
    name: z.string().min(5),
    description: z.string().optional().default("Mein Haushalt"),
    members: z.array(z.string()).default([]),
});

const onSubmit = async (data: Record<string,any>) => {
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
            description: "Es gab ein Problem beim Erstellen des Haushalts. Bitte versuche es später erneut.",
            important: true,
        });
    } finally {
        isLoading.value = false;
    }
};
</script>