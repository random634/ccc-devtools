<script setup lang="ts">
import TreePanel from './components/TreePanel.vue';
import ProfilerPanel from './components/ProfilerPanel.vue';
import Utils from './misc/Utils';
import { ref } from 'vue';
let showProfiler = ref(false);

window.addEventListener('showProfiler', (_: any) => {
  showProfiler.value = !showProfiler.value;
});

const intervalId = setInterval(() => {
  // @ts-ignore
  if (window['cc'] && cc.game.inited && cc.director.getScene()) {
    clearInterval(intervalId);
    window.dispatchEvent(new CustomEvent('cccDevtoolsInit'));
    showProfiler.value = Utils.isShowingStates();
  }
}, 1000);


// 解决ERROR ResizeObserver loop completed with undelivered notifications.
const debounce = (fn: Function, delay: number) => {
  let timer: number | null = null;
  return function () {
    // @ts-ignore
    let context = this as any;
    let args = arguments;
    clearTimeout(timer!);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  }
}
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
 constructor(callback: any) {
   callback = debounce(callback, 16);
   super(callback);
 }
}
</script>

<template>
  <div>
    <vue-final-modal v-if="showProfiler" classes="modal-container" content-class="modal-content" :hide-overlay="true"
      :click-to-close="false" :prevent-click="true" :drag="true" :fit-parent="true" drag-selector=".modal-drag">
      <ProfilerPanel></ProfilerPanel>
    </vue-final-modal>
  </div>
  <el-card :body-style="{ padding: 0 }" style="margin: 10px;">
    <TreePanel :show="true"></TreePanel>
  </el-card>
  <el-link type="primary" href="https://github.com/potato47/ccc-devtools" target="_blank" style="position:absolute;left: 5px;bottom: 5px;">ccc-devtools</el-link>
</template>

<style scoped>
:deep(.modal-container) {
  display: flex;
  justify-content: end;
  align-items: start;
}

:deep(.modal-content) {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  border: 1px solid cadetblue;
  background: #171920;
}
</style>

