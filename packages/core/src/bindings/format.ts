import type { Expr } from "../ir/node.js";
import type { SolveResult } from "./index.js";
import type { BoundType } from "./types.js";

export function formatSolveResult(result: SolveResult, expr: Expr): string {
  const binding = result.resolve(expr);
  return binding ? `${binding.name}: ${formatType(binding.type)}` : "(no binding)";
}

function formatType(type: BoundType, indent = 0): string {
  const pad = "  ".repeat(indent);
  const inner = (t: BoundType) => formatType(t, indent + 1);
  
  switch (type.kind) {
    case "scalar":
      return type.scalar;
    case "bool":
      return "bool";
    case "count":
      return "count";
    case "literal":
      return typeof type.value === "number" ? String(type.value) : `"${type.value}"`;
    case "optional":
      return `optional<${inner(type.inner)}>`;
    case "list":
      return `list<${inner(type.item)}>`;
    
    case "struct": {
      const entries = Object.entries(type.fields);
      if (entries.length === 0) return "struct {}";
      if (entries.length === 1) {
        const [name, t] = entries[0]!;
        return `struct { ${name}: ${formatType(t)} }`;
      }
      const fields = entries.map(([name, t]) => `${pad}  ${name}: ${inner(t)}`).join("\n");
      return `struct {\n${fields}\n${pad}}`;
    }
    
    case "union": {
      if (type.variants.length === 0) return "union {}";
      
      // If all variants are literals, display inline
      const allLiterals = type.variants.every(v => v.type.kind === "literal");
      if (allLiterals) {
        return type.variants
          .map(v => v.type.kind === "literal"
            ? (typeof v.type.value === "number" ? String(v.type.value) : `"${v.type.value}"`)
            : "?")
          .join(" | ");
      }
      
      // Otherwise multi-line union
      const variants = type.variants.map(v => `${pad}  | ${v.name}: ${inner(v.type)}`).join("\n");
      return `union {\n${variants}\n${pad}}`;
    }
    
    default:
      return ((x: never) => "unknown")(type);
  }
}