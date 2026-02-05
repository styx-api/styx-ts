import type { BindingRegistry, BoundType } from "../../bindings/index.js";

export interface JsonSchema {
  type?: string;
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  oneOf?: JsonSchema[];
  [key: string]: unknown;
}

export function toJsonSchema(type: BoundType): JsonSchema {
  switch (type.kind) {
    case "scalar":
      return {
        int: { type: "integer" },
        float: { type: "number" },
        str: { type: "string" },
        path: { type: "string", format: "path" },
      }[type.scalar];
    case "bool":
      return { type: "boolean" };
    case "count":
      return { type: "integer", minimum: 0 };
    case "optional":
      return toJsonSchema(type.inner);
    case "list":
      return { type: "array", items: toJsonSchema(type.item) };
    case "struct": {
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const [name, fieldType] of Object.entries(type.fields)) {
        properties[name] = toJsonSchema(fieldType);
        if (fieldType.kind !== "optional" && fieldType.kind !== "nullable") required.push(name);
      }
      return { type: "object", properties, required };
    }
    case "union":
      return { oneOf: type.variants.map((v) => toJsonSchema(v.type)) };
    case "nullable":
      return { oneOf: [toJsonSchema(type.inner), { type: "null" }] };
  }
}

export function generateSchema(bindings: BindingRegistry): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const binding of bindings.values()) {
    properties[binding.name] = toJsonSchema(binding.type);
    if (binding.type.kind !== "optional" && binding.type.kind !== "nullable")
      required.push(binding.name);
  }
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties,
    required,
  };
}
