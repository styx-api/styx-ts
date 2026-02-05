import type { Documentation, MediaTypeIdentifier } from "./types.js";

/** Output token - either a literal string or a reference to a parameter */
export type OutputToken = string | { ref: Expr };

/** Output specification for file outputs */
export interface Output {
  name?: string;
  doc?: Documentation;
  tokens: OutputToken[];
  mediaTypes?: MediaTypeIdentifier[];
}

/** Metadata attached to any IR node */
export interface NodeMeta {
  /** Name identifier for this node (used by solver for binding names) */
  name?: string;
  doc?: Documentation;
  outputs?: Output[];
}

/** Application-level metadata for the root node */
export interface AppMeta {
  id: string;
  version?: string;
  doc?: Documentation;
  authors?: string[];
  urls?: string[];
  container?: {
    image: string;
    type?: "docker" | "singularity";
  };
  stdout?: StreamOutput;
  stderr?: StreamOutput;
}

export interface StreamOutput {
  name: string;
  doc?: Documentation;
}

// Forward reference - will be defined in node.ts
import type { Expr } from "./node.js";
