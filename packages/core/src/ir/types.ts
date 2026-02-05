/** Scalar type kinds for terminal nodes */
export type ScalarKind = "int" | "float" | "str" | "path";

/** Media type identifier (MIME type) */
export type MediaTypeIdentifier = string;

/** Human-facing documentation metadata */
export interface Documentation {
  title?: string;
  description?: string;
  authors?: string[];
  literature?: string[];
  urls?: string[];
  comment?: string;
}
