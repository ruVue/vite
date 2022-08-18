<script setup lang="ts">
import { VPHomeSponsors } from 'vitepress/theme'
import { useSponsor } from '../composables/sponsor'

const { data } = useSponsor()
</script>

<template>
  <VPHomeSponsors
    v-if="data"
    message="Vite является бесплатным и открытым исходным кодом, что стало возможным благодаря замечательным спонсорам."
    action-text="Стать спонсором"
    action-link="https://github.com/sponsors/yyx990803"
    :data="data"
  />
</template>
