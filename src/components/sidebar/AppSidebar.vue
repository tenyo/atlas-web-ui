<template>
  <va-sidebar
    :width="width"
    :minimized="minimized"
    :minimized-width="minimizedWidth"
    :animated="animated"
  >
    <div v-if="minimized">
      <MenuMinimized :items="items" />
    </div>
    <div v-else>
      <MenuAccordion :items="items" />
    </div>
  </va-sidebar>
</template>

<script setup lang="ts">
import { ref } from "vue"
import NavigationRoutes from "./NavigationRoutes"
import MenuAccordion from "./menu/MenuAccordion.vue"
import MenuMinimized from "./menu/MenuMinimized.vue"

withDefaults(
  defineProps<{
    width?: string
    color?: string
    animated?: boolean
    minimized?: boolean
    minimizedWidth?: string
  }>(),
  {
    width: "16rem",
    color: "secondary",
    animated: true,
    minimized: true,
    minimizedWidth: undefined,
  }
)

const items = ref(NavigationRoutes.routes)
</script>

<style lang="scss">
.va-sidebar {
  &__menu {
    padding: 2rem 0;
  }

  &-item {
    &__icon {
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
