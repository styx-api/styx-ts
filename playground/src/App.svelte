<script lang="ts">
  import { compile, format, solve, formatSolveResult } from "@styx/core";
  import { createPipeline, flatten, simplify, removeEmpty, canonicalize } from "@styx/core";
  import InputPanel from "./lib/InputPanel.svelte";
  import OutputPanel from "./lib/OutputPanel.svelte";
  import PassToggles from "./lib/PassToggles.svelte";

  let input = $state<string>("");
  let passes = $state({
    flatten: true,
    simplify: true,
    removeEmpty: true,
    canonicalize: false,
  });

  const result = $derived.by(() => {
    try {
      const parseResult = compile(input);
      
      // Apply selected optimization passes
      const availablePasses = [];
      if (passes.flatten) availablePasses.push(flatten);
      if (passes.simplify) availablePasses.push(simplify);
      if (passes.removeEmpty) availablePasses.push(removeEmpty);
      if (passes.canonicalize) availablePasses.push(canonicalize);
      
      if (availablePasses.length > 0) {
        const pipeline = createPipeline(availablePasses, { fixpoint: true });
        const passResult = pipeline.apply(parseResult.expr);
        parseResult.expr = passResult.expr;
        
        if (passResult.warnings) {
          parseResult.warnings.push(...passResult.warnings.map(w => ({ message: w })));
        }
      }

      return { ok: true as const, value: parseResult };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
    }
  });
</script>

<div class="container">
  <header>
    <h1>Styx Compiler Explorer</h1>
    <PassToggles bind:passes />
  </header>
  
  <div class="panels">
    <div class="panel">
      <InputPanel bind:input />
    </div>
    <div class="panel">
      <OutputPanel {result} />
    </div>
  </div>
</div>

<style>
  
  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: #1a1a1a;
    color: #eee;
    overflow: hidden;
  }

  :global(*::-webkit-scrollbar) {
    width: 10px;
    height: 10px;
  }

  :global(*::-webkit-scrollbar-track) {
    background: #0d0d0d;
  }

  :global(*::-webkit-scrollbar-thumb) {
    background: #333;
    border-radius: 5px;
  }

  :global(*::-webkit-scrollbar-thumb:hover) {
    background: #444;
  }

  :global(*) {
    scrollbar-width: thin;
    scrollbar-color: #333 #0d0d0d;
  }

  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 1600px;
    margin: 0 auto;
    padding: 1.5rem;
    box-sizing: border-box;
  }

  header {
    flex-shrink: 0;
    margin-bottom: 1rem;
  }

  h1 {
    margin: 0 0 0.75rem;
    font-size: 1.5rem;
  }

  .panels {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    min-height: 0;
  }

  .panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
</style>