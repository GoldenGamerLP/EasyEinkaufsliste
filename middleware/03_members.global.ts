import { useMembers } from "~/composable/members";

export default defineNuxtRouteMiddleware(async (from, to) => {
	const members = useMembers();
	if(!to.params.household) {
		return;
	}

	const { data } = await useFetch("/api/v1/household/members/get", {
		query: {
			householdId: to.params.household as string
		}
	});
	if (data) {
		members.value = data.value;
	}
});