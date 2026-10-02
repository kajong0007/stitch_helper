<script setup lang="ts">
const { row, row_num, nextRow, prevRow, init_end_of_row } = defineProps<{
  row: Row
  row_num: number
  nextRow: () => void
  prevRow: () => void
  init_end_of_row: boolean
}>()

import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import ItemDisplay from './ItemDisplay.vue'

// TODO: Once we have validation, we can make total_stitches required on Row
// (if the user doesn't enter it, we will just use the calculated value)
const individual_step_count = ref(
  init_end_of_row ? (row.total_stitches ? row.total_stitches - 1 : 0) : 0,
)
const cur_index = ref(init_end_of_row ? row.items.length - 1 : 0)
const item_displays = useTemplateRef('itemDisplays')

// Bind space to nextStitch and backspace to prevStitch
onMounted(() => {
  window.addEventListener('keyup', keyBehavior)
})

onBeforeUnmount(() => {
  window.removeEventListener('keyup', keyBehavior)
})

function keyBehavior(event: KeyboardEvent): void {
  const input_elem = document.getElementById('topInput')
  if (event.key == ' ' && event.target != input_elem) {
    nextStitch()
    return
  }
  if (event.key == 'Backspace' && event.target != input_elem) {
    prevStitch()
    return
  }
}

function nextStitch(): void {
  // TODO: support inc
  individual_step_count.value++
  item_displays.value![cur_index.value]!.nextStitch()
}

function prevStitch(): void {
  // TODO: support inc
  individual_step_count.value--
  if (individual_step_count.value < 0) {
    individual_step_count.value = 0
  }
  item_displays.value![cur_index.value]!.prevStitch()
}

function nextItem(): void {
  cur_index.value++
  // Completed the row
  if (cur_index.value >= row.items.length) {
    cur_index.value = 0
    nextRow()
  }
}

function prevItem(): void {
  cur_index.value--
  // Reached start of row
  if (cur_index.value < 0) {
    cur_index.value = 0
    prevRow()
    return
  }
  item_displays.value![cur_index.value]!.prevStitch()
}

function resetCount(): void {
  individual_step_count.value = 0
}
</script>

<template>
  <ItemDisplay
    v-for="(item, index) in row.items"
    :key="row_num + '-' + index"
    ref="itemDisplays"
    :item="item"
    :next-item="nextItem"
    :prev-item="prevItem"
    :is_cur_item="cur_index === index"
    :init_end_of_row="init_end_of_row"
  />
  <p>Individual Steps: {{ individual_step_count }}</p>
  <button class="bigButton" @click="prevStitch">Prev Step</button>
  <button class="bigButton" @click="nextStitch">Next Step</button>
  <br />
  <button class="bigButton" @click="resetCount">Reset</button>
  <br /><br />
</template>
