import type { ScalarKind } from "../ir/index.js";

export type BoundType =
  | { kind: "scalar"; scalar: ScalarKind }
  | { kind: "bool" }
  | { kind: "count" }
  | { kind: "literal"; value: string | number }
  | { kind: "optional"; inner: BoundType }
  | { kind: "list"; item: BoundType }
  | { kind: "struct"; fields: Record<string, BoundType> }
  | { kind: "union"; variants: BoundVariant[] }
  | { kind: "nullable"; inner: BoundType };

export interface BoundVariant {
  name?: string;
  type: BoundType;
}
