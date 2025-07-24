import { useUser } from "~/composable/auth";

export default defineNuxtRouteMiddleware((to) => {
  const user = useUser();
  // 1. User vorhanden + forward → redirect zu gewünschter Seite
  if (user.value && to.query.forward) {
    return navigateTo(("/authenticated" + to.query.forward) as string, {
      replace: true,
    });
  }

  // 2. User vorhanden + genau auf "/authenticated" → redirect zur Startseite
  if (user.value && to.path === "/authenticated") {
    return navigateTo("/authenticated/households", { replace: true });
  }

  // 3. Wenn schon auf /authenticated oder Forward vorhanden → nicht nochmal umleiten
  if (to.path === "/authenticated" || to.query.forward) return;

  // 4. Prüfen, ob Route geschützt ist (enthält "authenticated" im Pfad)
  const routeParts = to.path.split("/");
  let isProtected = false;
  let forward = "";

  for (const part of routeParts) {
    if (part === "authenticated") {
      isProtected = true;
      continue;
    }
    if (isProtected) {
      forward += `/${part}`;
    }
  }

  // 5. Wenn Route geschützt ist + kein User → redirect zur Login-Seite mit forward
  if (isProtected && !user.value) {
    return navigateTo(`/authenticated?forward=${forward}`, { replace: true });
  }

  // 6. Kein Redirect
  return;
});
