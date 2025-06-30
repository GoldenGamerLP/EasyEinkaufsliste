<template>
    <div>
        <header class="w-full border-b mb-2 px-1">
            <h1 class="text-3xl">Households</h1>
            <p class="text-muted-foreground">Manage your households here.</p>
        </header>
        <ol class="px-1 flex flex-row gap-2">
            <li class="rounded-lg border max-w-sm relative group overflow-hidden" v-for="household in data">
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
                        <p class="text-muted-foreground">Erstellt am {{ household.createdAt }}</p>
                    </div>
                </NuxtLink>
            </li>
            <li>
                <Drawer>
                    <DrawerTrigger as-child>
                        <Button variant="default">
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
                            <AutoForm :schema="validation" class="space-y-8 px-2" @submit="onSubmit"
                                :loading="isLoading">
                                <template #members="slotProps">
                                    test
                                </template>
                                <Button type="submit" class="w-full">
                                    <SendIcon /> Absenden!
                                </Button>
                            </AutoForm>
                        </div>
                        <DrawerFooter>
                            <DrawerClose>
                                <Button variant="outline">
                                    Cancel
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

const { data, status, refresh } = useLazyFetch("/api/v1/household/households", {
    method: "get",
});

const validation = z.object({
    name: z.string().min(5),
    description: z.string().optional().default("Mein Haushalt"),
    members: z.array(z.string()).default([]),
});

const onSubmit = async (formData: z.infer<typeof validation>) => {
    isLoading.value = true;
    try {
        await $fetch("/api/v1/household/create", {
            method: "post",
            body: formData,
        });

        await refresh();


        toast("Haushalt erfolgreich erstellt!", {
            description: `Der Haushalt "${formData.name}" wurde erfolgreich erstellt.`,
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