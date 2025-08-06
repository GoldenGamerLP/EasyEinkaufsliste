<template>
  <div class="h-screen flex flex-col items-center justify-center">
    <div class="max-w-sm w-full flex-col">
      <h1 class="text-3xl font-bold text-center mb-4">
        Willkommen bei EasyHouseHolds
      </h1>
      <p class="text-muted-foreground text-center mb-4">
        Anmelden oder Registrieren um beizutreten!
      </p>
      <NuxtLink to="/authenticated/households">
        <Button class="w-full" size="lg"> Weiter gehts! </Button>
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
preloadRouteComponents("/authenticated");
</script>
