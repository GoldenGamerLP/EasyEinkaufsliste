<template>
  <Card :class="noQuestions ? 'border-dashed border-2 pb-0' : 'pb-0'">
    <CardHeader>
      <CardTitle>Umfragen</CardTitle>
      <CardDescription> Hier werden Umfragen angezeigt. </CardDescription>
    </CardHeader>
    <CardContent class="space-y-8 p-2 rounded-lg">
      <LazySystemSingleQuestionAnwser
        :hydrate-on-visible="true"
        :question="question"
        v-for="question in householdQuestions"
        :key="question._id"
        @update:question="refresh"
      />
    </CardContent>
  </Card>
</template>

<script lang="ts" setup>
const householdId = useRoute().params.household as string;

const {
  data: householdQuestions,
  status: questionStatus,
  refresh,
} = await useFetch("/api/v1/household/qanda/questions", {
  query: {
    householdId,
  },
});

const noQuestions = computed(() => {
  return householdQuestions.value?.length === 0;
});
</script>
