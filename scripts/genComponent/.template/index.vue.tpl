<template>
  <div class="dp-{{className}}">
    {{name}}
    <p>\{{text}}</p>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script setup lang="ts">
/**
 * @displayName {{name}}
 */
export interface I{{name}}Props {
  /**
   * The text
   * @description this is a test property
   * @link https://vue-styleguidist.github.io/docs/Documenting.html
   */
  text: string
}

const props = withDefaults(defineProps<I{{name}}Props>(), {
  text: 'foo',
})

const emit = defineEmits<{
  /** click event
   * @event click
   * @type {Event}
   * @property {MouseEvent} ev - the event object
   */
  (event: 'click', ev: MouseEvent): void
}>()

const handleClick = (ev: MouseEvent) => {
  emit('click', ev)
}
</script>

<style lang="scss" scoped>
.dp-{{className}} {}
</style>
