<template>
  <div class="ml-2 mb-4">
    <div class="va-h4 mb-4">
      Prefix list {{ prefixlist.name }}
      <div class="va-h6">
        {{ prefixlist.description }}
      </div>
    </div>

    <va-list>
      <va-list-item v-for="(cidr, index) in prefixlist.prefixes" :key="index">
        {{ cidr }}
      </va-list-item>
    </va-list>
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

onMounted(() => {
  graphql.queryPrefixlistByID(props.id)
})
</script>
