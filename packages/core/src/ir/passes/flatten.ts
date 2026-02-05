import type { Expr } from "../node.js";
import { PassStatus, type Pass, type PassResult } from "./pass.js";

/**
 * Flatten passes
 * - seq(a, seq(b, c)) -> seq(a, b, c)
 * - alt(a, alt(b, c)) -> alt(a, b, c)
 */
export const flatten: Pass = {
  name: "flatten",
  apply(expr: Expr): PassResult {
    let changed = false;

    function visit(node: Expr): Expr {
      switch (node.kind) {
        case "sequence": {
          const children = node.attrs.nodes.map(visit);
          const nodes: Expr[] = [];
          
          for (const child of children) {
            if (child.kind === "sequence" && child.attrs.join === node.attrs.join && !child.meta) {
              changed = true;
              nodes.push(...child.attrs.nodes);
            } else {
              nodes.push(child);
            }
          }
          
          return { ...node, attrs: { ...node.attrs, nodes } };
        }
        
        case "alternative": {
          const children = node.attrs.alts.map(visit);
          const alts: Expr[] = [];
          
          for (const child of children) {
            if (child.kind === "alternative" && !child.meta) {
              changed = true;
              alts.push(...child.attrs.alts);
            } else {
              alts.push(child);
            }
          }
          
          return { ...node, attrs: { ...node.attrs, alts } };
        }
        
        case "optional":
          return { ...node, attrs: { node: visit(node.attrs.node) } };
        
        case "repeat":
          return { ...node, attrs: { ...node.attrs, node: visit(node.attrs.node) } };
        
        case "literal":
        case "int":
        case "float":
        case "str":
        case "path":
          return node;
        
        default: {
          const _exhaustive: never = node;
          return node;
        }
      }
    }

    return {
      expr: visit(expr),
      status: changed ? PassStatus.Changed : PassStatus.Unchanged,
    };
  },
};