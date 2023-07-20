<template>
  <div class="ml-2 mb-4">
    <div class="va-h4 mb-4">
      Prefix list {{ prefixlist.name }}
      <div class="va-h6">
        {{ prefixlist.description }}
      </div>
    </div>

    <p class="mb-4">There are {{ numPrefixes }} prefixes in this list:</p>

    <va-input
      v-model="textareaContent"
      class="mb-3"
      type="textarea"
      :bordered="true"
      :min-rows="10"
      :max-rows="50"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useGraphqlStore } from "@/stores/graphql-store"

const props = defineProps({
  id: {
    type: String,
    default: "",
    required: true,
  },
})

const graphql = useGraphqlStore()

const prefixlist = computed(() => {
  return graphql.getCurrentPrefixlist
})

const numPrefixes = computed(() => {
  return (prefixlist.value.prefixes || []).length
})

const textareaContent = computed(() => {
  return (prefixlist.value.prefixes || []).join("\n")
})

onMounted(() => {
  graphql.queryPrefixlistByID(props.id)
})
</script>
