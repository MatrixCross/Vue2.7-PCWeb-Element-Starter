<template>
  <div>
    <div class="test-page">route query: {{ queryData }}</div>
    <i-svg-spinners-wind-toy/>
  </div>
</template>
<script setup lang="ts">
const $route = useRoute()
const queryData = ref('')
onMounted(() => {
  const query = <string>$route.query.data
  if (query) {
    queryData.value = query
  }
})
</script>
