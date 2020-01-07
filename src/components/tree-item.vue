
<template>
    <ul class="tree">
      <li v-for="item in folders" :key="item.id">
        {{item.name}}
         <template>
           <tree-item :data="data.children"></tree-item>
         </template>
      </li>
    </ul>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "TreeItem",
  data() {
    return {
     
    };
  },
  computed: {
    ...mapGetters(["folders"])
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.$store.commit("INIT_FOLDER");
      this.add(this.data[0]);
    },
    add(node) {
      this.$store.commit("ADD_FOLDER", node);
    }
  }
};
</script>

<style>
.tree {
  text-align: left;
}
</style>
