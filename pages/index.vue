<template>
    <div class="flex flex-col items-center justify-center h-screen">
        <h1 class="text-3xl font-semibold">Willkommen auf EasyHousehold!</h1>
        <p class="text-lg text-muted-foreground mb-4">Bitte melde dich an, um fortzufahren.</p>
        <Button>
            <NuxtLink to="/authenticated/households" class="w-full">
                Weiter gehts!
            </NuxtLink>
        </Button>
    </div>
</template>