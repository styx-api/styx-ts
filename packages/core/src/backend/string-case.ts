/** Split a string into lowercase word tokens for case conversion. */
function tokenize(s: string): string[] {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // camelCase boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // consecutive uppercase -> keep runs
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function snakeCase(s: string): string {
  return tokenize(s).join("_");
}

export function screamingSnakeCase(s: string): string {
  return tokenize(s).join("_").toUpperCase();
}

export function pascalCase(s: string): string {
  return tokenize(s)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export function camelCase(s: string): string {
  const pascal = pascalCase(s);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
