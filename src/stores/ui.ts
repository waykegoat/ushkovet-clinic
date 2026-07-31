import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  const isMenuOpen = ref(false);

  function toggleMenu(): void {
    isMenuOpen.value = !isMenuOpen.value;
  }

  function closeMenu(): void {
    isMenuOpen.value = false;
  }

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
  };
});
