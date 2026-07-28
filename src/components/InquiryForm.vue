<script setup lang="ts">
import { CheckCircle2, LoaderCircle } from "@lucide/vue";
import { reactive, ref } from "vue";

import { apiUrl, isStaticDemo } from "@/lib/api";

interface InquiryPayload {
  name: string;
  phone: string;
  pet: string;
  message: string;
}

const emit = defineEmits<{
  success: [];
}>();

const form = reactive<InquiryPayload>({
  name: "",
  phone: "",
  pet: "",
  message: "",
});

const isSubmitting = ref(false);
const isSubmitted = ref(false);
const errorMessage = ref("");

async function submit(): Promise<void> {
  errorMessage.value = "";

  if (form.name.trim().length < 2 || form.phone.replace(/\D/g, "").length < 10) {
    errorMessage.value = "Проверьте имя и номер телефона.";
    return;
  }

  if (isStaticDemo) {
    errorMessage.value =
      "Онлайн-запись подключается перед запуском. Пожалуйста, позвоните в клинику.";
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await fetch(apiUrl("/api/inquiries"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      throw new Error("Не удалось отправить заявку");
    }

    isSubmitted.value = true;
    emit("success");
  } catch {
    errorMessage.value = "Сейчас форма недоступна. Пожалуйста, позвоните в клинику.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div v-if="isSubmitted" class="form-success" role="status">
    <CheckCircle2 :size="34" />
    <div>
      <h3>Заявка отправлена</h3>
      <p>Администратор свяжется с вами, чтобы подтвердить время приёма.</p>
    </div>
  </div>

  <form v-else class="inquiry-form" @submit.prevent="submit">
    <div class="form-row">
      <label>
        <span>Ваше имя</span>
        <input
          v-model.trim="form.name"
          name="name"
          autocomplete="name"
          placeholder="Например, Анна"
          required
        />
      </label>
      <label>
        <span>Телефон</span>
        <input
          v-model.trim="form.phone"
          name="phone"
          type="tel"
          autocomplete="tel"
          inputmode="tel"
          placeholder="+7 900 000-00-00"
          required
        />
      </label>
    </div>
    <label>
      <span>Кто ваш питомец?</span>
      <input
        v-model.trim="form.pet"
        name="pet"
        placeholder="Кот, собака или другой питомец"
      />
    </label>
    <label>
      <span>Коротко опишите ситуацию</span>
      <textarea
        v-model.trim="form.message"
        name="message"
        rows="3"
        placeholder="Что беспокоит и когда появились симптомы?"
      />
    </label>
    <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
    <button
      class="button button-primary button-wide"
      type="submit"
      :disabled="isSubmitting"
    >
      <LoaderCircle v-if="isSubmitting" class="spin" :size="18" />
      {{ isSubmitting ? "Отправляем…" : "Отправить заявку" }}
    </button>
    <small class="form-privacy">
      Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
    </small>
  </form>
</template>
