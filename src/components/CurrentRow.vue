<script setup lang="ts">
const { row } = defineProps<{
  row: Row
}>()

import { ref } from 'vue'

const individual_step_count = ref(0)
const complete_loop_count = ref(0)
const curIndex = ref(0)

function nextSubStep(): void {
  curIndex.value++
  // TODO: support inc
  individual_step_count.value++
  if (curIndex.value >= row.items.length) {
    curIndex.value = 0
    complete_loop_count.value++
  }
}

function prevSubStep(): void {
  curIndex.value--
  // TODO: support inc
  individual_step_count.value--

  // Reached beginning
  if (individual_step_count.value <= 0) {
    curIndex.value = 0
    individual_step_count.value = 0
    return
  }

  // Reached beginning of loop
  if (curIndex.value < 0) {
    curIndex.value = row.items.length - 1
    complete_loop_count.value--
  }
}

function itemToString(item: Item): string {
  console.log(item)
  const token = item.token
  if (token.stitch) {
    return token.stitch + '*' + item.count
  }
  if (!token.items) {
    return 'Error: item has no stitch or items list'
  }

  let output = '['
  output += token.items.map((subitem) => itemToString(subitem)).join(' ')
  output += ']'
  return output
}
</script>

<template>
  <span
    v-for="(item, index) in row.items"
    :key="index"
    :class="{ currentIndex: index === curIndex, nothin: index !== curIndex }"
  >
    {{ itemToString(item) + ' ' }}
  </span>
  <p>Complete Loops: {{ complete_loop_count }}</p>
  <p>Individual Steps: {{ individual_step_count }}</p>
  <button class="bigButton" @click="prevSubStep">Prev Step</button>
  <button class="bigButton" @click="nextSubStep">Next Step</button>
  <br /><br />
</template>
