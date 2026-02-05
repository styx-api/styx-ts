
import type { Expr } from "../node.js";
import { PassStatus, type Pass, type PassResult } from "./pass.js";

/**
 * Remove empty nodes:
 * - seq() → removed
 * - alt() → removed
 * - opt(seq()) → removed
 * - rep(alt()) → removed
 */
export const removeEmpty: Pass = {
  name: "remove-empty",
  apply(expr: Expr): PassResult {
    let changed = false;

    function isEmpty(node: Expr): boolean {
      return (
        (node.kind === "sequence" && node.attrs.nodes.length === 0) ||
        (node.kind === "alternative" && node.attrs.alts.length === 0)
      );
    }

    function isRemovable(node: Expr): boolean {
      if (node.meta) return false; // Preserve metadata
      return (
        isEmpty(node) ||
        ((node.kind === "optional" || node.kind === "repeat") && isEmpty(node.attrs.node))
      );
    }

    function visit(node: Expr): Expr {
      switch (node.kind) {
        case "sequence": {
          const nodes = node.attrs.nodes.map(visit).filter(child => {
            const removable = isRemovable(child);
            if (removable) changed = true;
            return !removable;
          });
          return { ...node, attrs: { ...node.attrs, nodes } };
        }
        
        case "alternative": {
          const alts = node.attrs.alts.map(visit).filter(child => {
            const removable = isRemovable(child);
            if (removable) changed = true;
            return !removable;
          });
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