import type { AppMeta } from "./meta.js";
import type { Expr } from "./node.js";

export function format(expr: Expr, meta?: AppMeta): string {
  const lines: string[] = [];

  if (meta) {
    lines.push(`app ${meta.id}${meta.version ? `@${meta.version}` : ""}`);
    if (meta.doc?.description) {
      lines.push(`  "${meta.doc.description}"`);
    }
    if (meta.authors?.length) {
      lines.push(`  authors: ${meta.authors.join(", ")}`);
    }
    if (meta.container) {
      lines.push(`  container: ${meta.container.image}`);
    }
    if (meta.stdout) {
      lines.push(`  stdout: ${meta.stdout.name}`);
    }
    if (meta.stderr) {
      lines.push(`  stderr: ${meta.stderr.name}`);
    }
    lines.push("");
  }

  lines.push(formatExpr(expr, 0));
  return lines.join("\n");
}

function formatExpr(expr: Expr, indent: number): string {
  const pad = "  ".repeat(indent);
  const name = expr.meta?.name ? ` [${expr.meta.name}]` : "";

  switch (expr.kind) {
    case "literal":
      return `${pad}literal${name} "${expr.attrs.str}"`;

    case "str":
      return `${pad}str${name}`;

    case "int": {
      const { minValue, maxValue } = expr.attrs;
      const range =
        minValue !== undefined || maxValue !== undefined
          ? ` (${minValue ?? ""}..${maxValue ?? ""})`
          : "";
      return `${pad}int${name}${range}`;
    }

    case "float": {
      const { minValue, maxValue } = expr.attrs;
      const range =
        minValue !== undefined || maxValue !== undefined
          ? ` (${minValue ?? ""}..${maxValue ?? ""})`
          : "";
      return `${pad}float${name}${range}`;
    }

    case "path": {
      const flags = [
        expr.attrs.resolveParent && "resolveParent",
        expr.attrs.mutable && "mutable",
      ].filter(Boolean);
      const suffix = flags.length > 0 ? ` {${flags.join(", ")}}` : "";
      return `${pad}path${name}${suffix}`;
    }

    case "sequence": {
      const join = expr.attrs.join !== undefined ? ` join="${expr.attrs.join}"` : "";
      const header = `${pad}sequence${name}${join}`;
      if (expr.attrs.nodes.length === 0) {
        return `${header} (empty)`;
      }
      const children = expr.attrs.nodes.map((n) => formatExpr(n, indent + 1)).join("\n");
      return `${header}\n${children}`;
    }

    case "alternative": {
      const header = `${pad}alternative${name}`;
      const children = expr.attrs.alts.map((n) => formatExpr(n, indent + 1)).join("\n");
      return `${header}\n${children}`;
    }

    case "optional": {
      const header = `${pad}optional${name}`;
      const child = formatExpr(expr.attrs.node, indent + 1);
      return `${header}\n${child}`;
    }

    case "repeat": {
      const { join, countMin, countMax } = expr.attrs;
      const parts = [
        join !== undefined && `join="${join}"`,
        countMin !== undefined && `min=${countMin}`,
        countMax !== undefined && `max=${countMax}`,
      ].filter(Boolean);
      const suffix = parts.length > 0 ? ` {${parts.join(", ")}}` : "";
      const header = `${pad}repeat${name}${suffix}`;
      const child = formatExpr(expr.attrs.node, indent + 1);
      return `${header}\n${child}`;
    }

    default: {
      const _exhaustive: never = expr;
      return `${pad}unknown`;
    }
  }
}
