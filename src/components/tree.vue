
<template>
    <div class="tree">
      <tree-item :data="data"/>
    </div>
</template>

<script>
import TreeItem from './tree-item'
import { mapGetters } from 'vuex'
export default {
  name: 'Tree',
  components: {
    [TreeItem.name]: TreeItem
  },
  data() {
    return {

    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['folders'])
  },
  created() {
    //
  },
  methods: {
    init() {
      this.$store.commit('INIT_FOLDER')
    },
    add(node) {
      this.$store.commit('ADD_FOLDER', node)
    }
  }
}
</script>

<style>
.tree {
  text-align: left;
}
</style>
