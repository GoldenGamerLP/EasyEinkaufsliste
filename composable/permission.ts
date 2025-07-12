import { type UserRole } from "~/types/HouseHold";
import { useUser } from "./auth";
import { useHousehold } from "./household";
import type { FrontEndUser } from "~/types/User";

const user = useUser();
const household = useHousehold();

export const hasPermission = (
  role: UserRole,
  optUser?: FrontEndUser
): boolean => {
  const currentUser = optUser || user.value;
  if (!currentUser || !household.value) return false;

  const memberRole = household.value.memberRoles[currentUser._id];
  if (!memberRole) return false;

  return memberRole === role;
};
