import { defineStore } from "pinia";
import { computed, ref } from "vue";

import {
  cloneDefaultContent,
  type Service,
  type SiteContent,
} from "@/content/defaultContent";
import { apiUrl, isStaticDemo } from "@/lib/api";

export const useContentStore = defineStore(
  "content",
  () => {
    const content = ref<SiteContent>(cloneDefaultContent());
    const draft = ref<SiteContent | null>(null);
    const isLoading = ref(false);
    const lastError = ref<string | null>(null);

    const services = computed(() =>
      [...content.value.services].sort((a, b) => a.order - b.order),
    );

    const featuredServices = computed(() =>
      services.value.filter((service) => service.featured),
    );

    async function loadPublicContent(): Promise<void> {
      if (isStaticDemo) return;

      isLoading.value = true;
      lastError.value = null;

      try {
        const response = await fetch(apiUrl("/api/content"), {
          headers: { accept: "application/json" },
        });
        if (!response.ok) return;
        content.value = await response.json();
      } catch {
        // Static defaults keep the public site fully usable without the API.
      } finally {
        isLoading.value = false;
      }
    }

    function beginDraft(): void {
      draft.value = structuredClone(content.value);
    }

    function discardDraft(): void {
      draft.value = null;
    }

    function addService(): void {
      if (!draft.value) beginDraft();
      const servicesDraft = draft.value?.services;
      if (!servicesDraft) return;

      const order = Math.max(0, ...servicesDraft.map((item) => item.order)) + 10;
      servicesDraft.push({
        id: crypto.randomUUID(),
        title: "Новая услуга",
        category: "Приём",
        summary: "Добавьте краткое и понятное описание услуги.",
        price: "Стоимость уточняйте",
        featured: false,
        order,
      });
    }

    function removeService(id: string): void {
      if (!draft.value) return;
      draft.value.services = draft.value.services.filter((service) => service.id !== id);
    }

    function updateService(id: string, patch: Partial<Service>): void {
      const service = draft.value?.services.find((item) => item.id === id);
      if (service) Object.assign(service, patch);
    }

    function applySavedContent(saved: SiteContent): void {
      content.value = saved;
      draft.value = null;
    }

    return {
      content,
      draft,
      isLoading,
      lastError,
      services,
      featuredServices,
      loadPublicContent,
      beginDraft,
      discardDraft,
      addService,
      removeService,
      updateService,
      applySavedContent,
    };
  },
  {
    persist: {
      pick: ["draft"],
    },
  },
);
