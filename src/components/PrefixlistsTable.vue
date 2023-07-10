<template>
  <div class="ml-2 mb-4">
    <h4 class="va-h4 mb-3">
      <va-icon name="dns" class="mr-4" />
      IP Prefix Lists
    </h4>
    <p class="mb-4">
      Browse all of the available prefix lists (named ranges) that can be used
      in Atlas.
    </p>

    <va-alert color="info" outline>
      <div class="grid grid-cols-12 items-center">
        <div class="flex col-span-12 xl:col-span-4">
          <span>
            Number of prefix lists:
            <va-chip outline>{{ itemCount }}</va-chip>
          </span>

          <va-checkbox
            v-model="showCollectionsOption"
            label="Show collections"
            class="mx-3"
          />
        </div>

        <div class="flex col-span-12 xl:col-span-4">
          <va-input v-model="filter" label="Filter" clearable />
        </div>
      </div>
    </va-alert>

    <va-data-table
      :items="items"
      :columns="columns"
      :per-page="perPage"
      :current-page="currentPage"
      :filter="filter"
      hoverable
      clickable
      @row:click="handlePrefixlistClick"
      @filtered="updateFiltered"
    >
      <template #cell(name)="{ rowIndex }">
        <router-link
          :to="{
            name: 'prefixlist_details',
            params: { id: items[rowIndex].id },
          }"
        >
          {{ items[rowIndex].name }}
        </router-link>
      </template>

      <template #cell(created_at)="{ rowIndex }">
        <div>
          {{ formatLocalTimeYMD(items[rowIndex].createdAt) }}
        </div>
      </template>

      <template #cell(updated_at)="{ rowIndex }">
        <div>
          {{ formatLocalTimeYMD(items[rowIndex].updatedAt) }}
        </div>
      </template>

      <template #bodyAppend>
        <tr>
          <td colspan="6">
            <div class="table-pagination">
              <va-pagination v-model="currentPage" :pages="pages" />
            </div>
          </td>
        </tr>
      </template>
    </va-data-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useGraphqlStore } from "@/stores/graphql-store"
import router from "@/router"
import { formatLocalTimeYMD } from "@/utils"
import type { DataTableColumnSource } from "vuestic-ui"

const graphql = useGraphqlStore()

const columns: DataTableColumnSource[] = [
  { key: "name", sortable: true },
  { key: "description", sortable: true },
  { key: "collection", sortable: true },
  { key: "created_at", sortable: true },
  { key: "updated_at", sortable: true },
]

const perPage = ref(100)
const currentPage = ref(1)
const filter = ref("")
const showCollectionsOption = ref(false)

const itemCount = computed(() => {
  return (items.value || []).length
})

const items = computed(() => {
  return (graphql.getPrefixlists || [])
    .filter((item) => {
      if (showCollectionsOption.value) {
        return item
      }

      if (item.collection == "") {
        return item
      }
    })
    .sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
})

const filtered = ref(items.value)

const pages = computed(() => {
  const p =
    perPage.value && perPage.value !== 0
      ? Math.ceil(filtered.value.length / perPage.value)
      : filtered.value.length
  return p === 0 ? 1 : p
})

function updateFiltered(event: any) {
  filtered.value = event.items
  currentPage.value = 1
}

function handlePrefixlistClick(event: any) {
  console.debug("handlePrefixlistClick", event.item)
  const id = event.item.id
  router.push({ name: "prefixlist_details", params: { id } })
}

onMounted(() => {
  graphql.queryPrefixlists()
})
</script>
