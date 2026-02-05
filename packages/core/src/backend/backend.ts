import type { BoundType } from "../bindings/index.js";
import type { CodegenContext } from "../manifest/index.js";

export interface EmitResult {
  files: Map<string, string>;
  errors: EmitError[];
  warnings: EmitWarning[];
}

export interface EmitError {
  message: string;
}

export interface EmitWarning {
  message: string;
}

export interface Backend {
  readonly name: string;
  readonly target: string;
  emit(ctx: CodegenContext): EmitResult;
}

export interface TypeMap {
  map(type: BoundType): string;
  imports(type: BoundType): string[];
}
