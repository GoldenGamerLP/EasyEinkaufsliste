<template>
    <Drawer>
        <DrawerTrigger as-child>
            <Button variant="link" class="relative">
                <User />
                Teilnehmer
                <Badge>
                    {{ members?.length || 0 }}
                    <span class="sr-only">Teilnehmer</span>
                </Badge>
            </Button>
        </DrawerTrigger>
        <DrawerContent class="max-w-4xl mx-auto w-full">
            <DrawerHeader>
                <DrawerTitle>Benutzuer hinzufügen.</DrawerTitle>
                <DrawerDescription>Suche nach Benutzer um diese zum Haushalt hinzuzufügen.</DrawerDescription>
            </DrawerHeader>
            <ol class="p-4 pb-0 grid gap-2">
                <li>
                    <Combobox by="label" v-model="person">
                        <ComboboxAnchor class="w-full">
                            <div class="relative w-full items-center">
                                <ComboboxInput class="pl-9" :display-value="(val) => val?.label ?? ''"
                                    placeholder="Email des Benutzers..." v-model="search" />
                                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                                    <UserPlus class="size-4 text-muted-foreground" />
                                </span>
                            </div>
                        </ComboboxAnchor>

                        <ComboboxList class="w-full">
                            <ComboboxEmpty>
                                Keine Benutzer gefunden.
                            </ComboboxEmpty>

                            <ComboboxGroup>
                                
                                <ComboboxItem v-for="user of data" :key="user.mail" :value="user.mail" class="w-full">
                                    {{ user.mail }}

                                    <ComboboxItemIndicator>
                                        <Check :class="cn('ml-auto h-4 w-4')" />
                                    </ComboboxItemIndicator>
                                </ComboboxItem>
                            </ComboboxGroup>
                        </ComboboxList>
                    </Combobox>
                </li>
                <li v-for="member in members" :key="member._id"
                    class="flex items-center gap-2 px-1.5 py-0.5 odd:bg-card rounded-lg">
                    <User class="h-8 w-8 flex-shrink-0" />
                    <div>
                        <h3 class="font-semibold">{{ member.name }} <span class="text-sm mt-0.5 text-muted-foreground"
                                v-if="isSelf(member)">(Du)</span></h3>
                        <p class="text-sm text-muted-foreground">{{ member.mail }}</p>
                    </div>
                    <Button variant="destructive" class="ml-auto" :disabled="isSelf(member)">
                        <Trash2 />
                        Entfernen
                    </Button>
                </li>
            </ol>
            <DrawerFooter>
                <DrawerClose>
                    <Button variant="outline" class="w-full">
                        Schliesen
                    </Button>
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
</template>

<script lang="ts" setup>
import { throttledRef } from '@vueuse/core';
import { Trash2, User, UserPlus, Check } from 'lucide-vue-next';
import { useUser } from '~/composable/auth';
import { useMembers } from '~/composable/members';
import { cn } from '~/lib/utils';
import type { FrontEndUser } from '~/types/User';

const user = useUser();
const members = useMembers();

const isSelf = (member: FrontEndUser) => {
    return member._id === user.value?._id;
};

const person = ref<FrontEndUser | null>(null);
const search = ref('');

const { data, status } = useLazyFetch('/api/v1/household/members/search', {
    method: "get",
    query: {
        userMail: search,
    },
    watch: [search],
});

const computedResult = computed(() => {
    //Concat the members and the search results
    return [...members.value, ...(data.value || [])].filter((item, index, self) =>
        index === self.findIndex((t) => t.mail === item.mail)
    );
})
</script>