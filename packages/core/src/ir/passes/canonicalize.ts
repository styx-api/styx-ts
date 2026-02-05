import type { Expr } from "../node.js";
import { PassStatus, type Pass, type PassResult } from "./pass.js";

/**
 * Canonicalize IR for consistent representation:
 * - Sort alternatives by kind, then name, then structure
 * - Deduplicate identical alternatives
 */
export const canonicalize: Pass = {
  name: "canonicalize",
  apply(expr: Expr): PassResult {
    let changed = false;

    function structuralHash(node: Expr): string {
      switch (node.kind) {
        case "literal":
          return `lit:${node.attrs.str}`;
        case "int":
          return `int:${node.attrs.minValue ?? ""}:${node.attrs.maxValue ?? ""}`;
        case "float":
          return `float:${node.attrs.minValue ?? ""}:${node.attrs.maxValue ?? ""}`;
        case "str":
          return "str";
        case "path":
          return `path:${node.attrs.resolveParent ?? ""}:${node.attrs.mutable ?? ""}`;
        case "optional":
          return `opt:${structuralHash(node.attrs.node)}`;
        case "repeat":
          return `rep:${node.attrs.join ?? ""}:${structuralHash(node.attrs.node)}`;
        case "sequence":
          return `seq:${node.attrs.join ?? ""}:${node.attrs.nodes.map(structuralHash).join(",")}`;
        case "alternative":
          return `alt:${node.attrs.alts.map(structuralHash).join(",")}`;
        default: {
          const _exhaustive: never = node;
          return "";
        }
      }
    }

    function sortKey(node: Expr): string {
      const name = node.meta?.name ?? "";
      return `${node.kind}:${name}:${structuralHash(node)}`;
    }

    function visit(node: Expr): Expr {
      switch (node.kind) {
        case "alternative": {
          const children = node.attrs.alts.map(visit);
          
          // Sort alternatives
          const sorted = [...children].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
          
          // Deduplicate by structural hash
          const seen = new Set<string>();
          const alts: Expr[] = [];
          for (const child of sorted) {
            const hash = structuralHash(child);
            if (!seen.has(hash)) {
              seen.add(hash);
              alts.push(child);
            } else {
              changed = true;
            }
          }
          
          // Check if order changed
          if (alts.length !== children.length || 
              alts.some((alt, i) => structuralHash(alt) !== structuralHash(children[i]!))) {
            changed = true;
          }
          
          return { ...node, attrs: { ...node.attrs, alts } };
        }
        
        case "sequence": {
          const nodes = node.attrs.nodes.map(visit);
          return { ...node, attrs: { ...node.attrs, nodes } };
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