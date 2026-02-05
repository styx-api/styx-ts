// import { canonicalize } from "./canonicalize.js";
import { flatten } from "./flatten.js";
import type { Pass } from "./pass.js";
import { compose, fixpoint } from "./pass.js";
import { removeEmpty } from "./remove-empty.js";
import { simplify } from "./simplify.js";

export const defaultPipeline: Pass = fixpoint(compose(flatten, removeEmpty, simplify, /* canonicalize */));

export function createPipeline(
  passes: Pass[],
  options?: { fixpoint?: boolean; maxIterations?: number },
): Pass {
  const composed = compose(...passes);
  if (options?.fixpoint) {
    return fixpoint(composed, options.maxIterations);
  }
  return composed;
}
