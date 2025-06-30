<script setup lang="ts">
import type { FieldProps } from './interface'
import { Button } from '@/components/ui/button'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Trash, Image as ImageIcon, Loader2 } from 'lucide-vue-next'
import AutoFormLabel from './AutoFormLabel.vue'
import { beautifyObjectName } from './utils'
import { toast } from 'vue-sonner'
import { useFileDialog } from "@vueuse/core";
import { Field, FieldContextKey, useField } from 'vee-validate'

const formFieldRef = ref<InstanceType<typeof FormField>>(); // Ref for FormField

const resizer = `self.addEventListener('message', async (event) => {
    const file = event.data;
    const maxSize = 1024;

    try {
        const bitmap = await createImageBitmap(file);
        let { width, height } = bitmap;

        // Calculate new dimensions while keeping aspect ratio
        if (width > height) {
            if (width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
            }
        }

        const offscreencanvas = new OffscreenCanvas(width, height);
        const context = offscreencanvas.getContext('2d');

        context.drawImage(bitmap, 0, 0, width, height);

        const blob = await offscreencanvas.convertToBlob({ quality: 0.1, type: 'image/png' });

        const reader = new FileReader();
        reader.onloadend = () => {
            self.postMessage(reader.result);
        };
        reader.readAsDataURL(blob);
    } catch (e) {
        console.log("Error while resizing image.", e);
    }
});`
//TODO: cut the name of the file when too long 


const props = defineProps<FieldProps>()
const fieldContext = useField(props.fieldName)
const imageData = ref("");

const { files, open, reset, onCancel, onChange } = useFileDialog({
    accept: 'image/png, image/jpeg, image/bmp, image/webp',
    multiple: false,
});

const isLoading = ref(false);
const inputFile = shallowRef<File>();

onChange((event) => {
    const item = event?.item(0);
    if (!item) {
        toast("Please select a Picture or take one!");
        return;
    }

    inputFile.value = item;
    praseFile(item);
});

async function praseFile(file: File | undefined) {
    if (!file) return Promise.reject("No file passed.")
    if (isLoading.value) return Promise.reject("Already loading.");
    isLoading.value = true;

    processWorker(file).then((data) => {
        isLoading.value = false;
        fieldContext.setValue(data, true);
        imageData.value = data;
    });;
}

const processWorker = (file: File): Promise<string> => {
    const blob = new Blob([resizer], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    const pr = new Promise<string>(async (resolve, reject) => {
        worker.onmessage = (event) => {
            resolve(event.data);
        }

        worker.onerror = () => {
            reject("Worker not worked.");
        }
    });


    worker.postMessage(file);

    return pr;
}

const processLocal = (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            resolve(reader.result as string)
        }
        reader.onerror = (err) => {
            reject(err)
        }
        reader.readAsDataURL(file);
    })
}

const resetImageData = () => {
    inputFile.value = undefined
    fieldContext.setValue(undefined, true);
    imageData.value = "";
}

// @ts-expect-error ignore missing `id`
provide(FieldContextKey, fieldContext);
</script>

<template>
    <FormField v-slot="slotProps" :name="fieldName" ref="formFieldRef">
        <FormItem v-bind="$attrs">
            <AutoFormLabel v-if="!config?.hideLabel" :required="required">
                {{ config?.label || beautifyObjectName(label ?? fieldName) }}
            </AutoFormLabel>
            <FormControl>
                <slot v-bind="slotProps">
                    <component :is="inputFile ? 'div' : 'button'" @click="{ if (!inputFile) { open(); } }"
                        :disabled="isLoading"
                        class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-input/30 pl-1 pr-1 py-1 text-sm shadow-sm transition-colors disabled:opacity-70">
                        <div class="flex items-center gap-2">
                            <component :is="isLoading ? Loader2 : !!imageData ? 'img' : ImageIcon"
                                :class="{ 'animate-spin': isLoading }" :src="imageData"
                                class="size-8 text-muted-foreground" />
                            <p class="text-ellipsis whitespace-nowrap overflow-hidden max-w-2xs">{{ inputFile?.name ?? "Select a picture or take one" }}</p>
                        </div>
                        <Button :size="'icon'" :variant="'ghost'" :disabled="!inputFile" class="h-[26px] w-[26px]"
                            aria-label="Remove file" type="button" @click.prevent.stop="resetImageData()">
                            <Trash />
                        </Button>
                    </component>
                </slot>
            </FormControl>
            <FormDescription v-if="config?.description">
                {{ config.description }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>
