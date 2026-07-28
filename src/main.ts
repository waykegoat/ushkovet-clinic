import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/layout.css";
import "@/styles/admin.css";

import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { ViteSSG } from "vite-ssg";
import { createI18n } from "vue-i18n";
import type { RouterScrollBehavior } from "vue-router";

import App from "@/App.vue";
import en from "@/locales/en";
import ru from "@/locales/ru";
import { routes } from "@/router/routes";

const scrollBehavior: RouterScrollBehavior = (to, _from, savedPosition) => {
  if (savedPosition) return savedPosition;
  if (to.hash) return { el: to.hash, behavior: "smooth", top: 96 };
  return { top: 0, behavior: "smooth" };
};

export const createApp = ViteSSG(
  App,
  {
    base: import.meta.env.BASE_URL,
    routes,
    scrollBehavior,
  },
  ({ app, isClient }) => {
    const pinia = createPinia();
    if (isClient) pinia.use(piniaPluginPersistedstate);

    const i18n = createI18n({
      legacy: false,
      locale: "ru",
      fallbackLocale: "ru",
      messages: { ru, en },
    });

    app.use(pinia);
    app.use(i18n);
  },
);
