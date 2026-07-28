<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";

import AppointmentDialog from "@/components/AppointmentDialog.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import SiteHeader from "@/components/SiteHeader.vue";
import { useContentStore } from "@/stores/content";

const contentStore = useContentStore();
const route = useRoute();

onMounted(() => {
  void contentStore.loadPublicContent();
});
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main-content">К основному содержанию</a>
    <SiteHeader v-if="!route.meta.admin" />
    <main id="main-content" :class="{ 'admin-main': route.meta.admin }">
      <RouterView />
    </main>
    <SiteFooter v-if="!route.meta.admin" />
    <AppointmentDialog v-if="!route.meta.admin" />
  </div>
</template>
