import { createPinia, setActivePinia } from "pinia";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";

import ServiceCard from "@/components/ServiceCard.vue";
import type { Service } from "@/content/defaultContent";
import { useUiStore } from "@/stores/ui";

const service: Service = {
  id: "therapy",
  title: "Терапия",
  category: "Приём",
  summary: "Осмотр питомца и понятный план дальнейших действий.",
  price: "от 1 000 ₽",
  featured: true,
  order: 10,
};

describe("ServiceCard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders service details", () => {
    const wrapper = mount(ServiceCard, {
      props: { service, index: 1 },
    });

    expect(wrapper.get("h3").text()).toBe("Терапия");
    expect(wrapper.text()).toContain("от 1 000 ₽");
    expect(wrapper.text()).toContain("02");
  });

  it("opens the appointment dialog", async () => {
    const wrapper = mount(ServiceCard, {
      props: { service },
    });
    const uiStore = useUiStore();

    await wrapper.get("button").trigger("click");

    expect(uiStore.isAppointmentOpen).toBe(true);
  });
});
