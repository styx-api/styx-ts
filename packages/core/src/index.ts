import { BoutiquesParser } from "./frontend/boutiques/index.js";

export * from "./backend/index.js";
export * from "./bindings/index.js";
export * from "./frontend/index.js";
export * from "./ir/index.js";
export * from "./manifest/index.js";
export * from "./solver/index.js";

export function compile(source: string, filename?: string) {
  const parser = new BoutiquesParser();
  const result = parser.parse(source, filename);

  return result;
}
