import { describe, expect, it } from "vitest";
import { Scope } from "./scope.js";

describe("Scope", () => {
  it("adds a symbol when no collision", () => {
    const scope = new Scope();
    expect(scope.add("foo")).toBe("foo");
  });

  it("dodges reserved words", () => {
    const scope = new Scope(["return", "class"]);
    expect(scope.add("return")).toBe("return_2");
    expect(scope.add("class")).toBe("class_2");
  });

  it("dodges previously added symbols", () => {
    const scope = new Scope();
    expect(scope.add("x")).toBe("x");
    expect(scope.add("x")).toBe("x_2");
    expect(scope.add("x")).toBe("x_3");
  });

  it("dodges suffix collisions", () => {
    const scope = new Scope();
    scope.add("x");
    scope.add("x_2");
    expect(scope.add("x")).toBe("x_3");
  });

  it("has() checks reserved and used", () => {
    const scope = new Scope(["reserved"]);
    expect(scope.has("reserved")).toBe(true);
    expect(scope.has("free")).toBe(false);
    scope.add("free");
    expect(scope.has("free")).toBe(true);
  });

  it("child scope inherits parent restrictions", () => {
    const parent = new Scope();
    parent.add("taken");
    const child = parent.child();
    expect(child.has("taken")).toBe(true);
    expect(child.add("taken")).toBe("taken_2");
  });

  it("parent does not see child symbols", () => {
    const parent = new Scope();
    const child = parent.child();
    child.add("childOnly");
    expect(parent.has("childOnly")).toBe(false);
  });

  it("child can have its own reserved words", () => {
    const parent = new Scope();
    const child = parent.child(["self"]);
    expect(child.add("self")).toBe("self_2");
    expect(parent.has("self")).toBe(false);
  });
});
