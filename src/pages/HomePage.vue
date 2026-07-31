<script setup lang="ts">
import {
  ArrowRight,
  BadgeCheck,
  HeartPulse,
  Microscope,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
} from "@lucide/vue";
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useHead } from "@unhead/vue";

import ServiceCard from "@/components/ServiceCard.vue";
import { useSeo } from "@/composables/useSeo";
import { useContentStore } from "@/stores/content";

const contentStore = useContentStore();
const settings = computed(() => contentStore.content.settings);

useSeo({
  title: "Ветеринарная клиника «УшкоВет» в Нижнем Новгороде",
  description:
    "Ветеринарная клиника на Верхне-Печёрской, 14: терапия, диагностика, хирургия, вакцинация, стоматология и стационар. Ежедневно 10:00–20:00.",
  path: "/",
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "VeterinaryCare",
        name: "УшкоВет",
        url: "https://ushkovet.ru",
        telephone: "+79991385461",
        image: "https://ushkovet.ru/images/4.jpg",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Верхне-Печёрская улица, 14",
          addressLocality: "Нижний Новгород",
          addressCountry: "RU",
        },
        openingHours: "Mo-Su 10:00-20:00",
        sameAs: ["https://vk.ru/ushkovet"],
      }),
    },
  ],
});

const trustPoints = [
  {
    icon: Stethoscope,
    title: "Осмотр без спешки",
    text: "Сначала разбираемся в симптомах, затем объясняем варианты действий.",
  },
  {
    icon: Microscope,
    title: "Диагностика по показаниям",
    text: "Назначаем исследования, которые действительно помогают принять решение.",
  },
  {
    icon: ShieldCheck,
    title: "Понятный план лечения",
    text: "Вы знаете, что, зачем и в какой последовательности мы делаем.",
  },
];

const reviews = [
  {
    name: "Анатолий",
    text: "У пса нашли кровепаразитов, оперативно провели диагностику и начали лечение. Особенно понравилось внимательное отношение к животному и чёткие объяснения.",
  },
  {
    name: "Елена",
    text: "Ходим к Александру Сергеевичу не первый раз. Врач подробно расспрашивает, аккуратно осматривает питомца и всегда объясняет, что делать дальше.",
  },
  {
    name: "Ольга",
    text: "Быстро записали и приняли без задержек. Видно, что здесь действительно любят животных — мой кот вёл себя удивительно спокойно.",
  },
];
</script>

<template>
  <div>
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">
            <span class="status-dot" />
            {{ settings.heroEyebrow }}
          </p>
          <h1>{{ settings.heroTitle }}</h1>
          <p class="hero-lead">{{ settings.heroText }}</p>
          <div class="hero-actions">
            <a
              class="button button-primary button-large"
              :href="`tel:${settings.phoneHref}`"
            >
              Позвонить в клинику
              <ArrowRight :size="19" />
            </a>
            <a class="button button-ghost button-large" :href="`tel:${settings.phoneHref}`">
              {{ settings.phone }}
            </a>
          </div>
          <div class="hero-meta">
            <div>
              <strong>{{ settings.hours }}</strong>
              <span>{{ settings.bookingNote }}</span>
            </div>
            <div>
              <strong>{{ settings.address }}</strong>
              <span>Верхние Печёры</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-image-wrap">
            <img
              src="/images/4.jpg"
              alt="Ветеринар клиники УшкоВет бережно держит кошку"
              width="506"
              height="271"
              fetchpriority="high"
            />
          </div>
          <div class="rating-card">
            <div class="rating-stars" aria-label="Рейтинг 4,6 из 5">
              <Star v-for="item in 5" :key="item" :size="16" fill="currentColor" />
            </div>
            <strong>{{ settings.rating }}</strong>
            <span>рейтинг на Яндекс Картах</span>
          </div>
          <div class="care-badge">
            <HeartPulse :size="22" />
            <span>Забота<br />в каждом движении</span>
          </div>
        </div>
      </div>
    </section>

    <section class="trust-strip" aria-label="Принципы работы">
      <div class="container trust-grid">
        <article v-for="point in trustPoints" :key="point.title">
          <component :is="point.icon" :size="25" />
          <div>
            <h2>{{ point.title }}</h2>
            <p>{{ point.text }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section services-preview">
      <div class="container">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Направления помощи</p>
            <h2>От профилактики до сложного лечения</h2>
          </div>
          <RouterLink class="text-link" to="/services">
            Смотреть все услуги
            <ArrowRight :size="18" />
          </RouterLink>
        </div>

        <div class="service-grid">
          <ServiceCard
            v-for="(service, index) in contentStore.featuredServices.slice(0, 6)"
            :key="service.id"
            :service="service"
            :index="index"
          />
        </div>
      </div>
    </section>

    <section class="section about-section">
      <div class="container about-grid">
        <div class="about-visual">
          <img
            src="/images/2.jpg"
            alt="Кот на осмотре в ветеринарной клинике УшкоВет"
            width="506"
            height="271"
            loading="lazy"
          />
          <div class="about-note">
            <Sparkles :size="20" />
            <span>Чистая клиника и спокойная атмосфера</span>
          </div>
        </div>
        <div class="about-copy">
          <p class="eyebrow">Наш подход</p>
          <h2>Лечить профессионально. Относиться по‑человечески.</h2>
          <p class="section-lead">
            Питомец не может описать боль, а владельцу непросто сохранять спокойствие.
            Поэтому мы одинаково внимательно относимся и к медицинской задаче, и к тому, как
            проходит визит.
          </p>
          <ul class="check-list">
            <li>
              <BadgeCheck :size="20" />
              <span>Объясняем диагноз и назначения понятным языком</span>
            </li>
            <li>
              <BadgeCheck :size="20" />
              <span>Учитываем возраст, характер и прошлый опыт питомца</span>
            </li>
            <li>
              <BadgeCheck :size="20" />
              <span>Остаёмся на связи по вопросам восстановления</span>
            </li>
          </ul>
          <RouterLink class="button button-secondary" to="/contacts">
            Познакомиться с клиникой
            <ArrowRight :size="18" />
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="section doctor-section">
      <div class="container doctor-grid">
        <div class="doctor-copy">
          <p class="eyebrow eyebrow-light">Врач клиники</p>
          <h2>Александр Сергеевич Ушаков</h2>
          <p class="doctor-role">Ветеринарный врач, хирург</p>
          <p>
            В отзывах владельцы особенно отмечают спокойное отношение к животным, готовность
            подробно объяснять лечение и поддержку после сложных случаев.
          </p>
          <div class="doctor-quote">
            <Quote :size="24" />
            <span>Сначала нужно услышать владельца и внимательно увидеть пациента.</span>
          </div>
        </div>
        <div class="doctor-photo">
          <img
            src="/images/3.jpg"
            alt="Ветеринарный врач Александр Сергеевич Ушаков"
            width="506"
            height="271"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <section class="section reviews-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Отзывы владельцев</p>
            <h2>Доверие складывается из деталей</h2>
          </div>
          <a
            class="text-link"
            href="https://2gis.ru/n_novgorod/firm/70000001110966891/tab/reviews"
            target="_blank"
            rel="noopener noreferrer"
          >
            Отзывы на Яндекс Картах
            <ArrowRight :size="18" />
          </a>
        </div>
        <div class="reviews-grid">
          <article v-for="review in reviews" :key="review.name" class="review-card">
            <Quote :size="26" />
            <p>{{ review.text }}</p>
            <div>
              <strong>{{ review.name }}</strong>
              <span>владелец питомца</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section cta-section">
      <div class="container cta-card">
        <div>
          <p class="eyebrow eyebrow-light">Мы рядом</p>
          <h2>Есть вопрос о состоянии питомца?</h2>
          <p>Опишите ситуацию — администратор поможет выбрать подходящий формат приёма.</p>
        </div>
        <div class="cta-actions">
          <a class="button button-light button-large" :href="`tel:${settings.phoneHref}`">
            Позвонить в клинику
          </a>
          <a class="cta-phone" :href="`tel:${settings.phoneHref}`">{{ settings.phone }}</a>
        </div>
      </div>
    </section>
  </div>
</template>
