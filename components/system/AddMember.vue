<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="link" class="relative">
        <Badge variant="secondary" class="mt-2 flex items-center gap-1">
          <UserPlusIcon />
          {{ members.length }} Teilnehmer
        </Badge>
      </Button>
    </DrawerTrigger>
    <DrawerContent class="max-w-4xl mx-auto w-full">
      <DrawerHeader>
        <DrawerTitle>Benutzuer hinzufügen.</DrawerTitle>
        <DrawerDescription
          >Suche nach Benutzer um diese zum Haushalt
          hinzuzufügen.</DrawerDescription
        >
      </DrawerHeader>
      <ol class="p-4 pb-0 grid gap-2">
        <li>
          <Combobox
            by="label"
            v-model="person"
            :disabled="!hasPermission('CREATOR')"
          >
            <ComboboxAnchor class="w-full">
              <div class="relative w-full items-center">
                <ComboboxInput
                  class="pl-9"
                  :display-value="(val) => val?.mail ?? ''"
                  placeholder="Email des Benutzers..."
                  v-model="search"
                />
                <span
                  class="absolute start-0 inset-y-0 flex items-center justify-center px-3"
                >
                  <UserPlus class="size-4 text-muted-foreground" />
                </span>
                <Button
                  class="absolute inset-y-0 right-0"
                  variant="link"
                  :disabled="!person || addUserLoading"
                  @click="addUserToHousehold"
                >
                  <template v-if="addUserLoading">
                    <Loader2Icon class="animate-spin" />
                  </template>
                  <template v-else>
                    <Check />
                    Hinzufügen
                  </template>
                </Button>
              </div>
            </ComboboxAnchor>

            <ComboboxList class="w-full">
              <ComboboxEmpty>
                Keine Benutzer gefunden oder er ist bereits hinzugefügt.
              </ComboboxEmpty>

              <ComboboxGroup>
                <ComboboxItem
                  v-for="user of computedResult"
                  :key="user.mail"
                  :value="user"
                  class="w-full"
                >
                  {{ user.mail }}

                  <ComboboxItemIndicator>
                    <Check :class="cn('ml-auto h-4 w-4')" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </Combobox>
        </li>
        <li v-for="member in members" :key="member._id">
          <SystemMemberEntry :member="member" />
        </li>
      </ol>
      <DrawerFooter>
        <DrawerClose>
          <Button variant="outline" class="w-full"> Schliesen </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

<script lang="ts" setup>
import { UserPlusIcon, UserPlus, Check, Loader2Icon } from "lucide-vue-next";
import { useUser } from "~/composable/auth";
import { useMembers } from "~/composable/members";
import { cn } from "~/lib/utils";
import type { FrontEndUser } from "~/types/User";
import { toast } from "vue-sonner";
import { hasPermission } from "~/composable/useRole";
import { refDebounced } from "@vueuse/core";
const user = useUser();
const members = useMembers();

const person = ref<FrontEndUser | null>(null);
const search = ref("");
const searchThrottled = refDebounced(search, 450);
const addUserLoading = ref(false);
const data = ref<FrontEndUser[]>([]);

watch(searchThrottled, async () => {
  try {
    const res = await $fetch("/api/v1/household/members/search", {
      method: "GET",
      query: {
        userMail: search.value,
      },
    });

    if (res) {
      data.value = res;
    }
  } catch (error) {
    console.log(error);
  }
});

const computedResult = computed(() => {
  const result = [];
  const crrData = data.value;

  if (!crrData || !members) return [];

  let add = true;
  for (const user of crrData) {
    for (const crrMember of members.value) {
      if (crrMember._id === user._id) {
        add = false;
        break;
      }
    }

    if (add) result.push(user);
  }

  return result;
});

const addUserToHousehold = async () => {
  if (addUserLoading.value) return;

  addUserLoading.value = true;
  try {
    const req = await $fetch("/api/v1/household/members/addMember", {
      method: "POST",
      body: {
        householdId: useRoute().params.household,
        userId: person.value?._id,
      },
    });

    toast.success("Der Bentuzer wurde erfolgreich hinzugefügt.");

    members.value?.push(req);
    person.value = null;

    await refresh();
  } catch (error) {
    toast.error("Ein fehler ist aufgetreten während hinzufügen des Benutzers.");
  }

  addUserLoading.value = false;
};
</script>
