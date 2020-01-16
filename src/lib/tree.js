
class TreeNode {
  // {
  //   id: 'list',
  //   name: 'main.side.label_lists',
  //   type: 'list',
  //   onClick: () => {
  //     console.log(this)
  //   }
  // },
  constructor(data) {
    const { id, name, type } = data
    this.id = id
    this.name = name
    this.type = type
  }

  rename(name) {
    this.name = name
  }

  addChildren(children) {
    if (!this.children) {
      this.children = []
    }

    if (Array.isArray(children)) {
      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i]
        child.parent = this
        child.pid = this.id
      }
      this.children.concat(children)
    } else {
      const child = children
      child.parent = this
      child.pid = this.id
      this.children.push(child)
    }
  }
}

class Tree {
  constructor(data) {
    this.root = new TreeNode({ id: 0, name: 'root' })
    this.initNode(this.root, data)
    return this.root
  }

  initNode(node, data) {
    console.log(data)
    console.log('2222222222222')
    for (let i = 0, len = data.length; i < len; i++) {
      var _data = data[i]

      var child = new TreeNode(_data)
      if (_data.children && _data.children.length > 0) {
        this.initNode(child, _data.children)
      }
      node.addChildren(child)
    }
  }
}

const node = new Tree([
  {
    id: 1,
    isLeaf: false,
    name: 'Node 1',
    pid: 0,
    dragDisabled: true,
    addTreeNodeDisabled: true,
    addLeafNodeDisabled: true,
    editNodeDisabled: true,
    delNodeDisabled: true,
    children: [
      {
        id: 2,
        isLeaf: true,
        name: 'Node 1-2',
        pid: 1
      }
    ]
  },
  {
    id: 3,
    isLeaf: false,
    name: 'Node 2',
    pid: 0,
    disabled: true
  },
  {
    id: 4,
    isLeaf: false,
    name: 'Node 3',
    pid: 0
  }
])
console.log(node)
