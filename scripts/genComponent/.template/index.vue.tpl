<template>
  <div class="dp-{{className}}">
    {{name}} {{zhName}}
    <p>\{{text}}</p>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script setup lang="ts">
/**
 * @displayName {{name}} {{zhName}}
 */
export interface I{{name}}Props {
  /**
   * 测试属性
   * @description 测试属性，仅供参考，实际使用需要删除
   * @link https://vue-styleguidist.github.io/docs/Documenting.html
   */
  text: string
}

const props = withDefaults(defineProps<I{{name}}Props>(), {
  text: 'foo',
})

const emit = defineEmits<{
  /** click 事件
   * @event click
   * @type {Event}
   * @property {MouseEvent} ev - 事件对象
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
