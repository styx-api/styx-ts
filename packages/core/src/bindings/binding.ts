import type { Expr } from "../ir/index.js";
import type { BoundType } from "./types.js";

export type BindingId = string;

export interface Binding {
  id: BindingId;
  node: Expr;
  name: string;
  type: BoundType;
}

export type BindingRegistry = Map<BindingId, Binding>;

export interface SolveResult {
  bindings: BindingRegistry;
  resolve: (node: Expr) => Binding | undefined;
}

export function createRegistry(): BindingRegistry {
  return new Map();
}
