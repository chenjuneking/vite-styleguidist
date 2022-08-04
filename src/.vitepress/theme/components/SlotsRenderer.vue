<template>
  <div className="ivp-api-doc-section">
    <h3>Slots</h3>
    <table>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Bindings</th>
      </tr>
      <tr v-for="slot in props.data" :key="slot.name">
        <td>
          <code>{{ slot.name }}</code>
        </td>
        <td>
          <p v-html="slot.description || '-'"></p>
        </td>
        <td>
          <ul v-if="Array.isArray(slot.bindings) && slot.bindings.length > 0">
            <li v-for="binding in slot.bindings" :key="binding.name">
              <code className="text-info">{{ binding.name }}</code
              >:
              <code className="text-primary">{{ binding.type.name }}</code>
              <code v-if="binding.description">{{ binding.description }}</code>
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
</script>
