/** Symbol collision avoidance for code generation. */
export class Scope {
  private readonly reserved: ReadonlySet<string>;
  private readonly used: Set<string>;
  private readonly parent?: Scope;

  constructor(reserved: Iterable<string> = [], parent?: Scope) {
    this.reserved = new Set(reserved);
    this.used = new Set();
    this.parent = parent;
  }

  /** Check if a symbol is already taken (in this scope or any parent). */
  has(symbol: string): boolean {
    return this.reserved.has(symbol) || this.used.has(symbol) || (this.parent?.has(symbol) ?? false);
  }

  /** Add a symbol, appending suffixes to avoid collisions. Returns the safe name. */
  add(candidate: string): string {
    if (!this.has(candidate)) {
      this.used.add(candidate);
      return candidate;
    }
    let suffix = 2;
    while (this.has(`${candidate}_${suffix}`)) {
      suffix++;
    }
    const safe = `${candidate}_${suffix}`;
    this.used.add(safe);
    return safe;
  }

  /** Create a child scope that inherits this scope's restrictions. */
  child(reserved: Iterable<string> = []): Scope {
    return new Scope(reserved, this);
  }
}
