import type { NodeMeta } from "./meta.js";
import type { MediaTypeIdentifier } from "./types.js";

/** Base structure for all IR nodes */
interface BaseNode<K extends string, Attrs> {
  kind: K;
  meta?: NodeMeta;
  attrs: Attrs;
}

// Structural nodes

export type Literal = BaseNode<
  "literal",
  {
    str: string;
  }
>;

export type Sequence = BaseNode<
  "sequence",
  {
    nodes: Expr[];
    join?: string;
  }
>;

export type Optional = BaseNode<
  "optional",
  {
    node: Expr;
  }
>;

export type Alternative = BaseNode<
  "alternative",
  {
    alts: Expr[];
  }
>;

export type Repeat = BaseNode<
  "repeat",
  {
    node: Expr;
    join?: string;
    countMin?: number;
    countMax?: number;
  }
>;

// Terminal nodes

export type Int = BaseNode<
  "int",
  {
    minValue?: number;
    maxValue?: number;
  }
>;

export type Float = BaseNode<
  "float",
  {
    minValue?: number;
    maxValue?: number;
  }
>;

export type Str = BaseNode<"str", Record<string, never>>;

export type Path = BaseNode<
  "path",
  {
    resolveParent?: boolean;
    mutable?: boolean;
    mediaTypes?: MediaTypeIdentifier[];
  }
>;

// Union types

export type StructuralNode = Sequence | Optional | Alternative | Repeat;
export type Terminal = Literal | Int | Float | Str | Path;
export type Expr = StructuralNode | Terminal;

// Type guards

export function isTerminal(expr: Expr): expr is Terminal {
  return ["literal", "int", "float", "str", "path"].includes(expr.kind);
}

export function isStructural(expr: Expr): expr is StructuralNode {
  return ["sequence", "optional", "alternative", "repeat"].includes(expr.kind);
}
