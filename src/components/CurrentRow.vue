<script setup lang="ts">
const { row, row_num, nextRow, prevRow } = defineProps<{
  row: Row
  row_num: number
  nextRow: () => void
  prevRow: () => void
}>()

import { ref, useTemplateRef } from 'vue'
import ItemDisplay from './ItemDisplay.vue'

const individual_step_count = ref(0)
const cur_index = ref(0)
const item_displays = useTemplateRef('itemDisplays')

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
  />
  <p>Individual Steps: {{ individual_step_count }}</p>
  <button class="bigButton" @click="prevStitch">Prev Step</button>
  <button class="bigButton" @click="nextStitch">Next Step</button>
  <br />
  <button class="bigButton" @click="resetCount">Reset</button>
  <br /><br />
</template>
