<template>
    <div>
        <div v-if="householdQuestions?.length === 0" class="w-full h-64 flex flex-col items-center justify-center border border-dashed rounded-lg">
            <p class="text-muted-foreground mb-8">Es gibt noch keine Abstimmungen. Neue erstellen?</p>
            <Drawer>
                <DrawerTrigger as-child><Button variant="outline">
                        Eneue Abstimmung erstellen
                    </Button></DrawerTrigger>
                <DrawerContent class="max-w-4xl mx-auto w-full">
                    <DrawerHeader>
                        <DrawerTitle>Abstimmung</DrawerTitle>
                        <DrawerDescription>Erstelle eine neue Abstimmung</DrawerDescription>
                    </DrawerHeader>
                    <div class="p-4 pb-0 max-h-1/2 overflow-y-auto scrollbar">

                        <AutoForm :schema="validation.omit({ householdId: true })" class="space-y-8" @submit="submitForm">
                            <Button type="submit" class="w-full">
                                Abstimmung erstellen
                            </Button>
                        </AutoForm>
                    </div>
                    <DrawerFooter>
                        <DrawerClose>
                            <Button variant="outline" class="w-full">
                                Cancel
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
        <SystemSingleQuestionAnwser :question="question" v-for="question in householdQuestions" :key="question._id" />
    </div>
</template>

<script lang="ts" setup>
import { useUser } from '~/composable/auth';
import { useMembers } from '~/composable/members';
import { questionSChema, validation } from '~/types/QandA';
import { toast } from 'vue-sonner';

const user = useUser();
const householdId = useRoute().params.household as string;
const members = useMembers();

const { data: householdQuestions, status: questionStatus } = await useFetch("/api/v1/household/qanda/questions", {
    query: {
        householdId,
    },
});

const submitForm = async (formData: Record<string, any>) => {
    try {
        await $fetch('/api/v1/household/qanda/create', {
            method: "POST",
            body: {
                ...formData,
                householdId,
            }
        })

        toast.success("Abstimmung erfolgreich erstellt");
    } catch (error) {
        console.error(error);
        toast.error("Fehler beim Erstellen der Abstimmung");
        return;
    }
}
</script>