<template>
  <div class="w-full mx-auto flex flex-col justify-center items-center h-[calc(100vh-10rem)]">
    <span class="mb-4 flex items-center gap-2">
      <Cable class="size-14 text-primary" />
      <div class="grid">
        <h1 class="text-3xl font-bold">Easy-Household</h1>
        <p class="text-lg text-muted-foreground leading-none">
          Hier kannst du dich registrieren oder einloggen.
        </p>
      </div>
    </span>
    <Tabs default-value="login" class="max-w-md w-full">
      <TabsList class="w-full">
        <TabsTrigger value="register" class="w-full">
          Registrieren
        </TabsTrigger>
        <TabsTrigger value="login" class="w-full"> Log-In </TabsTrigger>
      </TabsList>
      <TabsContent value="register">
        <Card>
          <CardHeader>
            <CardTitle>Willkommen zu Easy-Household!</CardTitle>
            <CardDescription>Bitte registriere dich.</CardDescription>
          </CardHeader>
          <CardContent>
            <AutoForm :schema="registerSchema" :field-config="{ profilePicture: { component: 'profile' } }"
              @submit="onRegister" class="space-y-8">
              <Button class="w-full mt-4" :disabled="loading" type="submit">
                <template v-if="loading">
                  <Loader2 class="size-4 animate-spin" /> Loading...
                </template>
                <template v-else>Registrieren</template>
              </Button>
            </AutoForm>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Willkommen zurück!</CardTitle>
            <CardDescription>Bitte logge dich ein.</CardDescription>
          </CardHeader>
          <CardContent>
            <AutoForm :schema="loginSchema" @submit="onLogin" class="space-y-8">
              <Button class="w-full mt-4" type="submit" :disabled="loading">
                <template v-if="loading">
                  <Loader2 class="size-4 animate-spin" /> Loading...
                </template>
                <template v-else>Einloggen</template>
              </Button>
            </AutoForm>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { Cable, Loader2 } from "lucide-vue-next";
import { loginSchema, registerSchema } from "~/types/User";
import { toast } from "vue-sonner";

useHead({
  title: "EasyHouseholds"
})

const loading = ref(false);

onMounted(() => {
  const forwardedUrl = (useRoute().query.forward as string);
  if (forwardedUrl) {
    toast("Error while forwarding.", {description: 'You have to be logged-in!'});
  }
})

const onLogin = async (values: Record<string, any>) => {
  try {
    loading.value = true;
    const response = await $fetch("/api/v1/auth/actions/login", {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (response.success) {
      toast("Welcome back!", {description: "You are beeing forwarded."});

      await forward();
    } else {
      toast("Error while logging in.", {description: 'Wrong EMail or Password.'});
    }
  } catch (error) {
    console.error(error);
    toast("Error while logging in.", {description: error.statusText || 'An unkown error occoured.'});
  } finally {
    loading.value = false;
  }
};

const onRegister = async (values: Record<string, any>) => {
  try {
    loading.value = true;
    const response = await $fetch("/api/v1/auth/actions/signup", {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (response.success) {
      toast("Registered!", {description: 'You are not registered. You are now forwarded.'});

      await forward();
    } else {
      toast("Error while registering.", {description: 'Did you fill everything out?'});
    }
  } catch (error) {
    console.error(error);
    toast("Error while registering.", {description: error.statusText || 'An unkown error occoured.'})
  } finally {
    loading.value = false;
  }
};

const forward = async () => {
  const forwardedUrl = (useRoute().query.forward as string) || "/households";
  await navigateTo("/authenticated" + forwardedUrl);
};
</script>
