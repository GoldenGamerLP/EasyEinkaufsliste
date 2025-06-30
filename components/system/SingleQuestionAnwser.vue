<template>
    <Card :id="'question-' + question._id">
        <CardHeader>
            <CardTitle>{{ question.title }}</CardTitle>
            <CardDescription>{{ question.description }} <span class="text-sm mt-0.5" v-if="question.systemId">(System)</span></CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-2">

            <label v-for="(answer, index) in question.answers" :for="answer.id"
                @click.stop.prevent="selectAnswer(answer.id)">
                <div
                    class="flex items-center [:has(:checked)]:border-current border border-input rounded-lg p-4 cursor-pointer relative">
                    <input type="radio" :id="answer.id" :checked="isSelected(answer.id)" />
                    <div class="flex flex-col ml-2 z-10 gap-y-0.5">
                        <span>{{ answer.title }} <span class="text-muted-foreground text-sm">{{
                            calculatedPercentage(question._id, answer.id) }}%
                            </span>
                        </span>
                        <Progress :model-value="calculatedPercentage(question._id, answer.id)" class="w-64" />
                    </div>
                    <img v-if="answer.bild_refrence" :src="`/api/v1/cms/${answer.bild_refrence}`"
                        class="absolute top-0 right-0 h-full w-full max-w-xs object-cover rounded-r-lg mask-r-from-900% mask-l-to-90%" />
                </div>
            </label>

        </CardContent>
        <CardFooter class="flex-wrap justify-center items-center gap-y-2 sm:gap-0">
            <p class="text-muted-foreground text-sm mt-0.5 ml-0.5">Es haben bereits {{
                sumOfSelections(question._id)
            }} / {{ members?.length }} Personen abgestimmt.</p>

            <p class="text-muted-foreground text-sm mt-0.5 ml-2">Endet
                <NuxtTime relative :datetime="question.ttl" />.
            </p>
            <Drawer>
                <DrawerTrigger as-child><Button variant="outline" class="sm:ml-auto mr-2">
                        Ergenisse anzeigen
                    </Button></DrawerTrigger>
                <DrawerContent class="mx-auto w-full max-w-4xl">
                    <DrawerHeader>
                        <DrawerTitle>Ergenisse - {{ question.title }}</DrawerTitle>
                        <DrawerDescription>Ergenisse dieser Umfrage - Ende in:
                            <NuxtTime relative :datetime="question.ttl" />
                        </DrawerDescription>
                    </DrawerHeader>
                    <div class="p-4 pb-0 max-h-1/2 overflow-y-auto scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        Frage
                                    </TableHead>
                                    <TableHead>Prozent</TableHead>
                                    <TableHead class="text-right">Mitglieder</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="(answer, index) in question.answers" :key="index">
                                    <TableCell>
                                        <div class="flex items-center">
                                            <img v-if="answer.bild_refrence"
                                                :src="`/api/v1/cms/${answer.bild_refrence}`"
                                                class="h-8 w-8 rounded-full mr-2 object-cover" />
                                            <span>{{ answer.title }}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Progress :model-value="calculatedPercentage(question._id, answer.id)"
                                            class="w-64" />
                                    </TableCell>
                                    <TableCell class="text-right">
                                        {{geetMembersFromAnswer(answer.id).map(member => member?.name).join(', ') ||
                                            'Keine Mitglieder'}}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <DrawerFooter>
                        <DrawerClose as-child>
                            <Button variant="default" class="w-full">
                                Schliesen
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </CardFooter>
    </Card>
</template>

<script lang="ts" setup>
import { useUser } from '~/composable/auth';
import { useMembers } from '~/composable/members';
import { type Question } from '~/types/QandA';
import { toast } from 'vue-sonner';

const user = useUser();
const members = useMembers();

const props = defineProps<{
    question: Question;
}>();

const { data: answerData, status: answerStatus } = await useFetch("/api/v1/household/qanda/answers", {
    query: {
        questionId: props.question._id,
    },
    deep: true,
});

const isSelected = (answerId: string) => {
    if (!answerData.value) return false;
    return answerData.value.answer.find((entry) => entry.userId === user.value?._id && entry.answerId === answerId) !== undefined;
}

const sumOfSelections = (questionId: string) => {
    if (!answerData.value) return 0;

    return answerData.value.answer.length;
}

const selectAnswer = async (answerId: string) => {
    if (!answerData.value) return;

    const beforeUpdate = answerData.value.answer;
    const index = answerData.value.answer.findIndex((entry) => entry.userId === user.value?._id);

    if (index !== -1) {
        // User has already selected an answer, update it
        answerData.value.answer[index].answerId = answerId;
    } else {
        // User has not selected an answer yet, create a new entry
        answerData.value.answer.push({
            userId: user.value?._id,
            answerId: answerId,
            questionId: props.question._id,
        });
    }

    //Optimisti update
    try {
        await $fetch("/api/v1/household/qanda/markAnswer", {
            method: "POST",
            body: {
                questionId: props.question._id,
                answer: answerId,
            },
        });

        toast.success("Antwort erfolgreich aktualisiert.");
    } catch (error) {
        toast.error("Fehler beim Aktualisieren der Antwort. Bitte versuche es später erneut.");

        // Rollback the optimistic update
        answerData.value.answer = beforeUpdate;
    }
}

const calculatedPercentage = (questionId: string, answerId: string) => {
    if (!answerData.value) return 0;

    const totalVotes = sumOfSelections(questionId);
    if (totalVotes === 0) return 0;

    const answerVotes = answerData.value.answer.filter((entry) => entry.answerId === answerId).length;
    return Math.round((answerVotes / totalVotes) * 100);
}

const geetMembersFromAnswer = (answerId: string) => {
    if (!answerData.value) return 0;

    const crrAnswers = answerData.value.answer.filter((entry) => entry.answerId === answerId) as { userId: string }[];
    const resolvedMembers = crrAnswers.map((entry) => members.value?.find((member) => member._id === entry.userId));
    return resolvedMembers;
}
</script>