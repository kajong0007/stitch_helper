<script setup lang="ts">
import { ref } from 'vue'
import CurrentRow from './components/CurrentRow.vue'
import LinkCreator from './components/LinkCreator.vue'
import { parse as gParse } from './grammar'
import numberOfStitches from './utils/stitch_utils.ts'

// For inputting new pattern
const inputted_steps = ref('')
const error_message = ref('')
const pattern_num = ref(0)

// For processing current pattern
const pattern = ref()
const row_index = ref(0)
const pattern_complete = ref(false)
const init_end_of_row = ref(false)

// For loading current pattern from local storage
const item_index = ref<ItemIndex>()
const init_step_count = ref()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isItem(value: any): value is Item {
  if (typeof value !== 'object') return false
  if (!value.count) return false
  if (typeof value.count !== 'number') return false
  if (!value.items && !value.stitch) return false
  if (value.items) {
    if (!(value.items instanceof Array)) return false
    for (let i = 0; i < value.items.length; i++) {
      const x = value.items[i]
      if (!isItem(x)) {
        return false
      }
    }
  } else if (value.stitch) {
    if (typeof value.stitch !== 'string') return false
  } else {
    return false
  }
  return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRow(value: any): value is Row {
  if (typeof value !== 'object') return false
  if (value.total_stitches && typeof value.total_stitches !== 'number') return false
  if (!value.items) return false
  if (!(value.items instanceof Array)) return false
  for (let i = 0; i < value.items.length; i++) {
    const x = value.items[i]
    if (!isItem(x)) {
      return false
    }
  }
  return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPattern(value: any): value is Pattern {
  if (typeof value !== 'object') {
    console.log('Error: Pattern is not an object')
    return false
  }
  if (!value.rows) {
    console.log('Error: No rows parsed')
    return false
  }
  if (value.title && typeof value.title !== 'string') {
    console.log('Error: Title exists and is not a string')
    return false
  }
  if (!(value.rows instanceof Array)) {
    console.log('Error: Rows is not an array')
    return false
  }
  for (let i = 0; i < value.rows.length; i++) {
    if (!isRow(value.rows[i])) {
      console.log('Error: Row ' + (i + 1) + ' is not valid')
      return false
    }
  }
  return true
}

function runParser(s: string): void | Pattern {
  const maybe_parsed = gParse(s)
  if (isPattern(maybe_parsed)) {
    const p: Pattern = maybe_parsed
    return p
  } else {
    console.log(maybe_parsed)
  }
}

function loadState() {
  const url_segments = document.URL.split('?')
  if (url_segments.length > 1) {
    const params = new URLSearchParams(url_segments[1])
    for (const pair of params.entries()) {
      if (pair[0] === 'pattern') {
        loadStateFromUrlParam(pair[1])
        return
      }
    }
  }
  loadStateFromLocalStorage()
}

function loadStateFromUrlParam(stitch_pattern: string): void {
  try {
    pattern.value = splitText(stitch_pattern)
    localStorage.setItem('stitch_pattern', stitch_pattern)

    row_index.value = 0
    localStorage.setItem('stitch_row_index', 0 + '')

    init_step_count.value = 0
    localStorage.setItem('stitch_count', 0 + '')

    item_index.value = undefined
  } catch (e: unknown) {
    console.log(e)
  }
}

function loadStateFromLocalStorage() {
  const stitch_pattern = localStorage.getItem('stitch_pattern')
  if (stitch_pattern) {
    try {
      pattern.value = splitText(stitch_pattern)
    } catch (e: unknown) {
      console.log(e)
      localStorage.removeItem('stitch_pattern')
    }
  }
  const stitch_row_index = localStorage.getItem('stitch_row_index')
  if (stitch_row_index) {
    row_index.value = parseInt(stitch_row_index)
  }
  const stitch_count_string = localStorage.getItem('stitch_count')
  if (stitch_count_string) {
    const stitch_count = parseInt(stitch_count_string)
    init_step_count.value = stitch_count
    const index = getCurrentItemIndex(stitch_count, 0, pattern.value.rows[row_index.value].items)
    if (typeof index === 'object') {
      item_index.value = index
    }
  }
}

function setPattern() {
  const new_pattern = splitText(inputted_steps.value)
  if (new_pattern) {
    pattern.value = new_pattern
    pattern_complete.value = false
    row_index.value = 0
    item_index.value = undefined
    init_step_count.value = 0
    localStorage.setItem('stitch_pattern', inputted_steps.value)
    localStorage.setItem('stitch_row_index', row_index.value + '')
    localStorage.setItem('stitch_count', 0 + '')
    inputted_steps.value = ''
    pattern_num.value++
  }
}

function splitText(text: string): Pattern | null {
  const maybe_parsed = runParser(text + '')
  if (!maybe_parsed) return null
  const parsed: Pattern = maybe_parsed
  if (parsed.rows.length === 0) return null
  for (let i = 0; i < parsed.rows.length; i++) {
    const row = parsed.rows[i]!
    if (!validateRowCount(row)) {
      error_message.value = 'Invalid row count on row ' + (i + 1)
      return null
    }
  }
  error_message.value = ''
  return parsed
}

function validateRowCount(row: Row): boolean {
  const expected = calculateStitchCount(row.items)
  if (!row.total_stitches) {
    row.total_stitches = expected
    return true
  }
  return expected === row.total_stitches
}

function calculateStitchCount(items: Item[]): number {
  let count = 0
  for (const item of items) {
    if (item.stitch) {
      count += item.count * numberOfStitches(item.stitch)
    } else {
      count += item.count * calculateStitchCount(item.items!)
    }
  }
  return count
}

// Returns an ItemIndex if this list of items contains the current position. Otherwise returns a number
// representing the number of stitches remaining after this item list
function getCurrentItemIndex(
  num_stitches: number,
  count: number,
  items: Item[],
): ItemIndex | number {
  console.log('Remaining stitches: ' + num_stitches + ', items: ' + items)
  let remaining_stitches = num_stitches
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!
    if (item.stitch) {
      const stitches_per = numberOfStitches(item.stitch)
      // We've found the end
      if (item.count * stitches_per > remaining_stitches) {
        return {
          index: i,
          count: count,
          subitem_index: { count: remaining_stitches / stitches_per },
        }
      }
      // Move on past this stitch
      remaining_stitches -= item.count * stitches_per
    }
    if (item.items) {
      for (let j = 0; j < item.count; j++) {
        const ret_val = getCurrentItemIndex(remaining_stitches, j, item.items)
        // We found the end already - it's within this item
        if (typeof ret_val === 'object') {
          return { index: i, count: j, subitem_index: ret_val }
        }
        remaining_stitches = ret_val
      }
    }
  }
  return remaining_stitches
}

function nextRow(): void {
  row_index.value++
  init_end_of_row.value = false
  if (row_index.value >= pattern.value.rows.length) {
    row_index.value = pattern.value.rows.length - 1
    pattern_complete.value = true
  }
  localStorage.setItem('stitch_row_index', row_index.value + '')
  item_index.value = undefined
  init_step_count.value = undefined
}

function prevRow(): void {
  row_index.value--
  // Reached start of pattern
  if (row_index.value < 0) {
    row_index.value = 0
    return
  }
  // Move to the end of the prev row
  init_end_of_row.value = true
  localStorage.setItem('stitch_row_index', row_index.value + '')
  item_index.value = undefined
  init_step_count.value = undefined
}

function getPatternString(): string {
  return localStorage.getItem('stitch_pattern') || ''
}

window.onload = loadState
</script>

<template>
  <textarea id="topInput" rows="6" cols="50" v-model="inputted_steps" placeholder="Pattern Here" />
  <button id="submitButton" class="bigButton" @click="setPattern">Submit</button>
  <br />
  <span v-if="error_message" class="highlighted">{{ error_message }}</span>
  <br v-if="error_message" />
  <CurrentRow
    v-if="!pattern_complete && pattern"
    :key="pattern_num + '' + row_index"
    :row="pattern ? pattern.rows[row_index] : { items: [] }"
    :row_num="row_index + 1"
    :next-row="nextRow"
    :prev-row="prevRow"
    :init_end_of_row="init_end_of_row"
    :item_index="item_index"
    :init_step_count="init_step_count"
  />
  <span v-if="pattern_complete">Pattern complete!</span>
  <br /><br />
  <span>Round Number: {{ row_index + 1 }}</span>
  <br /><br />
  <LinkCreator :pattern_string="getPatternString()" />
</template>

<style>
body {
  background-color: #333333;
}
#submitButton {
  margin-left: 10px;
}
.bigButton {
  font-size: 20pt;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #dddddd;
  margin-top: 60px;
  font-size: 24pt;
}
.highlighted {
  color: red;
}
#topInput {
  line-height: 16pt;
  vertical-align: bottom;
}
</style>
