<template>
  <div class="ml-2 mb-4">
    <h4 class="va-h4 mb-3">
      <va-icon name="rule" class="mr-4" />
      Atlas config validator
    </h4>
    <p class="mb-4">Validate an Atlas namespace YAML config.</p>
  </div>

  <va-input
    id="configTextarea"
    v-model="configInput"
    class="mb-3"
    type="textarea"
    label="Paste YAML config below"
    :bordered="true"
    :min-rows="10"
    :max-rows="50"
  />

  <va-button @click="validate">Validate</va-button>

  <va-alert
    v-if="isFailedValidation"
    color="warning"
    icon="warning"
    outline
    class="my-3"
  >
    <pre>{{ validationErrors }}</pre>
  </va-alert>

  <va-alert
    v-if="isSuccessfulValidation"
    color="success"
    icon="check"
    outline
    class="my-3"
  >
    <pre>OK</pre>
  </va-alert>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { parse } from "yaml"
import Ajv2020 from "ajv/dist/2020"
import * as schemaNamespace from "@/schema-namespace.json"

const isFailedValidation = ref(false)
const isSuccessfulValidation = ref(false)
const validationErrors = ref([])
const configInput = ref("")

const ajv = new Ajv2020()
const ajvValidateSchema = ajv.compile(schemaNamespace)

function validate() {
  let config

  try {
    config = parse(configInput.value)
  } catch (e: any) {
    isFailedValidation.value = true
    isSuccessfulValidation.value = false
    validationErrors.value = [e]
    return
  }

  const valid = ajvValidateSchema(config)

  if (!valid) {
    isFailedValidation.value = true
    isSuccessfulValidation.value = false
    console.debug(
      "validation error: " + ajv.errorsText(ajvValidateSchema.errors)
    )
    validationErrors.value = ajvValidateSchema.errors
    return
  }

  isFailedValidation.value = false
  isSuccessfulValidation.value = true
  validationErrors.value = []
}
</script>

<style lang="scss">
#configTextarea {
  font-family: monospace !important;
}
</style>
