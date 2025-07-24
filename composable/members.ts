import type { RouteLocationNormalizedGeneric } from "vue-router";
import type { FrontEndUser } from "~/types/User";

export const useMembers = () => {
  const members = useState<FrontEndUser[] | null>("members", () => null);
  return members;
};

export const hydrateMembers = async (route: RouteLocationNormalizedGeneric) => {
  const members = useMembers();
  if (!route.params.household) {
    return;
  }

  const data = await useRequestFetch()("/api/v1/household/members/get", {
    query: {
      householdId: route.params.household as string,
    },
  });

  members.value = data;
};
