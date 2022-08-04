###### A Resizable Container

## Drag on the right edge

```vue
<template>
  <ResizableContainer
    sides="right"
    :min-width="120"
    :max-width="640"
    class="container"
  >
    <ul>
      <li class="ellipsis">It's ok if the text is short</li>
      <li class="ellipsis">But when the text goes long</li>
      <li class="ellipsis">eg:</li>
      <li class="ellipsis">
        I am a long long long long long long long long long long long long long
        long text
      </li>
      <li class="ellipsis">That's it</li>
    </ul>
  </ResizableContainer>
</template>

<script setup lang="ts">
import { ResizableContainer } from '@vite-styleguidist/components'
</script>

<style>
.container {
  width: 220px;
  border: 1px dashed #eee;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
ul {
  list-style: none;
  padding: 10px;
  margin: 0;
}
</style>
```

## Drag on the bottom & left edge

```vue
<template>
  <ResizableContainer
    sides="left,bottom"
    size="large"
    :min-width="120"
    :max-width="640"
    :min-height="140"
    :max-height="240"
    class="container"
  >
    <ul>
      <li class="ellipsis">It's ok if the text is short</li>
      <li class="ellipsis">But when the text goes long</li>
      <li class="ellipsis">eg:</li>
      <li class="ellipsis">
        I am a long long long long long long long long long long long long long
        long text
      </li>
      <li class="ellipsis">That's it</li>
    </ul>
  </ResizableContainer>
</template>

<script setup lang="ts">
import { ResizableContainer } from '@vite-styleguidist/components'
</script>

<style>
.container {
  width: 220px;
  border: 1px dashed #eee;
  float: right;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
ul {
  list-style: none;
  padding: 10px;
  margin: 0;
}
</style>
```

## Customize the dragable edge

```vue
<template>
  <ResizableContainer
    :min-width="120"
    :max-width="640"
    visibility="always"
    class="container"
  >
    <ul>
      <li class="ellipsis">It's ok if the text is short</li>
      <li class="ellipsis">But when the text goes long</li>
      <li class="ellipsis">eg:</li>
      <li class="ellipsis">
        I am a long long long long long long long long long long long long long
        long text
      </li>
      <li class="ellipsis">That's it</li>
    </ul>
    <template #resizer-left>
      <span class="emoji-resizer">🤪</span>
    </template>
  </ResizableContainer>
</template>

<script setup lang="ts">
import { ResizableContainer } from '@vite-styleguidist/components'
</script>

<style>
.container {
  width: 220px;
  border: 1px dashed #eee;
  float: right;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
ul {
  list-style: none;
  padding: 15px;
  margin: 0;
}
.emoji-resizer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  position: absolute;
  left: -12px;
  top: calc(50% - 12px);
  font-size: 24px;
  cursor: col-resize;
  transform: rotate(0deg);
}
.emoji-resizer:hover {
  transform: rotate(720deg);
  transition: transform 0.6s;
}
</style>
```

## persistent the container's size

drag the right edge, and refresh the page.

```vue
<template>
  <ResizableContainer
    sides="right, bottom"
    :min-width="120"
    :max-width="640"
    persistentKey="MY_UNIQUE_KEY"
    class="container"
  >
    <ul>
      <li class="ellipsis">It's ok if the text is short</li>
      <li class="ellipsis">But when the text goes long</li>
      <li class="ellipsis">eg:</li>
      <li class="ellipsis">
        I am a long long long long long long long long long long long long long
        long text
      </li>
      <li class="ellipsis">That's it</li>
    </ul>
  </ResizableContainer>
</template>

<script setup lang="ts">
import { ResizableContainer } from '@vite-styleguidist/components'
</script>

<style>
.container {
  width: 220px;
  border: 1px dashed #eee;
  overflow: hidden;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
ul {
  list-style: none;
  padding: 10px;
  margin: 0;
}
</style>
```
