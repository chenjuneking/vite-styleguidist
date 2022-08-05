###### {{desc}}

## Usage
```vue
<template>
  <{{name}} text="foo" @click="handleClick" />
</template>

<script setup lang="ts">
import { {{name}} } from '@vite-styleguidist/components'
const handleClick = (ev: MouseEvent) => {
  console.log(ev)
}
</script>
```