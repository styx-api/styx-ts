import type { Documentation } from "../ir/index.js";

export interface ProjectMeta {
  name?: string;
  version?: string;
  doc?: Documentation;
  license?: Documentation;
}

export interface PackageMeta {
  name?: string;
  version?: string;
  docker?: string;
  doc?: Documentation;
}

export interface StreamOutput {
  name?: string;
  doc?: Documentation;
}

export interface AppMeta {
  uid?: string;
  doc?: Documentation;
  captureStdout?: StreamOutput;
  captureStderr?: StreamOutput;
}
