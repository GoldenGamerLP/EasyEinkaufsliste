import type { RouteLocationNormalizedGeneric } from "vue-router";
import type { HouseHold } from "~/types/HouseHold";

export const useHousehold = () => {
  const household = useState<HouseHold | null>("household", () => null);
  return household;
};

export const hydrateHousehold = async (
  route: RouteLocationNormalizedGeneric
) => {
  const household = useHousehold();
  if (!route.params.household) {
    return;
  }

  const data = await useRequestFetch()("/api/v1/household/get", {
    query: {
      householdId: route.params.household as string,
    },
  });

  household.value = data;
};
