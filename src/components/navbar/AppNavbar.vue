<template>
  <va-navbar>
    <template #left>
      <va-navbar-item class="left">
        <va-icon-menu-collapsed
          :class="{ 'x-flip': isSidebarMinimized }"
          :color="colors.primary"
          @click="isSidebarMinimized = !isSidebarMinimized"
        />
        <router-link to="/">
          <va-image
            :src="atlasLogo"
            fit="scale-down"
            style="width: 50px; height: 50px"
          />
        </router-link>
      </va-navbar-item>
    </template>
  </va-navbar>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useGlobalStore } from "@/stores/global-store"
import { useColors } from "vuestic-ui"
import VaIconMenuCollapsed from "../icons/VaIconMenuCollapsed.vue"
import AtlasLogo from "@/components/logos/atlas_logo.png"

withDefaults(
  defineProps<{
    isMobile?: boolean
  }>(),
  {
    isMobile: false,
  }
)

const atlasLogo = AtlasLogo

const GlobalStore = useGlobalStore()
const { isSidebarMinimized } = storeToRefs(GlobalStore)

const { getColors } = useColors()
const colors = computed(() => getColors())
</script>

<style lang="scss" scoped>
.va-navbar {
  flex-direction: row;
  box-shadow: var(--va-box-shadow);
  z-index: 2;

  @media screen and (max-width: 950px) {
    .left {
      width: 100%;
    }

    .app-navbar__actions {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}

.left {
  display: flex;
  align-items: center;

  & > * {
    margin-right: 1.5rem;
  }

  & > *:last-child {
    margin-right: 0;
  }
}

.x-flip {
  transform: scaleX(-100%);
}

.app-navbar-center {
  display: flex;
  align-items: center;

  @media screen and (max-width: 1200px) {
    &__github-button {
      display: none;
    }
  }

  @media screen and (max-width: 950px) {
    &__text {
      display: none;
    }
  }
}
</style>
