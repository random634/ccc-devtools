import { createApp } from 'vue';
import App from './App.vue';
import 'element-plus/theme-chalk/dark/css-vars.css';
import { createVfm } from 'vue-final-modal'

const vfm = createVfm()
createApp(App).use(vfm).mount('#dev-app');
