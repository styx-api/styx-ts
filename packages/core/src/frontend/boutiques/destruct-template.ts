/**
 * Destruct a template string to a list of strings and replacements.
 *
 * This is used to safely destruct boutiques `command-line` as well as `path-template` strings.
 *
 * @example
 * destructTemplate("hello x, I am y", { x: 12, y: 34 })
 * // => ["hello ", 12, ", I am ", 34]
 */
export function destructTemplate<T>(template: string, lookup: Record<string, T>): (string | T)[] {
  const destructed: (string | T)[] = [];
  const stack: (string | T)[] = [template];

  while (stack.length > 0) {
    // biome-ignore lint/style/noNonNullAssertion: length check guarantees element exists
    const x = stack.shift()!;

    if (typeof x !== "string") {
      destructed.push(x);
      continue;
    }

    let didSplit = false;

    for (const [alias, replacement] of Object.entries(lookup)) {
      const idx = x.indexOf(alias);
      if (idx !== -1) {
        const left = x.slice(0, idx);
        const right = x.slice(idx + alias.length);

        if (right.length > 0) {
          stack.unshift(right);
        }
        stack.unshift(replacement);
        if (left.length > 0) {
          stack.unshift(left);
        }

        didSplit = true;
        break;
      }
    }

    if (!didSplit) {
      destructed.push(x);
    }
  }

  return destructed;
}
