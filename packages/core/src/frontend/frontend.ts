import type { Expr } from "../ir/index.js";
import type { AppMeta } from "../ir/meta.js";

export interface ParseResult {
  meta?: AppMeta;
  expr: Expr;
  errors: ParseError[];
  warnings: ParseWarning[];
}

export interface ParseError {
  message: string;
  location?: SourceLocation;
}

export interface ParseWarning {
  message: string;
  location?: SourceLocation;
}

export interface SourceLocation {
  file?: string;
  line?: number;
  column?: number;
}

export interface Frontend {
  readonly name: string;
  readonly extensions: string[];
  parse(source: string, filename?: string): ParseResult;
}
