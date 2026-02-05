<!-- components/Messages.svelte -->
<script lang="ts">
  interface Message {
    message: string;
    location?: { file?: string; line?: number; column?: number };
  }

  interface Props {
    type: "errors" | "warnings";
    messages: Message[];
  }

  let { type, messages }: Props = $props();

  function formatLocation(loc?: { file?: string; line?: number; column?: number }) {
    if (!loc) return "";
    const parts = [loc.file, loc.line && `line ${loc.line}`, loc.column && `col ${loc.column}`];
    return parts.filter(Boolean).join(", ");
  }
</script>

<section class="messages {type}">
  <h2>{type === "errors" ? "Errors" : "Warnings"} ({messages.length})</h2>
  {#each messages as msg}
    <div class="message">
      <span class="msg-text">{msg.message}</span>
      {#if msg.location}
        <span class="msg-loc">{formatLocation(msg.location)}</span>
      {/if}
    </div>
  {/each}
</section>

<style>
  section {
    border: 1px solid #333;
    border-radius: 4px;
    background: #0d0d0d;
  }

  h2 {
    margin: 0;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #333;
    background: #151515;
    border-radius: 4px 4px 0 0;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #888;
  }

  .errors h2 {
    color: #f66;
  }

  .warnings h2 {
    color: #fa0;
  }

  .message {
    padding: 0.5rem 1rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 13px;
  }

  .message + .message {
    border-top: 1px solid #222;
  }

  .errors .msg-text {
    color: #f66;
  }

  .warnings .msg-text {
    color: #fa0;
  }

  .msg-loc {
    color: #666;
    white-space: nowrap;
  }
</style>