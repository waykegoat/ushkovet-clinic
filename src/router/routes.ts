import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/HomePage.vue"),
  },
  {
    path: "/services",
    name: "services",
    component: () => import("@/pages/ServicesPage.vue"),
  },
  {
    path: "/contacts",
    name: "contacts",
    component: () => import("@/pages/ContactsPage.vue"),
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("@/pages/AdminPage.vue"),
    meta: { admin: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];
