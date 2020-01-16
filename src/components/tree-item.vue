
<template>
    <ul class="tree">
      <li v-for="item in data" :key="item.id">
        {{item.name}}
        <button>add children</button>
        <button>rename</button>
        <button>delete</button>
         <template>
           <tree-item :data="item.children"></tree-item>
         </template>
      </li>
    </ul>
</template>

<script>
export default {
  name: 'TreeItem',
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
  created() {
    // this.init()
  },
  methods: {

  }
}
</script>

<style>
.tree {
  text-align: left;

}
li{
  margin: 10px 0;
}
button{
margin: 0 5px;
}
</style>
