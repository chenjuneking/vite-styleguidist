<template>
  <div className="ivp-api-doc-section">
    <h3>Events</h3>
    <table>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Properties</th>
      </tr>
      <tr v-for="event in props.data" :key="event.name">
        <td>
          <code>{{ event.name }}</code>
        </td>
        <td>
          <p v-html="event.description || '-'"></p>
        </td>
        <td>
          <ul
            v-if="
              Array.isArray(event.properties) && event.properties.length > 0
            "
          >
            <li v-for="property in event.properties" :key="property.name">
              <code className="text-info">{{ property.name }}</code
              >:
              <code className="text-primary">{{
                property.type.names.join('')
              }}</code>
              <code v-if="property.description">{{
                property.description
              }}</code>
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
