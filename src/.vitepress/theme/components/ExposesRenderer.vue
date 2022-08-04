<template>
  <div className="ivp-api-doc-section">
    <h3>Exposes</h3>
    <table>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Arguments</th>
      </tr>
      <tr v-for="expose in props.data" :key="expose.name">
        <td>
          <code>{{ expose.name }}</code>
          <span v-if="isFunction(expose)"
            >:
            <code className="text-primary">function</code>
          </span>
        </td>
        <td>
          <p v-html="expose.description || '-'"></p>
        </td>
        <td>
          <ul v-if="Array.isArray(expose.tags) && expose.tags.length > 0">
            <li v-for="tag in expose.tags" :key="tag.name">
              <code>@{{ tag.title }}</code>
              <code className="text-info" v-if="tag.name">{{ tag.name }}</code
              >:
              <code className="text-primary">{{
                tag.type?.name || 'unknown'
              }}</code>
              <code v-if="tag.description">{{ tag.description }}</code>
            </li>
          </ul>
          <p v-else>-</p>
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any
}>()

function isFunction(espose: any) {
  const { tags } = espose
  if (!Array.isArray(tags)) return false
  return tags.some(
    (tag: any) =>
      tag.title === 'param' || tag.title === 'arg' || tag.title === 'returns'
  )
}
</script>
