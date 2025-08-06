<template>
  <Card :id="'question-' + question._id">
    <CardHeader>
      <CardTitle>{{ question.title }}</CardTitle>
      <CardDescription
        >{{ question.description }}
        <span class="text-sm mt-0.5" v-if="question.generatorId"
          >(System)</span
        ></CardDescription
      >
    </CardHeader>
    <CardContent class="flex flex-col gap-2" v-if="answerStatus === 'success'">
      <label
        v-for="(answer, index) in question.answers"
        :for="answer.id"
        @click.stop.prevent="selectAnswer(answer.id)"
      >
        <div
          class="flex items-center [:has(:checked)]:border-current border border-input rounded-lg p-4 cursor-pointer relative"
        >
          <input
            type="radio"
            :id="answer.id"
            :checked="isSelected(answer.id)"
          />
          <div class="flex flex-col ml-2 z-10 gap-y-0.5">
            <span
              >{{ answer.title }}
              <span class="text-muted-foreground text-sm"
                >{{ calculatedPercentage(question._id!, answer.id) }}%
              </span>
            </span>
            <Progress
              :model-value="calculatedPercentage(question._id!, answer.id)"
              class="w-64"
            />
          </div>
          <img
            v-if="answer.bild_refrence"
            :src="`/api/v1/cms/${answer.bild_refrence}`"
            alt="Rezeptbild"
            loading="lazy"
            class="absolute top-0 right-0 h-full w-full max-w-xs object-cover rounded-r-lg mask-r-from-900% mask-l-to-90%"
          />
        </div>
      </label>
    </CardContent>
    <div
      v-else-if="answerStatus === 'pending'"
      class="flex items-center justify-center h-64"
    >
      <Loader2Icon class="size-8 animate-spin" />
      <span class="text-muted-foreground ml-2">Lade Antworten...</span>
    </div>
    <CardFooter class="flex-wrap justify-center items-center gap-y-2 sm:gap-0">
      <div>
        <p class="text-muted-foreground text-sm">
          Es haben bereits {{ sumOfSelections(question._id!) }} /
          {{ members?.length }} Personen abgestimmt.
        </p>

        <p class="text-muted-foreground text-sm">
          Endet <NuxtTime relative :datetime="question.ttl" />.
        </p>
      </div>
      <Drawer>
        <DrawerTrigger as-child
          ><Button variant="outline" class="sm:ml-auto mr-2">
            Ergenisse anzeigen
          </Button></DrawerTrigger
        >
        <DrawerContent class="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle>Ergenisse - {{ question.title }}</DrawerTitle>
            <DrawerDescription
              >Ergenisse dieser Umfrage - Endet
              <NuxtTime relative :datetime="question.ttl" />
            </DrawerDescription>
          </DrawerHeader>
          <div class="p-4 pb-0 max-h-1/2 overflow-y-auto scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[200px]">Antwort</TableHead>
                  <TableHead>Verteilung</TableHead>
                  <TableHead class="text-right w-[150px]">Mitglieder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(answer, index) in question.answers"
                  :key="index"
                >
                  <TableCell class="font-medium">
                    <div class="flex items-center gap-2">
                      <div class="h-2 w-2 rounded-full bg-primary"></div>
                      {{ answer.title }}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <Progress
                        :model-value="calculatedPercentage(question._id!, answer.id)"
                        class="flex-1 h-2"
                      />
                      <span
                        class="text-sm text-muted-foreground tabular-nums w-12"
                      >
                        {{ calculatedPercentage(question._id!, answer.id) }}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell class="text-right">
                    <div class="flex flex-wrap gap-1 justify-end">
                      <template
                        v-for="member in geetMembersFromAnswer(answer.id)"
                        :key="member.id"
                      >
                        <div
                          class="flex items-center gap-1 bg-secondary rounded-full px-2 py-1 text-xs"
                        >
                          <SystemUserImageDisplay
                            :member="member"
                            class="size-4"
                          />
                          {{ member?.name }}
                        </div>
                      </template>
                      <span
                        v-if="geetMembersFromAnswer(answer.id).length === 0"
                        class="text-muted-foreground text-xs"
                      >
                        Keine
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <DrawerFooter>
            <DrawerClose as-child>
              <Button variant="default" class="w-full"> Schliesen </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            <Settings />
            <span class="sr-only">Mehr anzeigen</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click="refresh">
            <RefreshCcw /> Antworten neuladen
          </DropdownMenuItem>
          <DropdownMenuItem
            @click="refreshSurvey"
            :disabled="!compCanRefreshSurvey"
          >
            <component
              :is="refreshSurveyLoading ? Loader2Icon : TimerReset"
              :class="refreshSurveyLoading ? 'animate-spin' : ''"
            />
            Umfrage neustarten
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardFooter>
  </Card>
</template>

<script lang="ts" setup>
import { Loader2Icon, Settings, RefreshCcw, TimerReset } from "lucide-vue-next";
import { useUser } from "~/composable/auth";
import { useMembers } from "~/composable/members";
import { type AnswerData, type Question } from "~/types/QandA";
import { toast } from "vue-sonner";
import { useHousehold } from "~/composable/household";

const user = useUser();
const members = useMembers();
const household = useHousehold();
const refreshSurveyLoading = ref(false);

const props = defineProps<{
  question: Question;
}>();

const emit = defineEmits(["update:question"]);

const refreshSurvey = async () => {
  if (refreshSurveyLoading.value || !props.question.generatorId) return;
  refreshSurveyLoading.value = true;
  try {
    const res = await $fetch("/api/v1/household/qanda/renew", {
      method: "POST",
      body: {
        generator: props.question.generatorId,
        householdId: household.value?._id,
      },
    });

    if (!res) {
      toast.error("Die Umfrage konnte nicht erneuert werden!");
      return;
    } else {
      emit("update:question", props.question._id);
      refresh();
      toast.success("Du Umfrage wurde erneuert.");
    }
  } catch (error) {
    toast.error("Ein Fehler ist aufgetreten während des erneuern der Umfrage.");
    console.log(error);
  }

  refreshSurveyLoading.value = false;
};

const compCanRefreshSurvey = computed(() => {
  return (
    !!props.question.generatorId &&
    new Date().getTime() > new Date(props.question.ttl).getTime()
  );
});

const {
  data: answerData,
  status: answerStatus,
  refresh,
} = await useFetch<AnswerData>("/api/v1/household/qanda/answers", {
  query: {
    questionId: props.question._id,
  },
  deep: true,
});

const isSelected = (answerId: string) => {
  if (!answerData.value) return false;
  return (
    answerData.value.answer.find(
      (entry) => entry.userId === user.value?._id && entry.answerId === answerId
    ) !== undefined
  );
};

const sumOfSelections = (questionId: string) => {
  if (!answerData.value) return 0;

  return answerData.value.answer.length;
};

const selectAnswer = async (answerId: string) => {
  if (!answerData.value) return;

  const beforeUpdate = Object.assign({}, answerData.value);
  const index = answerData.value.answer.findIndex(
    (entry) => entry.userId === user.value?._id
  );

  if (index !== -1) {
    // User has already selected an answer, update it
    answerData.value.answer[index].answerId = answerId;
  } else {
    // User has not selected an answer yet, create a new entry
    answerData.value.answer.push({
      answerId,
      date: new Date().toISOString(),
      userId: user.value?._id || "",
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
    toast.error(
      "Fehler beim Aktualisieren der Antwort. Bitte versuche es später erneut."
    );

    // Rollback the optimistic update
    answerData.value.answer.length = 0;
    answerData.value.answer.concat(beforeUpdate.answer);
  }
};

const calculatedPercentage = (questionId: string, answerId: string) => {
  if (!answerData.value) return 0;

  const totalVotes = sumOfSelections(questionId);
  if (totalVotes === 0) return 0;

  const answerVotes = answerData.value.answer.filter(
    (entry) => entry.answerId === answerId
  ).length;
  return Math.round((answerVotes / totalVotes) * 100);
};

const geetMembersFromAnswer = (answerId: string) => {
  if (!answerData.value) return [];

  const crrAnswers = answerData.value.answer.filter(
    (entry) => entry.answerId === answerId
  ) as { userId: string }[];
  const resolvedMembers = crrAnswers.map((entry) =>
    members.value?.find((member) => member._id === entry.userId)
  );
  return resolvedMembers;
};
</script>
