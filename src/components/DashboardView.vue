<template>
  <div id="dashboard-view">
    <div class="grid grid-cols-12 gap-6">
      <va-card
        v-for="(argo, i) in argoEnvironments"
        :key="i"
        :bordered="false"
        class="col-span-12 xl:col-span-6 xxl:col-span-4"
      >
        <va-card-title>{{ argo.name }} </va-card-title>
        <va-card-content>
          <div class="mb-2">
            <va-icon name="fa4-external-link" class="mr-2" />
            <a :href="argo.argoURL" target="_blank">
              {{ argo.argoURL }}
            </a>
          </div>
          <div>
            <va-icon name="fa-brands fa-github" class="mr-2" />
            <a :href="argo.repoURL + argo.repoPath" target="_blank">
              {{ argo.repoURL }}
            </a>
          </div>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script setup lang="ts">
const argoEnvironments = [
  {
    name: "Metal",
    argoURL: "https://argo.delivery.metalkube.net",
    repoURL: "https://github.com/equinixmetal/delivery-infrastructure",
    repoPath: "/tree/main/atlas",
  },
  {
    name: "MetalCI",
    argoURL: "https://argo.delivery.metalkube.builders",
    repoURL: "https://github.com/equinixmetal/metalci-atlas",
    repoPath: "/tree/main/atlas",
  },
  {
    name: "InfoSec",
    argoURL: "https://argo.delivery.latticepoint.net",
    repoURL: "https://github.com/equinix-infosec/infosec-atlas",
    repoPath: "/tree/main/atlas",
  },
]
</script>

<style lang="scss">
.dashboard-view {
  .va-card {
    margin-bottom: 0 !important;
    &__title {
      display: flex;
      justify-content: space-between;
    }
  }
}

.hoverable {
  &:hover {
    background-color: #f6f6f6;
  }
}
</style>
