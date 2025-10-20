<!-- src/components/lab/services/ServiceList.vue -->
<template>
  <v-card border>
    <v-card-title class="d-flex align-center">
      <span>Erfasste Services</span>
      <v-spacer></v-spacer>
      <v-btn size="small" variant="flat" color="primary" @click="$emit('createNew')">
        <v-icon start>mdi-plus</v-icon>
        Neu
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    
    <v-skeleton-loader v-if="loading" type="list-item@3"></v-skeleton-loader>
    <v-list v-else density="compact">
      <v-list-item
        v-for="service in services"
        :key="service.id"
        @click="$emit('select', service)"
        link
      >
        <template v-slot:prepend>
          <v-icon size="small">mdi-chevron-right</v-icon>
        </template>
        <v-list-item-title>{{ service.serviceType }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="!services.length">
        <v-list-item-subtitle class="text-center pa-4">Noch keine Services erfasst.</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import type { ProjectService } from '@/mocks/db';

defineProps<{
  services: ProjectService[];
  loading: boolean;
}>();

defineEmits<{
  (e: 'select', service: ProjectService): void;
  (e: 'createNew'): void;
}>();
</script>