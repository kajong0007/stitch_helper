<script setup lang="ts">
const { pattern_string } = defineProps<{
  pattern_string: string
}>()

function onClick() {
  let url = location.origin + location.pathname
  url += '?pattern=' + encodeURI(pattern_string)
  navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!'))
}
</script>

<template>
  <div>
    <button class="bigButton" v-on:click="onClick()">Copy link to pattern</button>
  </div>
</template>
