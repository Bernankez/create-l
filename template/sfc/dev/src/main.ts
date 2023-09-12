import { createApp } from "vue";

// Using import aliases in Vite
import __LibraryName__ from "__package-name__";
import App from "./App.vue";

const app = createApp(App);
app.use(__LibraryName__);

app.mount("#app");
