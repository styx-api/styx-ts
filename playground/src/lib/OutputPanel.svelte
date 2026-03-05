<!-- components/OutputPanel.svelte -->
<script lang="ts">
  import {
    format,
    solve,
    formatSolveResult,
    JsonSchemaBackend,
    createContext,
  } from "@styx/core";
  import type { ParseResult } from "@styx/core";
  import Messages from "./Messages.svelte";
  import CodeBlock from "./CodeBlock.svelte";

  interface Props {
    result: { ok: true; value: ParseResult } | { ok: false; error: string };
  }

  let { result }: Props = $props();
  let activeTab = $state<"ir" | "bindings" | "schema">("ir");

  const jsonSchemaBackend = new JsonSchemaBackend();

  function getSchemaJson(parseResult: ParseResult): string {
    const solveResult = solve(parseResult.expr);
    const ctx = createContext(parseResult.expr, solveResult, {
      app: parseResult.meta,
    });
    const emitResult = jsonSchemaBackend.emit(ctx);
    return emitResult.files.get("schema.json") ?? "{}";
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

    <div class="tab-bar">
      <button
        class="tab"
        class:active={activeTab === "ir"}
        onclick={() => (activeTab = "ir")}
      >
        IR
      </button>
      <button
        class="tab"
        class:active={activeTab === "bindings"}
        onclick={() => (activeTab = "bindings")}
      >
        Bindings
      </button>
      <button
        class="tab"
        class:active={activeTab === "schema"}
        onclick={() => (activeTab = "schema")}
      >
        JSON Schema
      </button>
    </div>

    <section class="panel">
      {#if activeTab === "ir"}
        <CodeBlock code={format(expr)} lang="ir" />
      {:else if activeTab === "bindings"}
        <CodeBlock code={formatSolveResult(solve(expr), expr)} lang="bindings" />
      {:else}
        <CodeBlock code={getSchemaJson(result.value)} lang="json" />
      {/if}
    </section>
  {:else}
    <Messages type="errors" messages={[{ message: result.error }]} />
  {/if}
</div>

<!-- components/OutputPanel.svelte -->
<style>
  .output {
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow-y: auto;
    min-height: 0;
  }

  .tab-bar {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #333;
    flex-shrink: 0;
  }

  .tab {
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: #888;
    cursor: pointer;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.15s;
  }

  .tab:hover {
    color: #ccc;
  }

  .tab.active {
    color: #fff;
    border-bottom-color: #58a6ff;
  }

  .panel {
    flex: 1;
    min-height: 0;
    border: 1px solid #333;
    border-top: none;
    border-radius: 0 0 4px 4px;
    background: #0d0d0d;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
</style>
