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
import numberOfStitches from '../utils/stitch_utils.ts'

// TODO: Once we have validation, we can make total_stitches required on Row
// (if the user doesn't enter it, we will just use the calculated value)
const individual_step_count = ref(
  init_end_of_row ? (row.total_stitches ? row.total_stitches - numStitchesOfLastStitch() : 0) : 0,
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

function numStitchesOfLastStitch(): number {
  const stitch = getStitch(row.items.at(-1)!)
  return numberOfStitches(stitch)
}

function getStitch(item: Item) {
  if (item.stitch) {
    return item.stitch
  }
  return getStitch(item.items!.at(-1)!)
}

function nextStitch(): void {
  const stiches_done = item_displays.value![cur_index.value]!.nextStitch()
  individual_step_count.value += stiches_done
  localStorage.setItem('stitch_count', individual_step_count.value + '')
}

function prevStitch(): void {
  const stitches_undone = item_displays.value![cur_index.value]!.prevStitch()
  individual_step_count.value -= stitches_undone
  if (individual_step_count.value < 0) {
    individual_step_count.value = 0
  }
  localStorage.setItem('stitch_count', individual_step_count.value + '')
}

function nextItem(): void {
  cur_index.value++
  // Completed the row
  if (cur_index.value >= row.items.length) {
    cur_index.value = 0
    nextRow()
  }
}

// Returns the number of stitches undone
function prevItem(): number {
  cur_index.value--
  // Reached start of row
  if (cur_index.value < 0) {
    cur_index.value = 0
    prevRow()
    return 0 // Number of stitches is not relevant here - the count will be handled automatically
  }
  return item_displays.value![cur_index.value]!.prevStitch()
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
