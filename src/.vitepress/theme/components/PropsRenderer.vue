<template>
  <div className="ivp-api-doc-section">
    <h3>Props</h3>
    <table>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Default Vaule</th>
      </tr>
      <tr v-for="prop in props.data" :key="prop.name">
        <td>
          <code>{{ prop.name }}</code>
        </td>
        <td>
          <p v-html="prop.description || '-'"></p>
          <div className="api-doc-tags" v-if="prop.tags">
            <ul v-for="tagGroup in prop.tags">
              <li>
                <ul v-for="tag in tagGroup">
                  <li>
                    <code v-if="tag.title">@{{ tag.title }}</code>
                    <code className="text-info" v-if="tag.name">{{
                      tag.name
                    }}</code>
                    <code
                      className="text-primary"
                      v-if="tag.type && tag.type.name"
                      >{{ tag.type.name }}</code
                    >
                    <span v-if="tag.description">{{ tag.description }}</span>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <p>
            type: <code className="text-primary">{{ prop.type.name }}</code>
          </p>
        </td>
        <td>
          <code>
            {{ prop.defaultValue.value }}
          </code>
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
