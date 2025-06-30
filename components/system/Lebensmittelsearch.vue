<template>
    <div class="inline-flex items-center p-1.5 bg-card rounded-md">
        <Combobox by="_id" v-model="selectedLebensmittel">
            <ComboboxAnchor class="w-full">
                <div class="relative w-full items-center rounded-sm">
                    <div data-slot="command-input-wrapper" class="flex h-9 items-center gap-2 px-2">
                        <CarrotIcon class="size-4 shrink-0 opacity-50" />
                        <ComboboxInputReka initial-focus auto-focus data-slot="command-input" :display-value="(val) => val?.name ?? ''"
                            placeholder="Suche Lebensmittel" v-model="searchName" @blur="submitLebensmittel"
                            class="placeholder:text-muted-foreground flex h-10 w-full bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50" />
                    </div>
                </div>
            </ComboboxAnchor>

            <ComboboxList>
                <ComboboxEmpty class="flex flex-col items-center">
                    Kein Lebensmittel gefunden!
                    <FrownIcon />
                </ComboboxEmpty>

                <ComboboxGroup>
                    <ComboboxItem v-for="framework in data" :key="framework._id" :value="framework">
                        {{ framework.name }}

                        <ComboboxItemIndicator>
                            <Check :class="cn('ml-auto h-4 w-4')" />
                        </ComboboxItemIndicator>
                    </ComboboxItem>
                </ComboboxGroup>
                <ComboboxSeparator />
            </ComboboxList>
        </Combobox>
        <NumberField id="portion" :default-value="0" :min="0" :step="selectedLebensmittel?.verpackungsmenge || 0"
            :step-snapping="false" :disabled="!selectedLebensmittel" v-model="numberSelection">
            <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput class="border-none" @blur="submitLebensmittel" />
                <NumberFieldIncrement />
            </NumberFieldContent>
        </NumberField>
        <span v-if="selectedLebensmittel" class="ml-1">{{ selectedLebensmittel?.verpackungsmenge_einheit }}</span>
        <Button size="icon" variant="outline" class="ml-auto"
            @click="() => emits('delete')">
            <TrashIcon class="text-destructive" />
        </Button>
    </div>
</template>

<script lang="ts" setup>
import { cn } from '~/lib/utils';
import { Check, TrashIcon, CarrotIcon, FrownIcon } from 'lucide-vue-next';
import { ComboboxInput as ComboboxInputReka } from 'reka-ui';
import type { Lebensmittel } from '~/server/utils/HouseHoldUtils';
import { number } from 'zod';

const selectedLebensmittel = ref<Lebensmittel>();
const searchName = ref("");
const numberSelection = ref(0);
const emits = defineEmits(["submit", "delete"]);
const props = defineProps({
    index: number,
})

const { data, status } = useFetch("/api/v1/household/searchLebensmittel", {
    query: {
        searchType: "name",
        lebensmittelname: searchName,
        limit: 20,
    },
    watch: [searchName]
});

const submitLebensmittel = () => {
    emits("submit", {
        lebensmittel: selectedLebensmittel.value,
        portion: numberSelection.value,
    });
}

const resetSelection = () => {
    selectedLebensmittel.value = undefined;
    searchName.value = "";
    numberSelection.value = 0;
};
</script>