<script setup lang="ts">
import { ArrowRight, Check, Search } from "@lucide/vue";
import { computed, ref } from "vue";

import ServiceCard from "@/components/ServiceCard.vue";
import { useSeo } from "@/composables/useSeo";
import { useContentStore } from "@/stores/content";

const contentStore = useContentStore();
const activeCategory = ref("Все");
const search = ref("");

useSeo({
  title: "Ветеринарные услуги и цены — клиника «УшкоВет»",
  description:
    "Терапия, диагностика, анализы, хирургия, вакцинация, стоматология, дерматология и стационар для животных в Нижнем Новгороде.",
  path: "/services",
});

const categories = computed(() => [
  "Все",
  ...new Set(contentStore.services.map((service) => service.category)),
]);

const filteredServices = computed(() => {
  const query = search.value.trim().toLocaleLowerCase("ru");

  return contentStore.services.filter((service) => {
    const matchesCategory =
      activeCategory.value === "Все" || service.category === activeCategory.value;
    const matchesQuery =
      !query ||
      `${service.title} ${service.summary} ${service.category}`
        .toLocaleLowerCase("ru")
        .includes(query);

    return matchesCategory && matchesQuery;
  });
});
</script>

<template>
  <div>
    <section class="page-hero">
      <div class="container page-hero-grid">
        <div>
          <p class="eyebrow">Услуги клиники</p>
          <h1>Помощь на каждом этапе жизни питомца</h1>
        </div>
        <p>
          От плановой вакцинации до диагностики и хирургического лечения. Окончательный
          объём помощи и стоимость врач определяет после осмотра.
        </p>
      </div>
    </section>

    <section class="section services-catalog">
      <div class="container">
        <div class="catalog-toolbar">
          <label class="search-field">
            <Search :size="19" />
            <span class="sr-only">Поиск по услугам</span>
            <input v-model="search" type="search" placeholder="Найти услугу" />
          </label>

          <div class="category-tabs" role="tablist" aria-label="Категории услуг">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              :class="{ active: activeCategory === category }"
              role="tab"
              :aria-selected="activeCategory === category"
              @click="activeCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div v-if="filteredServices.length" class="service-grid">
          <ServiceCard
            v-for="(service, index) in filteredServices"
            :key="service.id"
            :service="service"
            :index="index"
          />
        </div>
        <div v-else class="empty-state">
          <h2>Ничего не найдено</h2>
          <p>Попробуйте изменить запрос или выбрать другую категорию.</p>
        </div>
      </div>
    </section>

    <section class="section preparation-section">
      <div class="container preparation-grid">
        <div>
          <p class="eyebrow">Перед визитом</p>
          <h2>Как подготовиться к приёму</h2>
          <p class="section-lead">
            Несколько простых действий помогут врачу быстрее собрать полную картину
            состояния питомца.
          </p>
        </div>
        <ol class="preparation-list">
          <li>
            <span><Check :size="18" /></span>
            <div>
              <strong>Запишите симптомы</strong>
              <p>Когда появились, как менялись и что уже предпринимали.</p>
            </div>
          </li>
          <li>
            <span><Check :size="18" /></span>
            <div>
              <strong>Возьмите документы</strong>
              <p>Ветпаспорт, прошлые назначения и результаты исследований.</p>
            </div>
          </li>
          <li>
            <span><Check :size="18" /></span>
            <div>
              <strong>Уточните подготовку</strong>
              <p>Для некоторых анализов и процедур может потребоваться голодная диета.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="section compact-cta">
      <div class="container compact-cta-inner">
        <div>
          <h2>Не уверены, какой приём нужен?</h2>
          <p>Опишите симптомы администратору — мы подскажем, с чего начать.</p>
        </div>
        <a
          class="button button-primary button-large"
          :href="`tel:${contentStore.content.settings.phoneHref}`"
        >
          Позвонить в клинику
          <ArrowRight :size="19" />
        </a>
      </div>
    </section>
  </div>
</template>
