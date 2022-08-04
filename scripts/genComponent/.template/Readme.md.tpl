###### {{desc}}

## 基础使用
```vue
<template>
  <{{name}} text="foo" @click="handleClick" />
</template>

<script setup lang="ts">
import { {{name}} } from '@deep/ui'
const handleClick = (ev: MouseEvent) => {
  console.log(ev)
}
</script>
```