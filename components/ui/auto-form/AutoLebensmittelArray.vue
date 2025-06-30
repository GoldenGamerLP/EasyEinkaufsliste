<script setup lang="ts" generic="T extends z.ZodAny">
import type { Config, ConfigItem } from './interface'
import { Button } from '@/components/ui/button'
import { FormItem, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { PlusIcon, TrashIcon } from 'lucide-vue-next'
import { FieldArray, FieldContextKey, useField } from 'vee-validate'
import { computed, provide } from 'vue'
import * as z from 'zod'
import { beautifyObjectName, getBaseType } from '@/components/ui/auto-form/utils';

const props = defineProps<{
  fieldName: string
  required?: boolean
  config?: Config<T>
  schema?: z.ZodArray<T>
  disabled?: boolean
}>()

function isZodArray(
  item: z.ZodArray<any> | z.ZodDefault<any>,
): item is z.ZodArray<any> {
  return item instanceof z.ZodArray
}

function isZodDefault(
  item: z.ZodArray<any> | z.ZodDefault<any>,
): item is z.ZodDefault<any> {
  return item instanceof z.ZodDefault
}
const fieldContext = useField(props.fieldName)
// @ts-expect-error ignore missing `id`
provide(FieldContextKey, fieldContext)
</script>

<template>
  <FieldArray v-slot="{ fields, remove, push, update }" as="section" :name="fieldName">
    <slot v-bind="props">
      <FormItem>
        <AutoFormLabel class="text-base" :required="required">
          {{ schema?.description || beautifyObjectName(fieldName) }}
        </AutoFormLabel>
        <SystemLebensmittelsearch v-for="(field, index) of fields" :key="field.key"
          @submit="(obj) => { update(index, obj); fieldContext.validate() }" @delete="remove(index)" />

        <Button type="button" variant="secondary" @click="push(null)"
          :disabled="fields.length > 0 && fields[fields.length - 1]?.value == null">
          <PlusIcon class="mr-2" :size="16" />
          Add
        </Button>
        <FormMessage />
      </FormItem>
    </slot>
  </FieldArray>
</template>
