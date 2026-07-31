<script setup lang="ts">
import { ArrowUpRight, Clock3, MapPin, Phone } from "@lucide/vue";

import MapSection from "@/components/MapSection.vue";
import { useSeo } from "@/composables/useSeo";
import { useContentStore } from "@/stores/content";

const contentStore = useContentStore();

useSeo({
  title: "Контакты ветеринарной клиники «УшкоВет»",
  description:
    "Адрес: Нижний Новгород, Верхне-Печёрская улица, 14. Телефон +7 (999) 138-54-61. Работаем ежедневно с 10:00 до 20:00 по записи.",
  path: "/contacts",
});
</script>

<template>
  <div>
    <section class="page-hero contacts-hero">
      <div class="container page-hero-grid">
        <div>
          <p class="eyebrow">Контакты</p>
          <h1>Запишитесь удобным способом</h1>
        </div>
        <p>
          Позвоните в клинику, чтобы уточнить время приёма. Если состояние питомца резко
          ухудшилось, обязательно сообщите об этом администратору.
        </p>
      </div>
    </section>

    <section class="section contacts-overview">
      <div class="container contacts-cards">
        <a class="contact-card" :href="`tel:${contentStore.content.settings.phoneHref}`">
          <Phone :size="24" />
          <span>Телефон</span>
          <strong>{{ contentStore.content.settings.phone }}</strong>
          <ArrowUpRight class="contact-arrow" :size="20" />
        </a>
        <div class="contact-card">
          <MapPin :size="24" />
          <span>Адрес</span>
          <strong>{{ contentStore.content.settings.address }}</strong>
        </div>
        <div class="contact-card">
          <Clock3 :size="24" />
          <span>Режим работы</span>
          <strong>{{ contentStore.content.settings.hours }}</strong>
        </div>
      </div>
    </section>

    <MapSection />

    <section class="section clinic-photo-section">
      <div class="container clinic-photo-grid">
        <img
          src="/images/clinic-hero.webp"
          alt="Вход в ветеринарную клинику УшкоВет на Верхне-Печёрской улице"
          width="672"
          height="378"
          loading="lazy"
        />
        <div>
          <p class="eyebrow">Ориентир</p>
          <h2>Отдельный вход с заметной вывеской</h2>
          <p>
            Клиника расположена на первом этаже дома № 14. Перед поездкой рекомендуем
            позвонить — приём ведётся по записи.
          </p>
          <a
            class="text-link"
            href="https://yandex.ru/maps/?ll=44.069500%2C56.286000&mode=routes&rtext=~56.286000%2C44.069500&rtt=auto&z=17"
            target="_blank"
            rel="noopener noreferrer"
          >
            Посмотреть маршрут
            <ArrowUpRight :size="18" />
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
