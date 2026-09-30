<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

const { item, nextItem, is_cur_item } = defineProps<{
  item: Item
  nextItem: () => void
  is_cur_item: boolean
}>()

const count = ref(0)
const cur_index = ref(0)
const subitems = useTemplateRef('subitems')

function nextSubitem(): void {
  console.log('In nextSubitem')
  cur_index.value++
  if (cur_index.value === item.items?.length) {
    count.value++
    cur_index.value = 0
    if (count.value === item.count) {
      count.value = 0
      nextItem()
    }
  }
}

function nextStitch(): void {
  if (item.stitch) {
    count.value++
    if (count.value === item.count) {
      count.value = 0
      nextItem()
    }
    return
  }
  subitems.value![cur_index.value]!.nextStitch()
}
defineExpose({ nextStitch })
</script>

<template>
  <span v-if="item.stitch" :class="{ nothin: !is_cur_item, highlighted: is_cur_item }">
    {{ item.stitch }}*{{ item.count - count }}
  </span>
  <span v-if="item.items">
    [
    <ItemDisplay
      v-for="(subitem, index) in item.items"
      :key="index"
      ref="subitems"
      :item="subitem"
      :next-item="nextSubitem"
      :is_cur_item="is_cur_item && index === cur_index"
    />
    ]*{{ item.count - count }}
  </span>
</template>
