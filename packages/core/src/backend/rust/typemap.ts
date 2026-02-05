import type { BoundType } from "../../bindings/index.js";
import type { TypeMap } from "../backend.js";

export const rustTypeMap: TypeMap = {
  map(type: BoundType): string {
    switch (type.kind) {
      case "scalar":
        return { int: "i64", float: "f64", str: "String", path: "PathBuf" }[type.scalar];
      case "bool":
        return "bool";
      case "count":
        return "usize";
      case "optional":
        return `Option<${this.map(type.inner)}>`;
      case "list":
        return `Vec<${this.map(type.item)}>`;
      case "struct":
        return "HashMap<String, Value>";
      case "union":
        return "Value";
      case "nullable":
        return `Option<${this.map(type.inner)}>`;
    }
  },
  imports(type: BoundType): string[] {
    const imports = new Set<string>();
    const collect = (t: BoundType) => {
      if (t.kind === "scalar" && t.scalar === "path") imports.add("use std::path::PathBuf;");
      if (t.kind === "struct") {
        imports.add("use std::collections::HashMap;");
        imports.add("use serde_json::Value;");
      }
      if (t.kind === "union") imports.add("use serde_json::Value;");
      if (t.kind === "optional") collect(t.inner);
      if (t.kind === "list") collect(t.item);
      if (t.kind === "nullable") collect(t.inner);
      if (t.kind === "union") t.variants.forEach((v) => collect(v.type));
      if (t.kind === "struct") Object.values(t.fields).forEach(collect);
    };
    collect(type);
    return Array.from(imports);
  },
};
