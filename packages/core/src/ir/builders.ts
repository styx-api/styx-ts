import type { NodeMeta } from "./meta.js";
import type {
  Alternative,
  Expr,
  Float,
  Int,
  Literal,
  Optional,
  Path,
  Repeat,
  Sequence,
  Str,
} from "./node.js";

// -- Terminals --

export function lit(str: string): Literal {
  return { kind: "literal", attrs: { str } };
}

export function str(meta?: NodeMeta | string): Str {
  return { kind: "str", attrs: {}, meta: normalizeMeta(meta) };
}

export function int(meta?: NodeMeta | string): Int {
  return { kind: "int", attrs: {}, meta: normalizeMeta(meta) };
}

export function float(meta?: NodeMeta | string): Float {
  return { kind: "float", attrs: {}, meta: normalizeMeta(meta) };
}

export function path(meta?: NodeMeta | string): Path {
  return { kind: "path", attrs: {}, meta: normalizeMeta(meta) };
}

// -- Structural --

export function seq(...nodes: Expr[]): Sequence {
  return { kind: "sequence", attrs: { nodes } };
}

export function seqJoin(join: string, ...nodes: Expr[]): Sequence {
  return { kind: "sequence", attrs: { nodes, join } };
}

export function opt(node: Expr, meta?: NodeMeta | string): Optional {
  return { kind: "optional", attrs: { node }, meta: normalizeMeta(meta) };
}

export function rep(node: Expr, meta?: NodeMeta | string): Repeat {
  return { kind: "repeat", attrs: { node }, meta: normalizeMeta(meta) };
}

export function repJoin(join: string, node: Expr, meta?: NodeMeta | string): Repeat {
  return { kind: "repeat", attrs: { node, join }, meta: normalizeMeta(meta) };
}

export function alt(...alts: Expr[]): Alternative {
  return { kind: "alternative", attrs: { alts } };
}

// -- Helpers --

function normalizeMeta(meta: NodeMeta | string | undefined): NodeMeta | undefined {
  if (meta === undefined) return undefined;
  if (typeof meta === "string") return { name: meta };
  return meta;
}
