<script setup lang="ts">
import { ref } from 'vue'
import CurrentRow from './components/CurrentRow.vue'
import { parse as gParse } from './grammar'

const pattern = ref()
const pattern_complete = ref(false)
const init_end_of_row = ref(false)

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

function isPattern(value: any): value is Pattern {
  if (typeof value !== 'object') return false
  if (!value.rows) return false
  if (value.title && typeof value.title !== 'string') return false
  if (!(value.rows instanceof Array)) return false
  for (let i = 0; i < value.rows.length; i++) {
    if (!isRow(value.rows[i])) {
      return false
    }
  }
  return true
}

interface BigState {
  next_steps?: string
  individual_steps?: number
  complete_loops?: number
  index?: number
  steps?: { text: string; class?: string }[]
}

const bigState = ref<BigState>({})

function saveState() {
  const parsed = JSON.stringify(bigState.value)
  localStorage.setItem('stitchState', parsed)
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

function stateDefaults() {
  return {
    next_steps: '',
    individual_steps: 0,
    complete_loops: 0,
    index: 0,
    steps: [
      { text: 'Steps', class: 'currentIndex' },
      { text: 'show' },
      { text: 'up' },
      { text: 'here' },
    ],
  }
}

function loadState() {
  bigState.value = stateDefaults()
  if (localStorage.getItem('stitchState')) {
    try {
      const stored = JSON.parse(localStorage.getItem('stitchState')!)
      if (stored.next_steps) {
        bigState.value.next_steps = stored.next_steps
      }
      if (stored.individual_steps) {
        bigState.value.individual_steps = stored.individual_steps
      }
      if (stored.complete_loops) {
        bigState.value.complete_loops = stored.complete_loops
      }
      if (stored.index) {
        bigState.value.index = stored.index
      }
      if (stored.steps) {
        bigState.value.steps = stored.steps
      }
    } catch (e: unknown) {
      console.log(e)
      localStorage.removeItem('stitchState')
    }
  }
  saveState()
}

function onInput(e: Event) {
  bigState.value.next_steps = (e.target as HTMLInputElement).value
}

function splitText() {
  const maybe_parsed = runParser(bigState.value.next_steps + '')
  if (!maybe_parsed) return
  const parsed: Pattern = maybe_parsed
  if (parsed.rows.length === 0) return
  pattern.value = parsed
  bigState.value.index = 0
  bigState.value.individual_steps = 0
  bigState.value.steps = []
  bigState.value.complete_loops = 0
  pattern_complete.value = false
  const strs = bigState.value.next_steps!.trim().split(/[ ]+/)
  for (let i = 0; i < strs.length; i++) {
    bigState.value.steps.push({ text: strs[i]!, class: 'nothin' })
  }
  bigState.value.next_steps = ''
  saveState()
}

function nextRow(): void {
  bigState.value.index!++
  init_end_of_row.value = false
  if (bigState.value.index! >= pattern.value.rows.length) {
    bigState.value.index = pattern.value.rows.length - 1
    pattern_complete.value = true
  }
}

function prevRow(): void {
  bigState.value.index!--
  // Reached start of pattern
  if (bigState.value.index! < 0) {
    bigState.value.index = 0
    return
  }
  // Move to the end of the prev row
  init_end_of_row.value = true
}

window.onload = loadState
</script>

<template>
  <textarea
    id="topInput"
    rows="6"
    cols="50"
    @keyup.enter="splitText"
    :value="bigState.next_steps"
    @input="onInput"
    placeholder="Pattern Here"
  />
  <button id="submitButton" class="bigButton" @click="splitText">Submit</button>
  <br />
  <CurrentRow
    v-if="!pattern_complete"
    :key="bigState.index"
    :row="pattern ? pattern.rows[bigState.index!] : { items: [] }"
    :row_num="bigState.index! + 1"
    :next-row="nextRow"
    :prev-row="prevRow"
    :init_end_of_row="init_end_of_row"
  />
  <span v-if="pattern_complete">Pattern complete!</span>
  <br /><br />
  <span>Round Number: {{ bigState.index! + 1 }}</span>
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
