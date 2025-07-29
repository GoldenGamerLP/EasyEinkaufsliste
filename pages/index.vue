<template>
    <div class="h-screen flex flex-col items-center justify-center">
        <div class="max-w-sm w-full flex-col">
            <h1 class="text-3xl font-bold text-center mb-4">Willkommen bei EasyHouseHolds</h1>
            <p class="text-muted-foreground text-center mb-4">Anmelden oder Registrieren um beizutreten!</p>
            <Button class="w-full" size="lg">
                <NuxtLink to="/authenticated/households">
                    Weiter gehts!
                </NuxtLink>
            </Button>
        </div>
    </div>
</template>

<script lang="ts" setup>
preloadRouteComponents("/authenticated");
</script>