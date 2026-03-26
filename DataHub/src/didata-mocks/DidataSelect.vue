<template>
  <v-select
    v-bind="$attrs"
  >
    <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps"></slot>
    </template>
  </v-select>
</template>

<script setup lang="ts">
// Simple mock wrapper for native DiData component
</script>