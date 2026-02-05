import type { BoundType } from "../../bindings/index.js";
import type { TypeMap } from "../backend.js";

export const typescriptTypeMap: TypeMap = {
  map(type: BoundType): string {
    switch (type.kind) {
      case "scalar":
        return { int: "number", float: "number", str: "string", path: "string" }[type.scalar];
      case "bool":
        return "boolean";
      case "count":
        return "number";
      case "optional":
        return `${this.map(type.inner)} | undefined`;
      case "list":
        return `${this.map(type.item)}[]`;
      case "struct": {
        const fields = Object.entries(type.fields)
          .map(([k, v]) => `${k}: ${this.map(v)}`)
          .join("; ");
        return `{ ${fields} }`;
      }
      case "union":
        return type.variants.map((v) => this.map(v.type)).join(" | ");
      case "nullable":
        return `${this.map(type.inner)} | null`;
    }
  },
  imports(): string[] {
    return [];
  },
};
