<template>
  <div className="ivp-api-doc">
    <PropsRenderer
      v-if="isNotEmptyArray(compMeta.props)"
      :data="compMeta.props"
    />
    <EventsRenderer
      v-if="isNotEmptyArray(compMeta.events)"
      :data="compMeta.events"
    />
    <SlotsRenderer
      v-if="isNotEmptyArray(compMeta.slots)"
      :data="compMeta.slots"
    />
    <ExposesRenderer
      v-if="isNotEmptyArray(compMeta.expose)"
      :data="compMeta.expose"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ComponentDoc } from 'vue-docgen-api'
import { atou } from '@/utils'

const props = defineProps<{ data: string }>()
const compMeta = JSON.parse(atou(props.data)) as ComponentDoc
function isNotEmptyArray(data: any): boolean {
  return Array.isArray(data) && data.length > 0
}
</script>

<style lang="scss">
.ivp-api-doc {
  table {
    th,
    td {
      font-size: 12px;
    }
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  code {
    margin-right: 5px;
  }
  code.text-info {
    color: var(--vp-custom-block-warning-text);
  }
  code.text-primary {
    color: var(--vp-c-brand);
  }
}
</style>
