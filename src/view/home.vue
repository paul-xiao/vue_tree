<template>
  <div id="home">
    <Tree :data ="tree" />
  </div>
</template>
<script>
import Tree from '../components/tree'
export default {
  name: 'Home',
  components: {
    [Tree.name]: Tree
  },
  data() {
    return {
      tree: [
        {
          id: 'device',
          name: 'device',
          type: 'device',
          active: false,
          expanded: true,
          children: [],
          dropdown: [
            {
              icon: 'storage-icon icon_add_device',
              value: 'add_device',
              label: 'add_device'
            },
            {
              icon: 'storage-icon icon_help_center',
              value: 'help_center',
              label: 'go_help'
            },
            {
              icon: 'storage-icon icon_turn_off',
              value: 'turn_off',
              label: 'turn_off_device'
            }
          ],
          onCommand: cmd => {
            console.log(cmd)
          },
          onExpand: (node, vm) => {
            if (vm.expanded) {
              const children = this.getChildNode(node)
              if (children.length) {
                node.children = children
              } else {
                vm.loading = true
                this.$store.dispatch(node.id == 'device' ? 'GET_TA_ROOT' : node.type == 'd' ? 'GET_PINNED_CHILDREN' : 'GET_STORAGE_CHILDREN', node).then(() => {
                  node.children = this.getChildNode(node)
                  vm.loading = false
                }).catch(e => {
                  vm.loading = false
                })
              }
            }
          }
        },
        {
          id: 'other_storage',
          name: 'other_storage',
          type: 'other-storage',
          active: false,
          expanded: true,
          children: [
            {
              id: 'googledrive',
              name: 'google_drive',
              type: 'googledrive',
              dropdown: [
                {
                  value: 'googledrive',
                  label: 'add_google_drive'
                }
              ],
              onClick: () => {
                console.log('googledrive')
              }
            },
            {
              id: 'dropbox',
              name: 'dropbox',
              type: 'dropbox',
              dropdown: [
                {
                  value: 'dropbox',
                  label: 'add_dropbox'
                }
              ],
              onClick: () => {
                console.log('dropbox')
              }
            },
            {
              id: 'onedrive',
              name: 'onedrive',
              type: 'onedrive',
              dropdown: [
                {
                  value: 'onedrive',
                  label: 'add_onedrive'
                }
              ],
              onClick: () => {
                console.log('onedrive')
              }
            }
          ],
          onCommand: cmd => {
            console.log(cmd)
          }
        },
        {
          id: 'shared',
          name: 'shared',
          type: 'shared',
          onClick: () => {
            console.log(this)
          }
        },
        {
          id: 'list',
          name: 'lists',
          type: 'list',
          onClick: () => {
            console.log(this)
          }
        },
        {
          id: 'backup',
          name: 'backups',
          type: 'backup',
          onClick: () => {
            console.log(this)
          }
        },
        {
          id: 'file_backup',
          name: 'file_backups',
          type: 'list',
          onClick: () => {
            console.log(this)
          }
        },
        {
          id: 'trash',
          name: 'trash',
          type: 'trash',
          onClick: () => {
            console.log(this)
          }
        }
      ],
      newdata: {

      }
    }
  },
  computed: {
    folders() {
      return [
        this.newdata,
        ...this.tree

      ]
    }
  },
  watch: {
    folders(val) {
      console.log(val)
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      console.log(this.folders)
    },
    add(node) {
      this.newdata.name = '2222232'
    },
    update(node) {

    }
  }
}
</script>

<style>
.tree {
  text-align: left;
}
</style>
