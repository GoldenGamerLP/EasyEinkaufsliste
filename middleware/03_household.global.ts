import { useHousehold } from "~/composable/household";

export default defineNuxtRouteMiddleware(async (from, to) => {
    const household = useHousehold();
    if(!to.params.household) {
        return;
    }

    const { data } = await useFetch("/api/v1/household/get", {
        query: {
            householdId: to.params.household as string
        }
    });
    if (data) {
        household.value = data.value;
    }
});