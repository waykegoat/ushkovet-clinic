import { createPinia, setActivePinia } from "pinia";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";

import ServiceCard from "@/components/ServiceCard.vue";
import type { Service } from "@/content/defaultContent";

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

  it("links to the clinic phone", () => {
    const wrapper = mount(ServiceCard, {
      props: { service },
    });

    expect(wrapper.get("a.icon-button").attributes("href")).toBe("tel:+79991385461");
  });
});
