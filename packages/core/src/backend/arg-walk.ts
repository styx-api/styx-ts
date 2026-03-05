import type { Binding } from "../bindings/index.js";
import type { Alternative, Expr, Optional, Repeat, Sequence } from "../ir/index.js";
import type { CodegenContext } from "../manifest/index.js";

/**
 * Visitor interface for walking IR trees during argument building.
 * Backends implement this to emit language-specific code.
 *
 * Each method returns T (typically a code string or expression).
 * The walker handles traversal; the visitor handles emission.
 */
export interface ArgVisitor<T> {
  /** A literal string token (no binding - always emitted as-is). */
  literal(value: string): T;

  /** A terminal node (int, float, str, path) with its binding. */
  terminal(binding: Binding): T;

  /** A sequence of resolved parts, with optional join separator. */
  sequence(parts: T[], join: string | undefined, binding: Binding | undefined): T;

  /** An optional node. The inner part is the walked child. */
  optional(inner: T, binding: Binding): T;

  /** A repeated node. The inner part is the walked child (for one iteration). */
  repeat(inner: T, join: string | undefined, binding: Binding): T;

  /** An alternative (union) node with walked variants. */
  alternative(variants: T[], binding: Binding): T;
}

/** Walk an IR Expr tree, calling visitor methods and resolving bindings from context. */
export function walkExprForArgs<T>(expr: Expr, ctx: CodegenContext, visitor: ArgVisitor<T>): T {
  function walk(node: Expr): T {
    switch (node.kind) {
      case "literal":
        return visitor.literal(node.attrs.str);

      case "int":
      case "float":
      case "str":
      case "path": {
        const binding = ctx.resolve(node);
        if (!binding) throw new Error(`Missing binding for terminal node: ${node.kind}`);
        return visitor.terminal(binding);
      }

      case "sequence":
        return walkSequence(node);

      case "optional":
        return walkOptional(node);

      case "repeat":
        return walkRepeat(node);

      case "alternative":
        return walkAlternative(node);
    }
  }

  function walkSequence(node: Sequence): T {
    const parts = node.attrs.nodes.map(walk);
    const binding = ctx.resolve(node);
    return visitor.sequence(parts, node.attrs.join, binding);
  }

  function walkOptional(node: Optional): T {
    const inner = walk(node.attrs.node);
    const binding = ctx.resolve(node);
    if (!binding) throw new Error("Missing binding for optional node");
    return visitor.optional(inner, binding);
  }

  function walkRepeat(node: Repeat): T {
    const inner = walk(node.attrs.node);
    const binding = ctx.resolve(node);
    if (!binding) throw new Error("Missing binding for repeat node");
    return visitor.repeat(inner, node.attrs.join, binding);
  }

  function walkAlternative(node: Alternative): T {
    const variants = node.attrs.alts.map(walk);
    const binding = ctx.resolve(node);
    if (!binding) throw new Error("Missing binding for alternative node");
    return visitor.alternative(variants, binding);
  }

  return walk(expr);
}
