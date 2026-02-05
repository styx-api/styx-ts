<!-- components/CodeBlock.svelte -->
<script lang="ts">
  import { createHighlighter, type Highlighter, type BundledLanguage } from 'shiki';
  import { onMount } from 'svelte';

  interface Props {
    code: string;
    lang?: BundledLanguage | 'ir' | 'bindings';
  }

  let { code, lang = 'json' }: Props = $props();
  let highlighter = $state<Highlighter | null>(null);
  let grammarsLoaded = $state(false);
  let html = $state('');

  const irGrammar = {
    name: 'ir',
    scopeName: 'source.ir',
    patterns: [
      // Metadata in brackets [name]
      {
        name: 'entity.name.tag.ir',
        match: '\\[[^\\]]+\\]',
      },
      // Attributes in braces {key=value}
      {
        name: 'meta.block.ir',
        begin: '\\{',
        end: '\\}',
        patterns: [
          {
            name: 'variable.parameter.ir',
            match: '\\b[a-z_]+(?==)',
          },
          {
            name: 'keyword.operator.ir',
            match: '=',
          },
          {
            name: 'constant.numeric.ir',
            match: '\\b\\d+\\b',
          },
        ],
      },
      // Range constraints (0..1)
      {
        name: 'meta.range.ir',
        match: '\\(([\\d.-]+)\\.\\.([\\d.-]+|∞)\\)',
      },
      // String literals
      {
        name: 'string.quoted.double.ir',
        match: '"[^"]*"',
      },
      // Node kinds
      {
        name: 'keyword.control.ir',
        match: '\\b(sequence|alternative|optional|repeat|literal|int|float|str|path)\\b',
      },
      // Join keyword
      {
        name: 'variable.parameter.ir',
        match: '\\bjoin\\b',
      },
      // Numbers
      {
        name: 'constant.numeric.ir',
        match: '\\b-?\\d+(?:\\.\\d+)?\\b',
      },
    ],
  };

  const bindingsGrammar = {
    name: 'bindings',
    scopeName: 'source.bindings',
    patterns: [
      // Type keywords
      {
        name: 'storage.type.bindings',
        match: '\\b(struct|union|optional|list|bool|count|literal|int|float|str|path)\\b',
      },
      // Field names before colon
      {
        name: 'variable.other.property.bindings',
        match: '\\b[a-zA-Z_]\\w*(?=:)',
      },
      // String literals
      {
        name: 'string.quoted.double.bindings',
        match: '"[^"]*"',
      },
      // Numbers
      {
        name: 'constant.numeric.bindings',
        match: '\\b\\d+\\b',
      },
      // Union pipe
      {
        name: 'keyword.operator.bindings',
        match: '\\|',
      },
      // Angle brackets
      {
        name: 'punctuation.definition.typeparameters.bindings',
        match: '[<>]',
      },
    ],
  };

  onMount(async () => {
    try {
      highlighter = await createHighlighter({
        themes: ['github-dark'],
        langs: ['json'],
      });

      // Load custom grammars
      await highlighter.loadLanguage(irGrammar as any);
      await highlighter.loadLanguage(bindingsGrammar as any);
      
      grammarsLoaded = true;
    } catch (e) {
      console.error('Failed to load highlighter:', e);
    }
  });

  $effect(() => {
    if (highlighter && grammarsLoaded && code) {
      try {
        html = highlighter.codeToHtml(code, {
          lang: lang as any,
          theme: 'github-dark',
        });
      } catch (e) {
        console.error('Highlighting failed:', e);
        html = `<pre><code>${escapeHtml(code)}</code></pre>`;
      }
    } else if (code) {
      // Fallback while loading
      html = `<pre><code>${escapeHtml(code)}</code></pre>`;
    }
  });

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
</script>

{#if html}
  <div class="code-block">
    {@html html}
  </div>
{:else}
  <pre><code>{code}</code></pre>
{/if}

<!-- components/CodeBlock.svelte -->
<style>
  .code-block {
    height: 100%;
    overflow: auto;
  }

  .code-block :global(pre) {
    margin: 0;
    padding: 1rem;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 13px;
    background: transparent !important;
    min-height: 100%;
  }

  .code-block :global(code) {
    font-family: inherit;
  }

  pre {
    margin: 0;
    padding: 1rem;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 13px;
    color: #ddd;
    min-height: 100%;
  }
</style>