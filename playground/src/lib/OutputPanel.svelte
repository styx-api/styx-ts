<!-- components/OutputPanel.svelte -->
<script lang="ts">
  import { format, solve, formatSolveResult } from "@styx/core";
  import type { ParseResult } from "@styx/core";
  import Messages from "./Messages.svelte";
  import CodeBlock from "./CodeBlock.svelte";

  interface Props {
    result: { ok: true; value: ParseResult } | { ok: false; error: string };
  }

  let { result }: Props = $props();
  let irSize = $state(50);
  
  function setFocus(section: "ir" | "bindings") {
    if (section === "ir") {
      irSize = irSize === 75 ? 50 : 75;
    } else {
      irSize = irSize === 25 ? 50 : 25;
    }
  }
</script>

<div class="output">
  {#if result.ok}
    {@const { expr, errors, warnings } = result.value}
    
    {#if errors.length > 0}
      <Messages type="errors" messages={errors} />
    {/if}

    {#if warnings.length > 0}
      <Messages type="warnings" messages={warnings} />
    {/if}

    <div class="sections" style="--ir-size: {irSize}%">
      <section class="ast">
        <div class="header">
          <h2>IR</h2>
          <button 
            class="focus-btn" 
            onclick={() => setFocus("ir")}
            title={irSize === 75 ? "Reset" : "Expand IR"}
          >
            {irSize === 75 ? "↕" : "↑"}
          </button>
        </div>
        <CodeBlock code={format(expr)} lang="ir" />
      </section>

      <section class="ast">
        <div class="header">
          <h2>Bindings</h2>
          <button 
            class="focus-btn" 
            onclick={() => setFocus("bindings")}
            title={irSize === 25 ? "Reset" : "Expand Bindings"}
          >
            {irSize === 25 ? "↕" : "↑"}
          </button>
        </div>
        <CodeBlock code={formatSolveResult(solve(expr), expr)} lang="bindings" />
      </section>
    </div>
  {:else}
    <Messages type="errors" messages={[{ message: result.error }]} />
  {/if}
</div>

<!-- components/OutputPanel.svelte -->
<style>
  .output {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    min-height: 0;
  }

  h2 {
    margin: 0;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #888;
  }

  .sections {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    min-height: 0;
  }

  section {
    border: 1px solid #333;
    border-radius: 4px;
    background: #0d0d0d;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .sections > section:first-child {
    height: var(--ir-size);
    transition: height 0.3s ease;
  }

  .sections > section:last-child {
    height: calc(100% - var(--ir-size) - 1rem);
    transition: height 0.3s ease;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #333;
    background: #151515;
    border-radius: 4px 4px 0 0;
    flex-shrink: 0;
  }

  .focus-btn {
    background: transparent;
    border: 1px solid #444;
    border-radius: 3px;
    color: #888;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    font-size: 12px;
    transition: all 0.15s;
  }

  .focus-btn:hover {
    border-color: #666;
    color: #ccc;
  }
</style>