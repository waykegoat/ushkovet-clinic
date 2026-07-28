import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  const isMenuOpen = ref(false);
  const isAppointmentOpen = ref(false);

  function toggleMenu(): void {
    isMenuOpen.value = !isMenuOpen.value;
  }

  function closeMenu(): void {
    isMenuOpen.value = false;
  }

  function openAppointment(): void {
    isAppointmentOpen.value = true;
    closeMenu();
  }

  function closeAppointment(): void {
    isAppointmentOpen.value = false;
  }

  return {
    isMenuOpen,
    isAppointmentOpen,
    toggleMenu,
    closeMenu,
    openAppointment,
    closeAppointment,
  };
});
