<script setup lang="ts">
import { X } from "@lucide/vue";
import { storeToRefs } from "pinia";

import InquiryForm from "@/components/InquiryForm.vue";
import { useUiStore } from "@/stores/ui";

const uiStore = useUiStore();
const { isAppointmentOpen } = storeToRefs(uiStore);
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isAppointmentOpen"
        class="dialog-backdrop"
        role="presentation"
        @mousedown.self="uiStore.closeAppointment"
      >
        <section
          class="appointment-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="appointment-title"
        >
          <button
            class="dialog-close"
            type="button"
            aria-label="Закрыть окно"
            @click="uiStore.closeAppointment"
          >
            <X :size="22" />
          </button>
          <p class="eyebrow">Запись на приём</p>
          <h2 id="appointment-title">Расскажите, как с вами связаться</h2>
          <p class="dialog-lead">Администратор уточнит детали и подберёт удобное время.</p>
          <InquiryForm />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
