import { mount } from "svelte";
import App from "./App.svelte";

// biome-ignore lint/style/noNonNullAssertion: Always exists
mount(App, { target: document.getElementById("app")! });
