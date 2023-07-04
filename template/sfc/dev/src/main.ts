import { createApp } from "vue";

// Using import aliases in Vite
import MyLibrary from "package-name";
import App from "./App.vue";

const app = createApp(App);
app.use(MyLibrary);

app.mount("#app");
