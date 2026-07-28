<script setup lang="ts">
import { ArrowUpRight, Clock3, MapPin, Phone } from "@lucide/vue";

import { useContentStore } from "@/stores/content";

const contentStore = useContentStore();
</script>

<template>
  <section class="map-section" aria-labelledby="map-title">
    <div class="container map-grid">
      <div class="map-copy">
        <p class="eyebrow">Как нас найти</p>
        <h2 id="map-title">В Верхних Печёрах, рядом с домом</h2>
        <p class="section-lead">
          Вход с улицы хорошо заметен. Если питомцу трудно передвигаться, сообщите об этом
          администратору при записи.
        </p>

        <ul class="contact-list">
          <li>
            <MapPin :size="21" />
            <div>
              <span>Адрес</span>
              <strong>{{ contentStore.content.settings.address }}</strong>
            </div>
          </li>
          <li>
            <Clock3 :size="21" />
            <div>
              <span>Режим работы</span>
              <strong>{{ contentStore.content.settings.hours }}</strong>
            </div>
          </li>
          <li>
            <Phone :size="21" />
            <div>
              <span>Телефон</span>
              <a :href="`tel:${contentStore.content.settings.phoneHref}`">
                {{ contentStore.content.settings.phone }}
              </a>
            </div>
          </li>
        </ul>

        <a
          class="button button-secondary"
          href="https://yandex.ru/maps/?ll=44.069500%2C56.286000&mode=search&text=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9%20%D0%9D%D0%BE%D0%B2%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%2C%20%D0%92%D0%B5%D1%80%D1%85%D0%BD%D0%B5-%D0%9F%D0%B5%D1%87%D1%91%D1%80%D1%81%D0%BA%D0%B0%D1%8F%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%2C%2014&z=17"
          target="_blank"
          rel="noopener noreferrer"
        >
          Открыть в Яндекс Картах
          <ArrowUpRight :size="18" />
        </a>
      </div>

      <div class="map-frame">
        <iframe
          title="УшкоВет на карте Нижнего Новгорода"
          src="https://yandex.ru/map-widget/v1/?ll=44.069500%2C56.286000&mode=search&text=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9%20%D0%9D%D0%BE%D0%B2%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%2C%20%D0%92%D0%B5%D1%80%D1%85%D0%BD%D0%B5-%D0%9F%D0%B5%D1%87%D1%91%D1%80%D1%81%D0%BA%D0%B0%D1%8F%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%2C%2014&z=17"
          loading="lazy"
          allowfullscreen
        />
      </div>
    </div>
  </section>
</template>
