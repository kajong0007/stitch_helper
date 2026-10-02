<script setup lang="ts">
import numberOfStitches from '../utils/stitch_utils'
import { ref, useTemplateRef } from 'vue'

const { item, nextItem, prevItem, is_cur_item, init_end_of_row } = defineProps<{
  item: Item
  nextItem: () => void
  prevItem: () => number
  is_cur_item: boolean
  init_end_of_row: boolean
}>()

// If we are initializing for end of row, the last item needs to have 1 stitch left, all other items should appear complete
const count = ref(init_end_of_row ? (is_cur_item ? item.count - 1 : item.count) : 0)
const cur_index = ref(0)
const subitems = useTemplateRef('subitems')

function nextSubitem(): void {
  cur_index.value++
  // Completed a loop
  if (cur_index.value === item.items?.length) {
    count.value++
    cur_index.value = 0
    for (const item of subitems.value!) {
      item!.reset()
    }
    // Completed all loops of this item
    if (count.value === item.count) {
      nextItem()
    }
  }
}

function prevSubitem(): number {
  cur_index.value--
  // Backing up past the beginning of this loop
  if (cur_index.value < 0) {
    count.value--
    cur_index.value = 0
    // If this was the first loop, move to prev item
    if (count.value < 0) {
      count.value = 0
      return prevItem()
    }
    // If this was not the first loop, move to end of prev loop
    cur_index.value = item.items!.length - 1
    for (const item of subitems.value!) {
      item!.resetToMax()
    }
  }
  return subitems.value![cur_index.value]!.prevStitch()
}

// Returns the number of stitches advanced
function nextStitch(): number {
  if (item.stitch) {
    count.value++
    if (count.value === item.count) {
      nextItem()
    }
    return numberOfStitches(item.stitch)
  }
  return subitems.value![cur_index.value]!.nextStitch()
}

// Returns the number of stitches undone
function prevStitch(): number {
  if (item.stitch) {
    count.value--
    if (count.value < 0) {
      count.value = 0
      return prevItem()
    }
    return numberOfStitches(item.stitch)
  }
  return subitems.value![cur_index.value]!.prevStitch()
}

function reset(): void {
  count.value = 0
}

function resetToMax(): void {
  count.value = item.count
}

defineExpose({ nextStitch, prevStitch, reset, resetToMax })

function getCountDisplay(): string {
  if (item.count === 1) {
    return ''
  }
  return '*' + (item.count - count.value)
}
</script>

<template>
  <span v-if="item.stitch" :class="{ nothin: !is_cur_item, highlighted: is_cur_item }">
    {{ item.stitch + getCountDisplay() }}
  </span>
  <span v-if="item.items">
    [
    <ItemDisplay
      v-for="(subitem, index) in item.items"
      :key="index"
      ref="subitems"
      :item="subitem"
      :next-item="nextSubitem"
      :prev-item="prevSubitem"
      :is_cur_item="is_cur_item && index === cur_index"
      :init_end_of_row="init_end_of_row"
    />
    ]{{ getCountDisplay() }}
  </span>
</template>

<style>
span {
  margin-left: 0.2em;
  margin-right: 0.2em;
}
</style>
