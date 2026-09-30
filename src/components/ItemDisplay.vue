<script setup lang="ts">
import { h, ref, type VNode } from 'vue'

const { item, nextItem, is_cur_item } = defineProps<{
  item: Item
  nextItem: () => void
  is_cur_item: boolean
}>()

const count = ref(0)
const cur_index = ref(0)
let vnode = buildItemElement(item, is_cur_item)

function buildItemElement(item: Item, is_cur_item: boolean): VNode {
  if (item.stitch) {
    const css_class = is_cur_item ? 'currentIndex' : 'nothin'
    const remaining_stitches = item.count - count.value
    console.log('remaining stitches: ' + remaining_stitches)
    const value = h('span', { class: css_class }, item.stitch + '*' + remaining_stitches)
    console.log(value)
    return value
  }
  if (!item.items) {
    return h('span', 'Error: item has no stitch or items list')
  }

  const children: (string | VNode)[] = ['[']
  // This should be creating ItemDisplay objects shouldn't it
  // for (let i = 0; i < item.items.length; i++) {
  //   const subitem = item.items[i]
  //   const subitem_display = h('ItemDisplay', {
  //     item: subitem,
  //     nextItem: nextItem,
  //     is_cur_item: i === cur_index.value,
  //   })
  //   children.push(subitem_display)
  // }
  children.push(
    ...item.items.map((subitem, index) => buildItemElement(subitem, index === cur_index.value)),
  )
  children.push(']')
  return h('span', children)
}

function nextStitch() {
  console.log('In next stitch!')
  count.value++
  if (
    (item.stitch && count.value === item.count) ||
    (item.items && count.value === item.items.length)
  ) {
    nextItem()
  }
  vnode = buildItemElement(item, is_cur_item)
}
defineExpose({ nextStitch })
</script>

<template>
  <vnode />
</template>
