<script setup lang="ts">
import { Menu, Phone, X } from "@lucide/vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { RouterLink, useRoute } from "vue-router";

import { useContentStore } from "@/stores/content";
import { useUiStore } from "@/stores/ui";

const route = useRoute();
const uiStore = useUiStore();
const contentStore = useContentStore();
const { isMenuOpen } = storeToRefs(uiStore);
const { t } = useI18n();
const logoUrl = `${import.meta.env.BASE_URL}logo.svg`;

const links = [
  { to: "/", label: "nav.home" },
  { to: "/services", label: "nav.services" },
  { to: "/contacts", label: "nav.contacts" },
];
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink class="brand" to="/" aria-label="УшкоВет — на главную">
        <span class="brand-mark" aria-hidden="true">
          <img :src="logoUrl" alt="" />
        </span>
        <span>
          <strong>УшкоВет</strong>
          <small>ветеринарная клиника</small>
        </span>
      </RouterLink>

      <nav class="desktop-nav" aria-label="Основная навигация">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :aria-current="route.path === link.to ? 'page' : undefined"
        >
          {{ t(link.label) }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <a
          class="header-phone"
          :href="`tel:${contentStore.content.settings.phoneHref}`"
          :aria-label="`Позвонить: ${contentStore.content.settings.phone}`"
        >
          <Phone :size="18" />
          <span>{{ contentStore.content.settings.phone }}</span>
        </a>
        <button class="button button-primary header-book" @click="uiStore.openAppointment">
          {{ t("actions.book") }}
        </button>
        <button
          class="menu-toggle"
          type="button"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-menu"
          aria-label="Открыть меню"
          @click="uiStore.toggleMenu"
        >
          <X v-if="isMenuOpen" :size="24" />
          <Menu v-else :size="24" />
        </button>
      </div>
    </div>

    <div v-if="isMenuOpen" id="mobile-menu" class="mobile-menu">
      <nav class="container" aria-label="Мобильная навигация">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          @click="uiStore.closeMenu"
        >
          {{ t(link.label) }}
        </RouterLink>
        <button class="button button-primary" @click="uiStore.openAppointment">
          {{ t("actions.book") }}
        </button>
      </nav>
    </div>
  </header>
</template>
