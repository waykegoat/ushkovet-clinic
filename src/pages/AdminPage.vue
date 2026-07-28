<script setup lang="ts">
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  LoaderCircle,
  LogIn,
  LogOut,
  Plus,
  Save,
  Settings,
  Trash2,
} from "@lucide/vue";
import { storeToRefs } from "pinia";
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";

import { useSeo } from "@/composables/useSeo";
import type { SiteContent } from "@/content/defaultContent";
import { apiUrl } from "@/lib/api";
import { useContentStore } from "@/stores/content";

interface AdminSession {
  authenticated: boolean;
  configured: boolean;
  email?: string;
}

interface Inquiry {
  id: number;
  name: string;
  phone: string;
  pet: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

const contentStore = useContentStore();
const { draft } = storeToRefs(contentStore);
const session = ref<AdminSession | null>(null);
const inquiries = ref<Inquiry[]>([]);
const activeSection = ref<"content" | "requests">("content");
const isLoading = ref(true);
const isSaving = ref(false);
const isAuthenticating = ref(false);
const notification = ref("");
const errorMessage = ref("");
const isDevelopment = import.meta.env.DEV;
const credentials = reactive({
  email: "",
  password: "",
});

useSeo({
  title: "Управление сайтом — УшкоВет",
  description: "Панель управления сайтом ветеринарной клиники.",
  path: "/admin",
  noindex: true,
});

const adminHeaders = computed<Record<string, string>>(() =>
  isDevelopment ? { "x-local-admin-email": "local@ushkovet.test" } : {},
);

const newInquiryCount = computed(
  () => inquiries.value.filter((inquiry) => inquiry.status === "new").length,
);

function showNotification(message: string): void {
  notification.value = message;
  window.setTimeout(() => {
    notification.value = "";
  }, 3000);
}

async function api<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(url), {
    ...init,
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      ...adminHeaders.value,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "Ошибка запроса");
  }

  return response.json();
}

async function login(): Promise<void> {
  isAuthenticating.value = true;
  errorMessage.value = "";

  try {
    session.value = await api<AdminSession>("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(credentials),
    });
    credentials.password = "";
    await loadAdmin();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Не удалось выполнить вход";
  } finally {
    isAuthenticating.value = false;
  }
}

async function logout(): Promise<void> {
  try {
    await api<{ ok: true }>("/api/admin/logout", { method: "POST" });
  } finally {
    session.value = { authenticated: false, configured: true };
    contentStore.discardDraft();
    inquiries.value = [];
  }
}

async function loadAdmin(): Promise<void> {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    session.value = await api<AdminSession>("/api/admin/session");
    if (!session.value.authenticated) return;

    const [content, inquiryList] = await Promise.all([
      api<SiteContent>("/api/admin/content"),
      api<Inquiry[]>("/api/admin/inquiries"),
    ]);

    contentStore.applySavedContent(content);
    contentStore.beginDraft();
    inquiries.value = inquiryList;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Не удалось загрузить админку";
  } finally {
    isLoading.value = false;
  }
}

async function saveContent(): Promise<void> {
  if (!draft.value) return;
  isSaving.value = true;
  errorMessage.value = "";

  try {
    const saved = await api<SiteContent>("/api/admin/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft.value),
    });
    contentStore.applySavedContent(saved);
    contentStore.beginDraft();
    showNotification("Изменения опубликованы");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Не удалось сохранить изменения";
  } finally {
    isSaving.value = false;
  }
}

async function updateInquiry(id: number, status: Inquiry["status"]): Promise<void> {
  try {
    const updated = await api<Inquiry>(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    inquiries.value = inquiries.value.map((item) => (item.id === id ? updated : item));
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Не удалось обновить заявку";
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

onMounted(() => {
  void loadAdmin();
});
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <RouterLink class="admin-brand" to="/">
        <span>УВ</span>
        <div>
          <strong>УшкоВет</strong>
          <small>управление сайтом</small>
        </div>
      </RouterLink>

      <nav v-if="session?.authenticated" class="admin-nav">
        <button
          :class="{ active: activeSection === 'content' }"
          @click="activeSection = 'content'"
        >
          <LayoutDashboard :size="19" />
          Контент
        </button>
        <button
          :class="{ active: activeSection === 'requests' }"
          @click="activeSection = 'requests'"
        >
          <ClipboardList :size="19" />
          Заявки
          <span v-if="newInquiryCount">{{ newInquiryCount }}</span>
        </button>
      </nav>

      <div class="admin-sidebar-bottom">
        <RouterLink to="/">
          <ArrowLeft :size="18" />
          Вернуться на сайт
        </RouterLink>
        <button
          v-if="session?.authenticated && !isDevelopment"
          type="button"
          @click="logout"
        >
          <LogOut :size="18" />
          Выйти
        </button>
      </div>
    </aside>

    <div class="admin-content">
      <div v-if="isLoading" class="admin-state">
        <LoaderCircle class="spin" :size="32" />
        <p>Загружаем панель управления…</p>
      </div>

      <div v-else-if="!session?.configured" class="admin-state admin-auth-card">
        <Settings :size="36" />
        <h1>Нужно завершить настройку доступа</h1>
        <p>
          Добавьте список владельцев, хеш пароля и секрет сессии в защищённые переменные
          backend. Пароль в исходном коде не хранится.
        </p>
        <RouterLink class="button button-secondary" to="/">Вернуться на сайт</RouterLink>
      </div>

      <div v-else-if="!session?.authenticated" class="admin-state admin-auth-card">
        <LayoutDashboard :size="36" />
        <h1>Вход в панель управления</h1>
        <p>Доступ разрешён только владельцам сайта из списка администраторов.</p>
        <form class="admin-login-form" @submit.prevent="login">
          <label class="admin-field">
            <span>Email</span>
            <input
              v-model.trim="credentials.email"
              type="email"
              autocomplete="username"
              required
            />
          </label>
          <label class="admin-field">
            <span>Пароль</span>
            <input
              v-model="credentials.password"
              type="password"
              autocomplete="current-password"
              minlength="8"
              required
            />
          </label>
          <button class="button button-primary" type="submit" :disabled="isAuthenticating">
            <LoaderCircle v-if="isAuthenticating" class="spin" :size="18" />
            <LogIn v-else :size="18" />
            {{ isAuthenticating ? "Проверяем…" : "Войти" }}
          </button>
        </form>
      </div>

      <template v-else>
        <header class="admin-topbar">
          <div>
            <p>Панель управления</p>
            <h1>{{ activeSection === "content" ? "Контент сайта" : "Заявки на приём" }}</h1>
          </div>
          <div class="admin-user">
            <span>{{ session.email?.slice(0, 1).toUpperCase() }}</span>
            <div>
              <strong>{{ session.email }}</strong>
              <small>Администратор</small>
            </div>
          </div>
        </header>

        <p v-if="errorMessage" class="admin-error" role="alert">{{ errorMessage }}</p>

        <section v-if="activeSection === 'content' && draft" class="admin-panel">
          <div class="admin-panel-heading">
            <div>
              <h2>Основная информация</h2>
              <p>Контакты и главный экран обновятся сразу после публикации.</p>
            </div>
            <button class="button button-primary" :disabled="isSaving" @click="saveContent">
              <LoaderCircle v-if="isSaving" class="spin" :size="18" />
              <Save v-else :size="18" />
              {{ isSaving ? "Публикуем…" : "Опубликовать" }}
            </button>
          </div>

          <div class="admin-form-grid">
            <label class="admin-field admin-field-wide">
              <span>Заголовок первого экрана</span>
              <input v-model="draft.settings.heroTitle" />
            </label>
            <label class="admin-field admin-field-wide">
              <span>Подзаголовок</span>
              <textarea v-model="draft.settings.heroText" rows="3" />
            </label>
            <label class="admin-field">
              <span>Телефон</span>
              <input v-model="draft.settings.phone" />
            </label>
            <label class="admin-field">
              <span>Телефон для ссылки</span>
              <input v-model="draft.settings.phoneHref" />
            </label>
            <label class="admin-field admin-field-wide">
              <span>Адрес</span>
              <input v-model="draft.settings.address" />
            </label>
            <label class="admin-field">
              <span>Режим работы</span>
              <input v-model="draft.settings.hours" />
            </label>
            <label class="admin-field">
              <span>Рейтинг</span>
              <input v-model="draft.settings.rating" />
            </label>
          </div>
        </section>

        <section v-if="activeSection === 'content' && draft" class="admin-panel">
          <div class="admin-panel-heading">
            <div>
              <h2>Услуги</h2>
              <p>{{ draft.services.length }} позиций в каталоге</p>
            </div>
            <button class="button button-secondary" @click="contentStore.addService">
              <Plus :size="18" />
              Добавить услугу
            </button>
          </div>

          <div class="admin-service-list">
            <article v-for="service in draft.services" :key="service.id">
              <div class="admin-service-top">
                <label class="admin-field">
                  <span>Название</span>
                  <input v-model="service.title" />
                </label>
                <label class="admin-field">
                  <span>Категория</span>
                  <input v-model="service.category" />
                </label>
                <button
                  class="admin-delete"
                  type="button"
                  :aria-label="`Удалить услугу ${service.title}`"
                  @click="contentStore.removeService(service.id)"
                >
                  <Trash2 :size="19" />
                </button>
              </div>
              <label class="admin-field">
                <span>Описание</span>
                <textarea v-model="service.summary" rows="2" />
              </label>
              <div class="admin-service-bottom">
                <label class="admin-field">
                  <span>Стоимость</span>
                  <input v-model="service.price" />
                </label>
                <label class="admin-checkbox">
                  <input v-model="service.featured" type="checkbox" />
                  <span>Показывать на главной</span>
                </label>
              </div>
            </article>
          </div>
        </section>

        <section v-if="activeSection === 'requests'" class="admin-panel">
          <div class="admin-panel-heading">
            <div>
              <h2>Заявки клиентов</h2>
              <p>Контакты из формы записи на сайте.</p>
            </div>
          </div>

          <div v-if="inquiries.length" class="inquiry-table">
            <article v-for="inquiry in inquiries" :key="inquiry.id">
              <div class="inquiry-main">
                <div>
                  <strong>{{ inquiry.name }}</strong>
                  <a :href="`tel:${inquiry.phone}`">{{ inquiry.phone }}</a>
                </div>
                <span>{{ formatDate(inquiry.createdAt) }}</span>
              </div>
              <p v-if="inquiry.pet"><b>Питомец:</b> {{ inquiry.pet }}</p>
              <p v-if="inquiry.message">{{ inquiry.message }}</p>
              <div class="inquiry-actions">
                <select
                  :value="inquiry.status"
                  aria-label="Статус заявки"
                  @change="
                    updateInquiry(
                      inquiry.id,
                      ($event.target as HTMLSelectElement).value as Inquiry['status'],
                    )
                  "
                >
                  <option value="new">Новая</option>
                  <option value="contacted">Связались</option>
                  <option value="closed">Закрыта</option>
                </select>
              </div>
            </article>
          </div>
          <div v-else class="empty-state">
            <ClipboardList :size="32" />
            <h2>Заявок пока нет</h2>
            <p>Новые обращения появятся здесь автоматически.</p>
          </div>
        </section>
      </template>
    </div>

    <Transition name="toast">
      <div v-if="notification" class="admin-toast" role="status">
        <CheckCircle2 :size="20" />
        {{ notification }}
      </div>
    </Transition>
  </div>
</template>
