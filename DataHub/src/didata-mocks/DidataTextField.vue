<template>
  <v-text-field
    v-bind="$attrs"
    variant="outlined"
    density="compact"
    hide-details="auto"
    class="didata-input"
  >
    <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps"></slot>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
// Simple mock wrapper for native DiData component
</script>

<style scoped>
/* Any component-specific DiData styles can go here */
</style>