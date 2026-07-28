<script setup lang="ts">
import { ArrowUpRight } from "@lucide/vue";

import type { Service } from "@/content/defaultContent";
import { useUiStore } from "@/stores/ui";

defineProps<{
  service: Service;
  index?: number;
}>();

const uiStore = useUiStore();
</script>

<template>
  <article class="service-card">
    <div class="service-card-top">
      <span class="service-index">{{ String((index ?? 0) + 1).padStart(2, "0") }}</span>
      <span class="service-category">{{ service.category }}</span>
    </div>
    <div>
      <h3>{{ service.title }}</h3>
      <p>{{ service.summary }}</p>
    </div>
    <div class="service-card-bottom">
      <strong>{{ service.price }}</strong>
      <button
        class="icon-button"
        type="button"
        :aria-label="`Записаться на услугу «${service.title}»`"
        @click="uiStore.openAppointment"
      >
        <ArrowUpRight :size="20" />
      </button>
    </div>
  </article>
</template>
