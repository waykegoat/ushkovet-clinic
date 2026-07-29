<script setup lang="ts">
import { ArrowUpRight, Clock3, MapPin, Phone } from "@lucide/vue";
import { RouterLink } from "vue-router";

import { useContentStore } from "@/stores/content";

const contentStore = useContentStore();
const logoUrl = `${import.meta.env.BASE_URL}logo.svg`;
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <RouterLink class="brand brand-inverse" to="/">
          <span class="brand-mark" aria-hidden="true">
            <img :src="logoUrl" alt="" />
          </span>
          <span>
            <strong>УшкоВет</strong>
            <small>ветеринарная клиника</small>
          </span>
        </RouterLink>
        <p>Бережная помощь домашним животным и честный разговор с их владельцами.</p>
        <a
          class="social-link"
          href="https://vk.ru/ushkovet"
          target="_blank"
          rel="noopener noreferrer"
        >
          Сообщество ВКонтакте
          <ArrowUpRight :size="16" />
        </a>
      </div>

      <div>
        <p class="footer-label">Навигация</p>
        <div class="footer-links">
          <RouterLink to="/">Главная</RouterLink>
          <RouterLink to="/services">Услуги</RouterLink>
          <RouterLink to="/contacts">Контакты</RouterLink>
        </div>
      </div>

      <div>
        <p class="footer-label">Клиника</p>
        <ul class="footer-contacts">
          <li>
            <MapPin :size="18" />
            <span>{{ contentStore.content.settings.address }}</span>
          </li>
          <li>
            <Clock3 :size="18" />
            <span>{{ contentStore.content.settings.hours }}</span>
          </li>
          <li>
            <Phone :size="18" />
            <a :href="`tel:${contentStore.content.settings.phoneHref}`">
              {{ contentStore.content.settings.phone }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="container footer-bottom">
      <span>© 2026 Ветеринарная клиника «УшкоВет»</span>
      <span>Имеются противопоказания. Необходима консультация специалиста.</span>
    </div>
  </footer>
</template>
