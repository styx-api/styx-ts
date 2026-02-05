<!-- components/PassToggles.svelte -->
<script lang="ts">
  interface Props {
    passes: {
      flatten: boolean;
      simplify: boolean;
      removeEmpty: boolean;
      canonicalize: boolean;
    };
  }

  let { passes = $bindable() }: Props = $props();
</script>

<div class="pass-toggles">
  <h3>Optimization Passes</h3>
  <div class="toggles">
    <label>
      <input type="checkbox" bind:checked={passes.flatten} />
      <span>Flatten</span>
    </label>
    <label>
      <input type="checkbox" bind:checked={passes.simplify} />
      <span>Simplify</span>
    </label>
    <label>
      <input type="checkbox" bind:checked={passes.removeEmpty} />
      <span>Remove Empty</span>
    </label>
    <label>
      <input type="checkbox" bind:checked={passes.canonicalize} />
      <span>Canonicalize</span>
    </label>
  </div>
</div>

<style>
  .pass-toggles {
    padding: 1rem;
    border: 1px solid #333;
    border-radius: 4px;
    background: #0d0d0d;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #888;
  }

  .toggles {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 14px;
  }

  label:hover span {
    color: #fff;
  }

  input[type="checkbox"] {
    cursor: pointer;
  }

  span {
    color: #ccc;
    transition: color 0.15s;
  }
</style>