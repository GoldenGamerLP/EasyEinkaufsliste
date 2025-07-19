<template>
    <SystemSingleQuestionAnwser :question="question" v-for="question in householdQuestions" :key="question._id" @update:question="refresh" />
</template>

<script lang="ts" setup>
import { toast } from 'vue-sonner';


const householdId = useRoute().params.household as string;

const { data: householdQuestions, status: questionStatus, refresh } = await useFetch("/api/v1/household/qanda/questions", {
    query: {
        householdId,
    },
});
</script>