import './assets/index.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useUserStore } from './stores/user';

const app = createApp(App);

app.use(createPinia());

const user = useUserStore();
await user.initialize();

app.use(router);

app.mount('#app');
