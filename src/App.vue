<script setup lang="ts">
import { ref } from 'vue'
import CurrentRow from './components/CurrentRow.vue'
import { parse as gParse } from './grammar'

// For inputting new pattern
const inputted_steps = ref('')

// For processing current pattern
const pattern = ref()
const row_index = ref(0)
const pattern_complete = ref(false)
const init_end_of_row = ref(false)

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
  if (localStorage.getItem('stitchState')) {
    try {
      splitText(localStorage.getItem('stitch_pattern') || '')
    } catch (e: unknown) {
      console.log(e)
      localStorage.removeItem('stitchState')
    }
  }
}

function splitText(text: string) {
  const maybe_parsed = runParser(text + '')
  if (!maybe_parsed) return
  const parsed: Pattern = maybe_parsed
  if (parsed.rows.length === 0) return
  pattern.value = parsed
  row_index.value = 0
  pattern_complete.value = false
  localStorage.setItem('stitch_pattern', text)
  inputted_steps.value = ''
}

function nextRow(): void {
  row_index.value++
  init_end_of_row.value = false
  if (row_index.value >= pattern.value.rows.length) {
    row_index.value = pattern.value.rows.length - 1
    pattern_complete.value = true
  }
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
}

window.onload = loadState
</script>

<template>
  <textarea id="topInput" rows="6" cols="50" v-model="inputted_steps" placeholder="Pattern Here" />
  <button id="submitButton" class="bigButton" @click="splitText(inputted_steps)">Submit</button>
  <br />
  <CurrentRow
    v-if="!pattern_complete"
    :key="row_index"
    :row="pattern ? pattern.rows[row_index] : { items: [] }"
    :row_num="row_index + 1"
    :next-row="nextRow"
    :prev-row="prevRow"
    :init_end_of_row="init_end_of_row"
  />
  <span v-if="pattern_complete">Pattern complete!</span>
  <br /><br />
  <span>Round Number: {{ row_index + 1 }}</span>
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
