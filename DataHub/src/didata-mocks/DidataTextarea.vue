<template>
  <v-textarea
    v-bind="$attrs"
  >
    <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps"></slot>
    </template>
  </v-textarea>
</template>

<script setup lang="ts">
// Simple mock wrapper for native DiData component
</script>