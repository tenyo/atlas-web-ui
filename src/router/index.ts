import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"

import AppLayout from "../layouts/AppLayout.vue"

import DashboardView from "../components/DashboardView.vue"
import ConfigBuilder from "../components/ConfigBuilder.vue"
import ConfigValidator from "../components/ConfigValidator.vue"
import PrefixlistsTable from "../components/PrefixlistsTable.vue"
import PrefixlistDetails from "../components/PrefixlistDetails.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: "/:catchAll(.*)",
    redirect: { name: "dashboard" },
  },
  {
    name: "home",
    path: "/",
    component: AppLayout,
    redirect: { name: "dashboard" },
    children: [
      {
        name: "dashboard",
        path: "dashboard",
        component: DashboardView,
      },
      {
        name: "builder",
        path: "builder",
        component: ConfigBuilder,
      },
      {
        name: "validator",
        path: "validator",
        component: ConfigValidator,
      },
      {
        name: "prefixlists",
        path: "prefixlists",
        component: PrefixlistsTable,
      },
      {
        name: "prefixlist_details",
        path: "prefixlists/:id",
        component: PrefixlistDetails,
        props: true,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
