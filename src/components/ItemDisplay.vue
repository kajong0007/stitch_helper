<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

const { item, nextItem, prevItem, is_cur_item, init_end_of_row } = defineProps<{
  item: Item
  nextItem: () => void
  prevItem: () => void
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
    // Completed all loops of this item
    if (count.value === item.count) {
      nextItem()
      return
    }
    for (const item of subitems.value!) {
      item!.reset()
    }
  }
}

function prevSubitem(): void {
  cur_index.value--
  // Backing up past the beginning of this loop
  if (cur_index.value < 0) {
    count.value--
    cur_index.value = 0
    // If this was the first loop, move to prev item
    if (count.value < 0) {
      count.value = 0
      prevItem()
      return
    }
    // If this was not the first loop, move to end of prev loop
    cur_index.value = item.items!.length - 1
    for (const item of subitems.value!) {
      item!.resetToMax()
    }
  }
  subitems.value![cur_index.value]!.prevStitch()
}

function nextStitch(): void {
  if (item.stitch) {
    count.value++
    if (count.value === item.count) {
      nextItem()
    }
    return
  }
  subitems.value![cur_index.value]!.nextStitch()
}

function prevStitch(): void {
  if (item.stitch) {
    count.value--
    if (count.value < 0) {
      count.value = 0
      prevItem()
    }
    return
  }
  subitems.value![cur_index.value]!.prevStitch()
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
