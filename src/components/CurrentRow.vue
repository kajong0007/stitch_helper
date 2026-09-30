<script setup lang="ts">
const { row } = defineProps<{
  row: Row
}>()

import { ref, useTemplateRef } from 'vue'
import ItemDisplay from './ItemDisplay.vue'

const individual_step_count = ref(0)
const complete_loop_count = ref(0)
const cur_index = ref(0)
const item_displays = useTemplateRef('itemDisplays')

function nextSubStep(): void {
  // TODO: support inc
  individual_step_count.value++
  item_displays.value![cur_index.value]!.nextStitch()
}

function prevSubStep(): void {
  // TODO: support inc
  individual_step_count.value--
  if (individual_step_count.value < 0) {
    individual_step_count.value = 0
  }
  item_displays.value![cur_index.value]!.prevStitch()
}

function nextItem(): void {
  cur_index.value++
  if (cur_index.value >= row.items.length) {
    cur_index.value = 0
    complete_loop_count.value++
  }
}

function prevItem(): void {
  cur_index.value--
  if (cur_index.value < 0) {
    cur_index.value = 0
    complete_loop_count.value--
    if (complete_loop_count.value < 0) {
      // TODO: Go to previous row
      complete_loop_count.value = 0
    }
  }
}
</script>

<template>
  <ItemDisplay
    v-for="(item, index) in row.items"
    :key="index"
    ref="itemDisplays"
    :item="item"
    :next-item="nextItem"
    :prev-item="prevItem"
    :is_cur_item="cur_index === index"
  />
  <p>Complete Loops: {{ complete_loop_count }}</p>
  <p>Individual Steps: {{ individual_step_count }}</p>
  <button class="bigButton" @click="prevSubStep">Prev Step</button>
  <button class="bigButton" @click="nextSubStep">Next Step</button>
  <br /><br />
</template>
