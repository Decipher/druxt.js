<template>
  <v-app>
    <v-navigation-drawer
      fixed
      app
      v-model="drawer"
    >
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            Articles
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <DruxtView view-id="content" display-id="page_1">
        <template #default="{ results }">
          <v-treeview
            activatable
            dense
            hoverable
            :items="treeItems(results)"
            @update:active="onUpdateActive"
          />
        </template>
      </DruxtView>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn icon>
        <v-icon @click="setMode('view')">mdi-file-find</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon @click="setMode('edit')">mdi-pencil</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer
      :absolute="true"
      app
    >
      <span><a href="https://druxtjs.org" target="_blank">DruxtJS.org</a></span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  data: ({ $route }) => ({
    drawer: true,
  }),

  computed: {
    title: ({ articles, uuid }) => ['DruxtWeaver', articles && uuid && articles[uuid].data.attributes.title].filter((o) => o).join(' - '),

    ...mapState({
      // active: state => state.weaver.active || {},
      // articles: state => state.druxt.resources['node--article'] || null,
    })
  },

  methods: {
    onUpdateActive(active) {
      const uuid = active.pop()
      this.setActive(uuid)
      this.$router.push({ hash: uuid })
    },

    treeItems(results) {
      return results.map((o) => ({
        id: o.id,
        name: o.attributes.title,
      }))
    },

    ...mapMutations({
      setActive: 'weaver/setActive',
      setMode: 'weaver/setMode',
    })
  }
}
</script>
