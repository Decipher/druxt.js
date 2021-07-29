<template>
  <v-col>
    <!-- Text fields -->
    <v-text-field v-if="field.isText" v-model="model" v-bind="props" />

    <!-- Boolean fields -->
    <v-switch v-else-if="field.isBoolean" v-model="model" v-bind="props" />

    <!-- Date/Time fields -->
    <!-- <v-menu
      ref="picker"
      v-else-if="field.isDateTime"
      :close-on-content-click="false"
      v-model="picker"
    >
      <template #activator="{ on, attrs }">
        <v-text-field readonly v-bind="attrs" v-on="on" />
        <v-time-picker v-if="picker" />
      </template>
    </v-menu> -->

    <wysiwyg v-else-if="value.format" v-model="model.processed" />

    <!-- Other fields -->
    <!-- <v-textarea v-else :value="JSON.stringify(value, null, '  ')" v-bind="props" /> -->
  </v-col>
</template>

<script>
import { DruxtEntityMixin } from 'druxt-entity/dist/mixins/entity'

export default {
  mixins: [DruxtEntityMixin],

  data: ({ value }) => ({
    picker: false,
  }),

  computed: {
    field: ({ $parent }) => $parent,
    props: ({ $parent }) => ({
      label: $parent.label.text,
    })
  }
}
</script>
