<template>
  <div class="flex items-center justify-around w-full">
    <SystemUserImageDisplay class="size-8 mr-1" :member="props.member" />
    <div class="grid">
      <span class="text-sm font-medium line-clamp-1"
        >{{ props.member.name }} {{ props.member.lastname }}</span
      >
      <span class="text-xs text-muted-foreground line-clamp-1">{{
        props.member.mail
      }}</span>
    </div>
    <div class="ml-auto flex items-center">
      <Select v-model="currentRole" :disabled="!canEdit" class="w-32">
        <SelectTrigger>
          <SelectValue placeholder="Rolle auswählen" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="role of Object.keys(UserRoles)"
              :key="role"
              :value="UserRoles[role as keyof typeof UserRoles]"
            >
              {{ UserRoles[role as keyof typeof UserRoles] }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        :disabled="!canEdit"
        variant="ghost"
        class="ml-2"
        @click="removeUser"
      >
        <template v-if="isRemoving">
          <Trash2 class="size-4 animate-spin" />
          <span class="sr-only">Entfernen...</span>
        </template>
        <template v-else>
          <Trash2 class="size-4" />
          <span class="sr-only">Mitglied entfernen</span>
        </template>
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Trash2 } from "lucide-vue-next";
import { useHousehold } from "~/composable/household";
import type { FrontEndUser } from "~/types/User";
import { User } from "lucide-vue-next";
import { UserRoles, type UserRole } from "~/types/HouseHold";
import { toast } from "vue-sonner";
import { useRole } from "~/composable/useRole";
import { useUser } from "~/composable/auth";

const props = defineProps<{
  member: FrontEndUser;
}>();

const isRemoving = ref(false);
const household = useHousehold();
const currentUser = useUser();

const currentRole = ref(useRole(props.member));

const canEdit = computed(() => {
  // Only allow editing if the current user is the creator or the member is not the current user
  return useRole() === "CREATOR" && props.member._id !== currentUser.value?._id;
});

watch(currentRole, (newRole, oldRole) => {
  //Update the role and optimistically update the userrole
  if (oldRole !== newRole) {
    onRoleChange(newRole, props.member, oldRole);
  }
});

const removeUser = async () => {
  if (isRemoving.value) return;
  isRemoving.value = true;

  try {
    await $fetch("/api/v1/household/members/removeMember", {
      method: "DELETE",
      body: {
        householdId: useRoute().params.household,
        userId: props.member._id,
      },
    });
    toast.success(
      `Mitglied ${props.member.name} ${props.member.lastname} entfernt.`
    );

    household.value.members = household.value.members.filter(
      (member) => member !== props.member._id
    );
  } catch (error) {
    toast.error(`Fehler beim Entfernen des Mitglieds: ${error}`);
  } finally {
    isRemoving.value = false;
  }
};

async function onRoleChange(
  newRole: UserRole,
  member: FrontEndUser,
  rolebackRole: UserRole
) {
  try {
    const res = await $fetch("/api/v1/household/members/updateMemberRole", {
      method: "POST",
      body: {
        householdId: useRoute().params.household,
        userId: member._id,
        role: newRole,
      },
    });
    if (res) {
      household.value.memberRoles[member._id] = newRole;
      toast.success(
        `Rolle von ${member.name} ${member.lastname} geändert zu ${newRole}.`
      );
    } else {
      toast.error("Rolle konnte nicht geändert werden.");

      currentRole.value = rolebackRole;
    }
  } catch (error) {
    toast.error("Fehler beim Ändern der Rolle.");
  }
}
</script>
