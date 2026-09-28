<script setup lang="ts">
import { ref } from 'vue'
import CurrentRow from './components/CurrentRow.vue'
import { parse as gParse } from './grammar'

interface BigState {
  next_steps?: string
  individual_steps?: number
  complete_loops?: number
  index?: number
  steps?: { text: string; class?: string }[]
  round?: number
}

const bigState = ref<BigState>({})

const item1 = {
  stitch: 'sc',
  count: 2,
}
const subitem2_1 = {
  stitch: 'sc',
  count: 1,
}
const subitem2_2 = {
  stitch: 'dec',
  count: 1,
}
const item2 = {
  items: [subitem2_1, subitem2_2],
  count: 4,
}
const row = {
  items: [item1, item2],
}

function saveState() {
  const parsed = JSON.stringify(bigState.value)
  localStorage.setItem('stitchState', parsed)
}

function runParser(s: string) {
  return gParse(s)
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
    round: 1,
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
      if (stored.round) {
        bigState.value.round = stored.round
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

function highlightThing(prev_idx: number, next_idx: number) {
  if (!bigState.value.steps || !bigState.value.steps[prev_idx] || !bigState.value.steps[next_idx]) {
    return
  }
  bigState.value.steps[prev_idx].class = 'nothin'
  bigState.value.steps[next_idx].class = 'currentIndex'
  saveState()
}

function splitText() {
  bigState.value.index = 0
  bigState.value.individual_steps = 0
  bigState.value.steps = []
  bigState.value.complete_loops = 0
  const strs = bigState.value.next_steps!.trim().split(/[ ]+/)
  for (let i = 0; i < strs.length; i++) {
    bigState.value.steps.push({ text: strs[i]!, class: 'nothin' })
  }
  highlightThing(0, 0)
  bigState.value.next_steps = ''
  saveState()
}

function nextSubStep() {
  const prev_idx = bigState.value.index
  bigState.value.index!++
  bigState.value.individual_steps!++
  if (bigState.value.index! >= bigState.value.steps!.length) {
    bigState.value.index = 0
    bigState.value.complete_loops!++
  }
  const next_idx = bigState.value.index
  highlightThing(prev_idx!, next_idx!)
}

function prevSubStep() {
  const prev_idx = bigState.value.index
  bigState.value.index!--
  bigState.value.individual_steps!--
  if (bigState.value.individual_steps! <= 0) {
    bigState.value.index = 0
    bigState.value.individual_steps = 0
    highlightThing(prev_idx!, 0)
    return
  }
  if (bigState.value.index! < 0) {
    bigState.value.index = bigState.value.steps!.length - 1
    bigState.value.complete_loops!--
  }
  const next_idx = bigState.value.index
  highlightThing(prev_idx!, next_idx!)
}

function checkIt(event: KeyboardEvent) {
  const input_elem = document.getElementById('topInput')
  if (event.key == ' ' && event.target != input_elem) {
    nextSubStep()
    return
  }
  if (event.key == 'Backspace' && event.target != input_elem) {
    prevSubStep()
    return
  }
  if (event.key == '-' && event.target != input_elem) {
    decrementRound()
    return
  }
  if (event.key == 'p' && event.target != input_elem) {
    incrementRound()
    return
  }
  //console.log(event)
}

function decrementRound() {
  if (bigState.value.round! <= 1) {
    return
  }
  bigState.value.round!--
  saveState()
}

function incrementRound() {
  bigState.value.round!++
  saveState()
}

window.addEventListener('keyup', checkIt)
window.onload = loadState

declare global {
  interface Window {
    testRunParser: typeof runParser
  }
}

window.testRunParser = runParser
</script>

<template>
  <input
    id="topInput"
    @keyup.enter="splitText"
    :value="bigState.next_steps"
    @input="onInput"
    placeholder="Current Round Here"
  />
  <button class="bigButton" @click="splitText">Set Steps</button>
  <br />
  <CurrentRow :row="row" />
  <!-- <span v-for="step in bigState.steps" :key="step.text" :class="step.class">
    {{ step.text + ' ' }}
  </span>
  <p>Complete Loops: {{ bigState.complete_loops }}</p>
  <p>Individual Steps: {{ bigState.individual_steps }}</p>
  <button class="bigButton" @click="prevSubStep">Prev Step</button>
  <button class="bigButton" @click="nextSubStep">Next Step</button> -->
  <br /><br />
  <button class="bigButton" @click="decrementRound">-Round</button>
  <span>Round Number: {{ bigState.round }}</span>
  <button class="bigButton" @click="incrementRound">+Round</button>
</template>

<style>
body {
  background-color: #333333;
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
  line-height: 24pt;
  vertical-align: bottom;
}
</style>
