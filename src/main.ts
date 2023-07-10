import { createApp, provide, h } from "vue"
import router from "./router"
import stores from "./stores"

import { DefaultApolloClient } from "@vue/apollo-composable"

import { createVuestic } from "vuestic-ui"
import vuesticGlobalConfig from "./services/vuestic-ui/global-config"

import { apolloClient } from "@/stores/graphql-store"

import App from "./App.vue"

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },

  render: () => h(App),
})

app.use(router)
app.use(stores)
app.use(createVuestic({ config: vuesticGlobalConfig }))

app.mount("#app")
