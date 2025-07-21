<template>
  <div class="inline-flex items-center p-1.5 bg-card rounded-lg justify-between">
    <Combobox by="_id" v-model="selectedLebensmittel">
      <ComboboxAnchor class="w-full">
        <div class="relative w-full items-center rounded-sm">
          <div class="flex h-9 items-center gap-2 px-2">
            <component :is="isLoading ? Loader2 : CarrotIcon" :class="cn('size-4 shrink-0 opacity-50', isLoading ? 'animate-spin' : '')" />
            <ComboboxInputReka
              v-model="searchName"
              :display-value="val => val?.name ?? ''"
              placeholder="Suche Lebensmittel"
              @blur="submitLebensmittel"
              class="placeholder:text-muted-foreground flex h-10 w-full bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
              auto-focus
            />
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
              <Check class="ml-auto h-4 w-4" />
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxGroup>

        <ComboboxSeparator />
      </ComboboxList>
    </Combobox>

    <NumberField
      id="portion"
      :default-value="0"
      :min="0"
      :step="selectedLebensmittel?.verpackungsmenge || 0"
      :disabled="!selectedLebensmittel"
      :step-snapping="false"
      v-model="numberSelection"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput class="border-none" @blur="submitLebensmittel" />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>

    <span v-if="selectedLebensmittel" class="ml-1">{{ selectedLebensmittel?.verpackungsmenge_einheit }}</span>

    <Button size="icon" variant="secondary" @click="() => emits('delete')">
      <TrashIcon class="text-destructive" />
      <span class="sr-only">Lebensmittel Eintrag löschen</span>
    </Button>
  </div>
</template>

<script lang="ts" setup>
import { cn } from '~/lib/utils';
import { Check, TrashIcon, CarrotIcon, FrownIcon, Loader2 } from 'lucide-vue-next';
import { ComboboxInput as ComboboxInputReka } from 'reka-ui';
import { ref, shallowRef, watch } from 'vue';
import type { Lebensmittel } from '~/types/HouseHold';
import { refDebounced } from '@vueuse/core';

const selectedLebensmittel = ref<Lebensmittel>();
const searchName = shallowRef("");
const searchThrottled = refDebounced(searchName, 450);
const numberSelection = ref(0);
const emits = defineEmits(["submit", "delete"]);
const isLoading = ref(false);
const data = ref<Lebensmittel[]>([]);

watch(searchThrottled, async (newValue) => {
  if (newValue.length < 2) {
    data.value = [];
    isLoading.value = false;
    return;
  }

  isLoading.value = true;

  try {
    const response = await $fetch<Lebensmittel[]>('/api/v1/household/lebensmittel/search', {
      params: {
        lebensmittelname: newValue,
        searchType: "name",
        limit: 10,
      },
    });
    data.value = response;
  } catch (error) {
    console.error("Error fetching Lebensmittel:", error);
    data.value = [];
  }

  isLoading.value = false;
});

const submitLebensmittel = () => {
  emits("submit", {
    lebensmittel: selectedLebensmittel.value,
    portion: numberSelection.value,
  });
};
</script>
