import { describe, expect, it } from "vitest";
import { compile } from "./compiler";

describe("compile", () => {
  it("returns output", () => {
    const result = compile("test input");
    expect(result.output).toBe("test input");
  });
});
