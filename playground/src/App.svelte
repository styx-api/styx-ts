<script lang="ts">
import { compile } from "@styx/core";

let input = $state<string>("");

const result = $derived.by(() => {
  try {
    return { ok: true as const, value: compile(input) };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
});
</script>

<main>
  <h1>Styx Playground</h1>
  <div class="panels">
    <div class="panel">
      <h2>Input</h2>
      <textarea bind:value={input} placeholder="Enter your input here..."></textarea>
    </div>
    <div class="panel">
      <h2>Output</h2>
      <pre class:error={!result.ok}>{result.ok ? result.value.output : result.error}</pre>
    </div>
  </div>
</main>

<style>
:global(body) {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #1a1a1a;
  color: #eee;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin: 0 0 1.5rem;
}

h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #888;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  height: calc(100vh - 10rem);
}

.panel {
  display: flex;
  flex-direction: column;
}

textarea,
pre {
  flex: 1;
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: #0d0d0d;
  color: #eee;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 14px;
  resize: none;
}

textarea:focus {
  outline: none;
  border-color: #666;
}

pre {
  margin: 0;
  overflow: auto;
  white-space: pre-wrap;
}

pre.error {
  color: #f66;
}
</style>
