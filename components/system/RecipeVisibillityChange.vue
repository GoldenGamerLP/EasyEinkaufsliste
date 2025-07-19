<template>
    <Button :disabled="isLoading || !canChangeVisibllity" @click="changeVisibllity(!currentVisibillity)" variant="outline">
        <component :is="currentVisibillity ? DoorOpen : DoorClosedLocked" /> {{ currentVisibillity ? 'Ändern zu nicht Öffentlich' : 'Ändern zu öffentlich' }}
    </Button>
</template>

<script lang="ts" setup>
import { DoorOpen, DoorClosedLocked } from 'lucide-vue-next';
import type { FrontEndRezept } from '~/types/HouseHold';
import { toast } from 'vue-sonner';
import { hasPermission } from '~/composable/useRole';

const props = defineProps<{
    recipe: FrontEndRezept
}>();

const isLoading = ref(false);
const canChangeVisibllity = hasPermission("CREATOR");

const currentVisibillity = ref(props.recipe.isPublic || false);

const changeVisibllity = async (to: boolean) => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
        const res = await $fetch("/api/v1/household/recipes/changeVisibillity", {
            method: "POST",
            body: {
                recipeId: props.recipe._id,
                isPublic: to,
            }
        });
        if (res.success) {
            toast.success(`Sichtbarkeit von ${currentVisibillity.value} auf ${!currentVisibillity.value} gesetzt!`);
            currentVisibillity.value = to;
            props.recipe.isPublic = to;
        } else toast.error("Die Sichtbarkeit konnte nicht geändert werden!");
    } catch (error) {
        toast.error("Ein Fehler ist aufgetreten bei der Sichtbarkeits änderung.");
        console.error(error);
    }
    isLoading.value = false;
}
</script>