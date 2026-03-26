<template>
  <LoadingBar />
  <AppToast />
  <router-view />
</template>

<script setup>
import LoadingBar from './components/LoadingBar.vue';
import AppToast from './components/AppToast.vue';
</script>
