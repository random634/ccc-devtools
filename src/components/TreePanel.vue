<template>
  <CacheDialog 
    :cache-args="cacheArgs"
  ></CacheDialog>
  <el-input v-model="filterText" style="width: 100%; height: 40px;" placeholder="Search Node" @input="onFilterChanged"/>
  <div style="width: 100%;" :style="{ height: treeViewHeight }">
    <el-tree-v2 ref="treeView" :props="defaultProps" empty-text="No Node" :highlight-current="true"
      :expand-on-click-node="false" :default-expanded-keys="expandedKeys" @current-change="handleCurrentNodeChange"
      @node-expand="handleNodeExpand" @node-collapse="handleNodeCollapse" :height="treeViewHeight" :filter-method="filterNode">
      <template #default="{ node }">
        <span :class="{ 'node-hide': !node.data.active }">{{ node.label }}</span>
      </template>
    </el-tree-v2>
  </div>
  <div style="width: 100%;border-top: 2px solid #414243;" :style="{ height: treeViewHeight }">
    <template v-if="updateKey !== 0 && Utils.checkNodeValid(currentNode)">
      <el-scrollbar>
        <CCNode :cc-node="currentNode" :update-key="updateKey"></CCNode>
        <div class="row" style="height: 2px;background-color: #1d1e21"></div>
        <template v-for="component in Utils.getComponents(currentNode)" :key="component.name">
          <CCComponent v-if="component.name.startsWith('cc.')" :component="component.target" :name="component.name"
            :update-key="updateKey"></CCComponent>
          <UserComponent v-else :component="component.target" :name="component.name" :update-key="updateKey">
          </UserComponent>
          <div class="row" style="height: 2px;background-color: #1d1e21"></div>
        </template>
      </el-scrollbar>
    </template>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue-demi';
import CCNode from './CCNode.vue';
import Utils, { ICacheArgs } from '../misc/Utils';
import CCComponent from './CCComponent.vue';
import UserComponent from './UserComponent.vue';
import CacheDialog from './CacheDialog.vue';

const props = defineProps({
  show: Boolean,
});

interface TreeNode {
  name: string;
  uuid: string;
  active: boolean;
  children?: TreeNode[];
  path: string[];
}

let updateKey = ref(1);
let currentNode: any;
const expandedNodeMap = new Map();
let expandedKeys: string[] = [];
const defaultProps = {
  value: 'uuid',
  label: 'name',
  children: 'children',
};


let cacheArgs = ref<ICacheArgs>({
  cacheDialog: false,
  cacheTitle: '',
  cacheData: [],
  cacheOnlyTexture: true,
  cacheSearchText: '',
});

const treeViewHeight = (window.innerHeight - 120 - 50) / 2;
const treeView = ref(null) as any;
const filterText = ref('');

window.addEventListener('openCacheDialog', (_: any) => {
  openCacheDialog();
});


function openCacheDialog() {
  const isVisible = !cacheArgs.value.cacheDialog;
  if (isVisible) {
    Utils.getTextureCache((result) => {
        cacheArgs.value.cacheTitle = result.cacheTile;
        cacheArgs.value.cacheData = result.cacheData;
    });
  }

  cacheArgs.value.cacheDialog = isVisible;
}

function getChildByUuidPath(node: any, path: string[], index: number): any {
  if (index >= path.length) {
    return node;
  }
  node = node.getChildByUuid(path[index]);
  return getChildByUuidPath(node, path, index + 1);
}

function handleCurrentNodeChange(data: any) {
  // @ts-ignore
  const ccNode = getChildByUuidPath(cc.director.getScene(), data.path, 0);
  if (data) {
    currentNode = ccNode;
  } else {
    currentNode = null;
  }
}

function handleNodeExpand(data: any) {
  expandedNodeMap.set(data.uuid, true);
  expandedKeys = [...expandedNodeMap.keys()];
}

function handleNodeCollapse(data: any) {
  expandedNodeMap.delete(data.uuid);
  expandedKeys = [...expandedNodeMap.keys()];
}

function setChildren(container: TreeNode[], children: any[], path: string[]) {
  children.forEach(ccNode => {
    const childPath = path.concat(ccNode.uuid);
    const node = {
      uuid: ccNode.uuid,
      name: ccNode.name,
      active: ccNode.activeInHierarchy,
      children: [],
      path: childPath,
    };
    if (ccNode.children && ccNode.children.length > 0) {
      setChildren(node.children, ccNode.children, childPath);
    }
    container.push(node);
  });
}

function refreshTree() {
  // @ts-ignore
  if (props.show && window.ccdevShow) {
    let nodes: TreeNode[] = [];
    //@ts-ignore
    setChildren(nodes, cc.director.getScene().children, []);
    treeView.value!.setData(nodes);
    updateKey.value = -updateKey.value;
  }
  window.requestAnimationFrame(refreshTree);
}

function init() {
  refreshTree();
}

function filterNode(value: string, node: TreeNode) {
  if (!value) return true;
  let nameOrigin = node.name.toLowerCase();
  return nameOrigin.includes(value.toLowerCase());
}

function onFilterChanged(value: string) {
  treeView.value!.filter(value);

  if (!value) {
    expandedNodeMap.clear();
    expandedKeys = [];
    const tree = treeView.value!;
    tree.setExpandedKeys(expandedKeys);
  }
}

window.addEventListener('cccDevtoolsInit', (_: any) => {
  console.log('ccc-devtools init');
  init();
});

const getUuid = (node: any, func: (uuid: string) => void) => {
  if (node.parent) {
    getUuid(node.parent, func);
  }else{
    // 没有parent就是scene了，直接返回
    return;
  }

  if (node.uuid) {
    func(node.uuid);
  }
};

window.addEventListener('cccDevtoolsFocusNode', (data: any) => {
  const node = data.detail;
  const key = node.uuid;
  const tree = treeView.value!;
  const treeNode = tree.getNode(key);
  if (!treeNode) {
    return;
  }

  getUuid(node.parent, (nodeUuid: string) => {
    expandedNodeMap.set(nodeUuid, true);
  });

  expandedKeys = [...expandedNodeMap.keys()];

  tree.setExpandedKeys(expandedKeys);
  tree.setCurrentKey(key);
  handleCurrentNodeChange(treeNode.data);
});

</script>

<style>
.row {
  display: flex;
  justify-content: center;
  margin: 10px;
}

.el-input__inner {
  text-align: left !important;
}

.el-input__wrapper {
  padding-left: 10px !important;
}

.el-color-picker {
  flex: 1 !important;
}

.el-color-picker__trigger {
  width: 100% !important;
}

.el-tree-virtual-list {
  overflow-y: hidden !important;
}

span {
  color: #cfd3dc;
}

.node-hide {
  opacity: 0.3;
}
</style>
