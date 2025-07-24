import type { RouteLocationNormalizedGeneric } from "vue-router";
import type { FrontEndUser, User } from "~/types/User";

export const useUser = () => {
  const user = useState<FrontEndUser | null>("user", () => null);
  return user;
};

export const hydrateUser = async (route: RouteLocationNormalizedGeneric) => {
  const user = useUser();
  const data = await useRequestFetch()("/api/v1/auth/user");
  user.value = data;
};
