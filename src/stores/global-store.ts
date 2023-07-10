import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"

export const useGlobalStore = defineStore("global", {
  state: () => ({
    dyslexicMode: useStorage("dyslexicMode", false),
    isSidebarMinimized: useStorage("isSidebarMinimized", false),
  }),

  getters: {
    isDyslexicMode(state) {
      return state.dyslexicMode
    },
  },

  actions: {
    setDyslexicMode(mode: boolean) {
      this.dyslexicMode = mode
    },
  },
})
