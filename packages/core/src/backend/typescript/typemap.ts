import type { BoundType } from "../../bindings/index.js";

export function mapType(type: BoundType, resolve: (type: BoundType) => string | undefined): string {
  switch (type.kind) {
    case "scalar":
      return { int: "number", float: "number", str: "string", path: "InputPathType" }[type.scalar];
    case "bool":
      return "boolean";
    case "count":
      return "number";
    case "literal":
      return typeof type.value === "string" ? JSON.stringify(type.value) : String(type.value);
    case "optional":
      return `${mapType(type.inner, resolve)} | null | undefined`;
    case "list": {
      const inner = mapType(type.item, resolve);
      return inner.includes("|") ? `Array<${inner}>` : `${inner}[]`;
    }
    case "struct": {
      const name = resolve(type);
      if (name) return name;
      const fields = Object.entries(type.fields)
        .filter(([, v]) => v.kind !== "literal")
        .map(([k, v]) => `${k}: ${mapType(v, resolve)}`)
        .join("; ");
      return `{ ${fields} }`;
    }
    case "union": {
      const name = resolve(type);
      if (name) return name;
      return type.variants.map((v) => mapType(v.type, resolve)).join(" | ");
    }
  }
}
