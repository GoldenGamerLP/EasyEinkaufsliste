import type { FrontEndUser } from "~/types/User";
import { useUser } from "./auth";
import { useHousehold } from "./household";
import { UserRoles, type UserRole } from "~/types/HouseHold";

export const useRole = (member?: FrontEndUser): UserRole | undefined => {
    const user = member || useUser().value;
    const household = useHousehold().value;

    if(!household || !user) {
        return undefined;
    }

    if(household.createdBy === user._id) return UserRoles[2];

    if(household.members.includes(user._id)) {
        return household.memberRoles[user._id] || UserRoles[0];
    }

    return undefined;
}

export const hasPermission = (permission: UserRole, member?: FrontEndUser): boolean => {
    const role = useRole(member);
    if (!role) return false;

    const roleIndex = UserRoles.indexOf(role);
    const permissionIndex = UserRoles.indexOf(permission);

    return roleIndex >= permissionIndex;
}