<template>
    <div class="mx-auto max-w-md">
        <AutoForm :schema="validation" :field-config="{ test: { component: 'lebensmittelArray' } }"
            @submit="console.log">
            <Button type="submit" class="mt-8">
                Submit now!
            </Button>
        </AutoForm>
    </div>
</template>

<script lang="ts" setup>
import * as z from "zod";

const LebensmittelSchema = z.object({
    name: z.string(),
    lebensmittel_gruppe: z.string(),
    preis: z.number(),
    verpackungsart: z.string(),
    verpackungsmenge: z.number(),
    verpackungsmenge_einheit: z.string(),
    standard_einheit_wert: z.number(),
});

const validation = z.object({
    test: z.array(z.object({
        portion: z.number().min(1, {message: "Die Portionen müssen mindestens größer als 0 sein."}),
        lebensmittel: LebensmittelSchema,
    }), {message: "Es muss mindestens ein Lebensmittel eingetragen sein."}),
});
</script>