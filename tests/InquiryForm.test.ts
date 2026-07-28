import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import InquiryForm from "@/components/InquiryForm.vue";

describe("InquiryForm", () => {
  it("validates required contact details", async () => {
    const wrapper = mount(InquiryForm);

    await wrapper.get("form").trigger("submit");

    expect(wrapper.get('[role="alert"]').text()).toContain("Проверьте");
  });

  it("submits a valid inquiry", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const wrapper = mount(InquiryForm);
    await wrapper.get('input[name="name"]').setValue("Анна");
    await wrapper.get('input[name="phone"]').setValue("+7 900 123-45-67");
    await wrapper.get('input[name="pet"]').setValue("Кот");
    await wrapper.get("form").trigger("submit");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(wrapper.get('[role="status"]').text()).toContain("Заявка отправлена");

    vi.unstubAllGlobals();
  });
});
