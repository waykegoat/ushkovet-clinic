<script setup lang="ts">
import { ArrowUpRight } from "@lucide/vue";

import type { Service } from "@/content/defaultContent";
import { useContentStore } from "@/stores/content";

defineProps<{
  service: Service;
  index?: number;
}>();

const contentStore = useContentStore();
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
      <a
        class="icon-button"
        :href="`tel:${contentStore.content.settings.phoneHref}`"
        :aria-label="`Позвонить по поводу услуги «${service.title}»`"
      >
        <ArrowUpRight :size="20" />
      </a>
    </div>
  </article>
</template>
