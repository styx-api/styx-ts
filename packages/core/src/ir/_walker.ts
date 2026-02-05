import type { Expr, Terminal } from "./node.js";

/** Visitor callbacks for each node kind */
export type Visitor = {
  [K in Expr["kind"]]?: (node: Extract<Expr, { kind: K }>) => void;
};

/** Walk an expression tree, calling visitor callbacks for each node */
export function walk(expr: Expr, visitor: Visitor): void {
  const callback = visitor[expr.kind];
  if (callback) {
    (callback as (node: Expr) => void)(expr);
  }

  switch (expr.kind) {
    case "sequence":
      expr.attrs.nodes.forEach((n) => walk(n, visitor));
      break;
    case "alternative":
      expr.attrs.alts.forEach((n) => walk(n, visitor));
      break;
    case "optional":
    case "repeat":
      walk(expr.attrs.node, visitor);
      break;
  }
}

/** Transform visitor - return new node or undefined to keep original */
export type Transformer = {
  [K in Expr["kind"]]?: (node: Extract<Expr, { kind: K }>) => Expr | undefined;
};

/** Transform an expression tree, returning a new tree */
export function transform(expr: Expr, transformer: Transformer): Expr {
  let transformed: Expr;

  switch (expr.kind) {
    case "sequence":
      transformed = {
        ...expr,
        attrs: {
          ...expr.attrs,
          nodes: expr.attrs.nodes.map((n) => transform(n, transformer)),
        },
      };
      break;
    case "alternative":
      transformed = {
        ...expr,
        attrs: {
          ...expr.attrs,
          alts: expr.attrs.alts.map((n) => transform(n, transformer)),
        },
      };
      break;
    case "optional":
    case "repeat":
      transformed = {
        ...expr,
        attrs: {
          ...expr.attrs,
          node: transform(expr.attrs.node, transformer),
        },
      };
      break;
    default:
      transformed = expr;
  }

  const callback = transformer[transformed.kind];
  if (callback) {
    const result = (callback as (node: Expr) => Expr | undefined)(transformed);
    if (result !== undefined) {
      return result;
    }
  }

  return transformed;
}

/** Collect all terminal nodes */
export function collectTerminals(expr: Expr): Terminal[] {
  const terminals: Terminal[] = [];
  walk(expr, {
    int: (n) => terminals.push(n),
    float: (n) => terminals.push(n),
    str: (n) => terminals.push(n),
    path: (n) => terminals.push(n),
  });
  return terminals;
}
