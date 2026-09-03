<script setup>
import { ref } from 'vue'

const next_steps = ref('')
const individual_steps = ref(0)
const complete_loops = ref(0)

const steps = ref([
    {text: "Steps", class: "currentIndex"},
    {text: "show"},
    {text: "up"},
    {text: "here"},
])

const index = ref(0)
const currentMax = ref(steps.value.length)

function onInput(e) {
    next_steps.value = e.target.value
}

function splitText() {
    index.value = 0
    individual_steps.value = 0
    complete_loops.value = 0
    let strs = next_steps.value.split(" ")
    currentMax.value = strs.length
    steps.value = []
    for (let i = 0; i < strs.length; i++) {
        steps.value.push({text: strs[i], class: "nothin"})
    }
    steps.value[0].class = "currentIndex"
    next_steps.value = ''
}

function nextSubStep() {
    steps.value[index.value].class = "nothin"
    index.value++
    individual_steps.value++
    if (index.value >= currentMax.value) {
        index.value = 0
        complete_loops.value++
    }
    steps.value[index.value].class = "currentIndex"
}

function checkIt(event) {
    let input_elem = document.getElementById('topInput')
    if (event.key == " " && event.target != input_elem) {
        nextSubStep()
    }
}

window.addEventListener('keyup', checkIt)

</script>

<template>
    <input id="topInput" @keyup.enter="splitText" :value="next_steps" @input="onInput" placeholder="Current Round Here" />
    <button @click="splitText">Go!</button>
    <br />
    <span v-for="step in steps" :key=step.text :class=step.class>
        {{ step.text + " "}}
    </span>
    <p>Complete Loops: {{ complete_loops }}</p>
    <p>Individual Steps: {{ individual_steps }}</p>
    <button @click="nextSubStep">Next Sub Step</button>
</template>

<style>
body {
  background-color: #333333;
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
.currentIndex {
    color: red;
}
</style>
