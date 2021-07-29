<template>
  <v-row justify="center" align="center">
    <v-col cols="12">
      <v-card class="px-5 py-5">
        <component :is="wrapper.is">
          <DruxtEntity
            :schemaType="schemaType"
            :type="type"
            :uuid="uuid"
            v-model="model"
          />
        </component>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    model: null,
    type: 'node--article',
  }),

  computed: {
    uuid: ({ $route }) => $route.hash.substr(1),
    schemaType: ({ mode }) => mode === 'edit' ? 'form' : 'view',
    wrapper: ({ schemaType }) => ({
      is: schemaType === 'form' ? 'v-form' : 'div',
    }),

    ...mapState({
      mode: state => state.weaver.mode || 'view',
    })
  },

  watch: {
    '$route.hash'() {
      this.model = null
    }
  }
}
</script>
