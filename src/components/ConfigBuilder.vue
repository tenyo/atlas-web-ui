<template>
  <div class="ml-2 mb-4">
    <h4 class="va-h4 mb-3">
      <va-icon name="handyman" class="mr-4" />
      Atlas config builder
    </h4>
    <p class="mb-4">
      Easily create an Atlas config for deploying a new app with ArgoCD.
    </p>
  </div>

  <div class="grid grid-cols-1 xxl:grid-cols-2">
    <div class="p-3">
      <va-stepper v-model="step" :steps="steps" controlsHidden vertical>
        <template #step-content-0>
          <div class="grid grid-cols-12 gap-6 ml-4">
            <p class="col-span-full">
              Describe the access and resource requirements for this project.
            </p>

            <va-input
              class="col-span-full"
              v-model="project.name"
              :rules="[validateName]"
              :immediateValidation="false"
              label="Project name"
              messages="The Argo project name (also the namespace in Kubernetes)"
            />

            <va-select
              class="col-span-full"
              v-model="project.ownerLabel"
              :options="ownerLabels"
              :rules="[(v: string) => v.length > 0 || 'Owner is required']"
              label="Owner label"
              messages="The owner label is used to easily identify projects in Kubernetes"
            />

            <va-select
              class="col-span-full"
              v-model="project.adminGroups"
              :options="adminGroups"
              :rules="[(v: []) => v.length > 0 || 'Admin group is required']"
              multiple
              label="Admin group(s)"
              messages="One or more OIDC groups that will have admin access to the Argo project"
            />

            <va-slider
              class="col-span-full xl:col-span-6"
              v-model="project.cpu"
              :min="2"
              :max="20"
              :step="2"
              track-label-visible
              label="CPU limits"
            />

            <va-slider
              class="col-span-full xl:col-span-6"
              v-model="project.memory"
              :min="2"
              :max="32"
              :step="2"
              track-label-visible
              label="Memory limits, GB"
            />

            <va-divider class="col-span-full" />
            <i class="col-span-full"> Advanced settings </i>

            <va-switch
              class="col-span-full"
              v-model="project.skipRBAC"
              label="Skip RBAC restrictions"
              size="small"
            />

            <va-switch
              class="col-span-full"
              v-model="project.skipServiceAccount"
              label="Skip service account"
              size="small"
            />
          </div>
        </template>

        <template #step-content-1>
          <div class="grid grid-cols-12 gap-6 ml-4">
            <p class="col-span-full">
              Tell us about the specific application being deployed.
            </p>

            <va-input
              class="col-span-full"
              v-model="app.name"
              :rules="[validateName]"
              label="Application name"
              messages="The name of the application (could be same as the project name)"
            />

            <va-input
              class="col-span-full"
              v-model="app.repoURL"
              :rules="[validateRepoURL]"
              label="Application repo URL"
              messages="The GitHub URL containing the Helm chart for this application"
            />

            <va-input
              class="col-span-full"
              v-model="app.repoPath"
              label="Application repo path"
              messages="Specific path in the repository (if different from .)"
            />

            <va-input
              class="col-span-full"
              v-model="app.repoRevision"
              label="Application repo branch/revision"
              messages="The GitHub branch to use (if different from main)"
            />

            <va-switch
              class="col-span-full"
              v-model="app.useClusterValuesFile"
              label="Include cluster values file"
              size="small"
            />

            <va-switch
              class="col-span-full"
              v-model="app.useEnvValuesFile"
              label="Include environment values file"
              size="small"
            />
          </div>
        </template>

        <template #step-content-2>
          <div class="grid grid-cols-12 gap-6 ml-4">
            <p class="col-span-12">Where should we deploy this project?</p>

            <va-switch
              class="col-span-full"
              v-model="selectors.useEnvironments"
              label="Select by environment"
              size="small"
            />

            <va-select
              class="col-span-full ml-6 pl-6"
              v-model="selectors.environments"
              :disabled="!selectors.useEnvironments"
              :options="clusterEnvironments"
              :rules="[(v: []) => v && v.length > 0 || 'Cluster environment is required']"
              multiple
              label="Cluster environment(s)"
              messages="Deploy to all clusters in the selected environment(s)"
            />

            <va-switch
              class="col-span-full"
              v-model="selectors.useClusterClasses"
              label="Select by cluster class"
              size="small"
            />

            <va-select
              class="col-span-full ml-6 pl-6"
              v-model="selectors.clusterClasses"
              :disabled="!selectors.useClusterClasses"
              :options="clusterClasses"
              :rules="[(v: []) => v && v.length > 0 || 'Cluster class is required']"
              multiple
              label="Cluster classes"
              messages="Deploy to all clusters in the selected class(es)"
            />

            <va-switch
              class="col-span-full"
              v-model="selectors.useClusterSubClasses"
              label="Select by cluster sub-class"
              size="small"
            />

            <va-input
              class="col-span-full ml-6 pl-6"
              v-model="selectors.clusterSubClasses[0]"
              :disabled="!selectors.useClusterSubClasses"
              :rules="[(v: string) => v && v.length > 0 || 'Cluster subclass cannot be empty']"
              label="Cluster sub-class"
              messages="Deploy to all clusters in the selected sub-class"
            />

            <va-switch
              class="col-span-full"
              v-model="selectors.useClusterTags"
              label="Select by cluster tag"
              size="small"
            />

            <va-select
              class="col-span-full ml-6 pl-6"
              v-model="selectors.clusterTags"
              :disabled="!selectors.useClusterTags"
              :options="clusterTags"
              :rules="[(v: []) => v && v.length > 0 || 'Cluster tag is required']"
              multiple
              label="Cluster tags"
              messages="Deploy to all clusters with the selected tag(s)"
            />

            <va-switch
              class="col-span-full"
              v-model="selectors.useClusters"
              label="Select by cluster name"
              size="small"
            />

            <div
              class="col-span-full ml-6 pl-6"
              v-for="i in [...Array(numSelectorsClusters).keys()]"
              :key="i"
            >
              <va-input
                v-model="selectors.clusters[i]"
                :disabled="!selectors.useClusters"
                label="Cluster name"
                @change="updateNumSelectorsClusters(i)"
              />
            </div>

            <va-switch
              class="col-span-full"
              v-model="selectors.useClustersDeny"
              label="Exclude specific clusters"
              size="small"
            />

            <div
              class="col-span-full ml-6 pl-6"
              v-for="i in [...Array(numSelectorsClustersDeny).keys()]"
              :key="i"
            >
              <va-input
                v-model="selectors.clustersDeny[i]"
                :disabled="!selectors.useClustersDeny"
                label="Cluster name"
                @change="updateNumSelectorsClustersDeny(i)"
              />
            </div>
          </div>
        </template>

        <template #step-content-3>
          <div class="grid grid-cols-12 gap-6 ml-4">
            <p class="col-span-12">
              Restrict inbound network access to this app
            </p>

            <va-switch
              class="col-span-full"
              v-model="ingress.useNamedRanges"
              label="Based on named prefix ranges"
              size="small"
            />

            <va-select
              class="col-span-full ml-6 pl-6"
              v-model="ingress.namedRanges"
              :disabled="!ingress.useNamedRanges"
              :options="namedRanges"
              :rules="[(v: []) => v.length > 0 || 'At least one named range is required']"
              multiple
              label="Named prefix ranges"
              messages="Allow inbound traffic from the selected named range(s)"
            />

            <va-switch
              class="col-span-full"
              v-model="ingress.useIPRanges"
              label="Based on specific IP ranges"
              size="small"
            />

            <div
              class="col-span-full ml-6 pl-6"
              v-for="i in [...Array(numIngressIPRanges).keys()]"
              :key="i"
            >
              <va-input
                v-model="ingress.ipRanges[i]"
                :disabled="!ingress.useIPRanges"
                label="IP prefix (CIDR)"
                @change="updateNumIngressIPRanges(i)"
              />
            </div>

            <va-switch
              class="col-span-full"
              v-model="ingress.useClusters"
              label="Based on specific cluster(s)"
              size="small"
            />

            <div
              class="col-span-full ml-6 pl-6"
              v-for="i in [...Array(numIngressClusters).keys()]"
              :key="i"
            >
              <va-input
                v-model="ingress.clusters[i]"
                :disabled="!ingress.useClusters"
                label="Cluster name"
                @change="updateNumIngressClusters(i)"
              />
            </div>

            <va-switch
              class="col-span-full"
              v-model="ingress.facility"
              label="Allow traffic from each cluster's facility IPs"
              size="small"
            />
          </div>
        </template>

        <template #controls="{ nextStep, prevStep }">
          <div class="grid grid-cols-2 gap-4 mx-auto">
            <div>
              <va-button
                preset="secondary"
                border-color="primary"
                @click="prevStep()"
                :disabled="step === 0"
                >Previous</va-button
              >
            </div>
            <div>
              <va-button
                preset="secondary"
                border-color="primary"
                @click="nextStep()"
                :disabled="step === steps.length - 1"
                >Next</va-button
              >
            </div>
          </div>
        </template>
      </va-stepper>
    </div>

    <div class="p-3">
      <p class="mb-3">
        The Atlas configuration is generated based on your inputs:
      </p>
      <va-input
        id="configTextarea"
        v-model="generatedConfig"
        class="item"
        type="textarea"
        :bordered="true"
        :min-rows="10"
        :max-rows="50"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from "vue"
import { stringify } from "yaml"

const step = ref(0)

const steps = [
  { label: "Argo project" },
  { label: "Apps" },
  { label: "Selectors" },
  { label: "Network policies" },
]

const ownerLabels = [
  "billing-eng",
  "central-eng",
  "data-asset-eng",
  "delivery-eng",
  "delivery-security",
  "fleet-services-eng",
  "identity",
  "metal-identity",
  "metal-sre",
  "nautilus",
  "network-arch",
  "network-eng",
  "platops",
  "portals",
  "software-net-eng",
  "systems-eng",
]

const adminGroups = [
  "Delivery Engineering",
  "Delivery Engineering Contributors",
  "Delivery Security",
  "DevRel Engineering",
  "Equinix Metal API Production Access",
  "Fleet Services Engineering",
  "Foundry",
  "Metal - Identity",
  "Metal SRE",
  "Nautilus",
  "Netarch",
  "Netbox_Superuser",
  "Netops",
  "Network Engineering",
  "Network Operations",
  "Phoenix",
  "Platform Operations",
  "Portals",
  "Software Networking",
  "Systems Engineering",
]

const clusterEnvironments = ["prod", "stage"]

const clusterClasses = [
  "bill",
  "core",
  "db",
  "edge",
  "hollow",
  "naas",
  "netops",
  "shared",
]

const clusterTags = [
  "cluster-small",
  "cluster-medium",
  "cluster-large",
  "single-node-cluster",
]

const namedRanges = [
  "all",
  "world",
  "cluster",
  "host",
  "akamai",
  "auth0",
  "buildkiteWebhooks",
  "cloudflare",
  "equinixGEN",
  "equinixVPN",
  "grafanaCloud",
  "loopbacks",
  "metalBackboneCatchpointEnterpriseNodes",
  "metalBackboneDevices",
  "metalBackboneRouters",
  "metalBackboneSwitchRouters",
  "metalInternal",
  "metalSubnets",
  "ns1Monitoring",
  "pingdom",
  "zscaler",
]

const project = reactive({
  name: "",
  ownerLabel: "",
  adminGroups: [],
  cpu: 2,
  memory: 4,
  skipRBAC: false,
  skipServiceAccount: false,
})

const app = reactive({
  name: "",
  repoURL: "",
  repoPath: "",
  repoRevision: "main",
  useClusterValuesFile: false,
  useEnvValuesFile: false,
})

// Clusters          []string `yaml:"clusters" json:"clusters"`
// ClusterClasses    []string `yaml:"clusterClasses" json:"clusterClasses"`
// ClusterSubClasses []string `yaml:"clusterSubClasses" json:"clusterSubClasses"`
// ClustersDeny      []string `yaml:"clusterDeny" json:"clusterDeny"`
// Environments      []string `yaml:"environments" json:"environments"`
// ClusterTags       []string `yaml:"clusterTags" json:"clusterTags"`

const numSelectorsClusters = ref(1)
const numSelectorsClustersDeny = ref(1)

const selectors = reactive({
  clusterClasses: [],
  clusterSubClasses: [],
  clusterTags: [],
  clusters: [],
  clustersDeny: [],
  environments: [],
  useClusterClasses: false,
  useClusterSubClasses: false,
  useClusterTags: false,
  useClusters: false,
  useClustersDeny: false,
  useEnvironments: false,
})

// Clusters    []string `yaml:"clusters" json:"clusters"`
// FacilityBMC bool     `yaml:"facilityBMC" json:"facilityBMC"`
// Facility    bool     `yaml:"facility" json:"facility"`
// Facilities  []string `yaml:"facilities" json:"facilities"`
// NamedRanges []string `yaml:"namedRanges" json:"namedRanges" jsonschema:"required"`
// Prefixes    []string `yaml:"ipRanges" json:"ipRanges"`

const numIngressClusters = ref(1)
const numIngressIPRanges = ref(1)

const ingress = reactive({
  clusters: [],
  facilityBMC: false,
  facility: false,
  facilities: [],
  namedRanges: [],
  ipRanges: [],
  useClusters: false,
  useFacilities: false,
  useNamedRanges: true,
  useIPRanges: false,
})

interface Config {
  name: string
  labels: {
    owner: string
  }
  resources: {
    cpu: string
    ram: string
  }
  admins: string[]
  skipRBACRestrictions?: boolean
  skipServiceAccount?: boolean
  apps: App[]
  selectors: Selector[]
  networkPolicy: {
    ingress: NetworkPolicyRules
    egress?: NetworkPolicyRules
  }
}

interface App {
  name: string
  repoURL: string
  repoPath?: string
  revision?: string
  clusterValuesFile?: boolean
  environmentValuesFile?: boolean
}

interface Selector {
  clusterClasses: string[]
  clusterDeny: string[]
  clusterSubClasses: string[]
  clusterTags: string[]
  clusters: string[]
  environments: string[]
}

interface NetworkPolicyRules {
  namedRanges: string[]
  ipRanges?: string[]
  clusters?: string[]
  facilities?: string[]
  facilityBMC?: boolean
  facility?: boolean
}

const generatedConfig = computed(() => {
  const appConfig: App = {
    name: app.name,
    repoURL: app.repoURL,
  }

  if (app.repoPath) {
    appConfig.repoPath = app.repoPath
  }

  if (app.repoRevision !== "main") {
    appConfig.revision = app.repoRevision
  }

  if (app.useClusterValuesFile) {
    appConfig.clusterValuesFile = true
  }

  if (app.useEnvValuesFile) {
    appConfig.environmentValuesFile = true
  }

  const selectorConfig = {} as Selector

  if (selectors.useClusterClasses) {
    selectorConfig.clusterClasses = selectors.clusterClasses
  }

  if (selectors.useClusterSubClasses) {
    selectorConfig.clusterSubClasses = selectors.clusterSubClasses
  }

  if (selectors.useClusterTags) {
    selectorConfig.clusterTags = selectors.clusterTags
  }

  if (selectors.useClusters) {
    selectorConfig.clusters = selectors.clusters
  }

  if (selectors.useClustersDeny) {
    selectorConfig.clusterDeny = selectors.clustersDeny
  }

  if (selectors.useEnvironments) {
    selectorConfig.environments = selectors.environments
  }

  const ingressConfig = {} as NetworkPolicyRules

  if (ingress.useNamedRanges) {
    ingressConfig.namedRanges = ingress.namedRanges
  }

  if (ingress.useClusters) {
    ingressConfig.clusters = ingress.clusters
  }

  if (ingress.useFacilities) {
    ingressConfig.facilities = ingress.facilities
  }

  if (ingress.useIPRanges) {
    ingressConfig.ipRanges = ingress.ipRanges
  }

  const config: Config = {
    name: project.name,
    labels: {
      owner: project.ownerLabel,
    },
    resources: {
      cpu: `${project.cpu}`,
      ram: `${project.memory}Gi`,
    },
    admins: project.adminGroups,
    apps: [appConfig],
    selectors: [selectorConfig],
    networkPolicy: {
      ingress: ingressConfig,
    },
  }

  if (project.skipRBAC) {
    config.skipRBACRestrictions = true
  }

  if (project.skipServiceAccount) {
    config.skipServiceAccount = true
  }

  return stringify([config], { defaultStringType: "PLAIN" })
})

function updateNumIngressClusters(i: Number) {
  if (i == numIngressClusters.value - 1) {
    numIngressClusters.value += 1
  }
}

function updateNumIngressIPRanges(i: Number) {
  if (i == numIngressIPRanges.value - 1) {
    numIngressIPRanges.value += 1
  }
}

function updateNumSelectorsClusters(i: Number) {
  if (i == numSelectorsClusters.value - 1) {
    numSelectorsClusters.value += 1
  }
}

function updateNumSelectorsClustersDeny(i: Number) {
  if (i == numSelectorsClustersDeny.value - 1) {
    numSelectorsClustersDeny.value += 1
  }
}

function validateName(value: string) {
  if (!value || value.length <= 0) {
    return "Name is required"
  }

  if (!/^[\w-]+$/.test(value)) {
    return "Name should only contain alphanumeric characters and dash, with no spaces"
  }

  return true
}

function validateRepoURL(value: string) {
  if (!value || value.length <= 0) {
    return "Repo URL is required"
  }

  if (!/^git@github.com:[\w-]+\/[\w-]+\.git$/.test(value)) {
    return "Repo URL should look like: git@github.com:equinixmetal/k8s-my-app.git"
  }

  return true
}
</script>

<style lang="scss"></style>
