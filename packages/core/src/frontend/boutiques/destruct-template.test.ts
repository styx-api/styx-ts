import { describe, expect, it } from "vitest";
import { destructTemplate } from "./destruct-template";

describe("destructTemplate", () => {
  it("replaces single placeholder", () => {
    expect(destructTemplate("hello x", { x: 12 })).toEqual(["hello ", 12]);
  });

  it("replaces multiple placeholders", () => {
    expect(destructTemplate("hello x, I am y", { x: 12, y: 34 })).toEqual([
      "hello ",
      12,
      ", I am ",
      34,
    ]);
  });

  it("handles placeholder at start", () => {
    expect(destructTemplate("x is here", { x: 42 })).toEqual([42, " is here"]);
  });

  it("handles placeholder at end", () => {
    expect(destructTemplate("value is x", { x: 42 })).toEqual(["value is ", 42]);
  });

  it("handles adjacent placeholders", () => {
    expect(destructTemplate("xy", { x: 1, y: 2 })).toEqual([1, 2]);
  });

  it("handles repeated placeholder", () => {
    expect(destructTemplate("x and x", { x: 99 })).toEqual([99, " and ", 99]);
  });

  it("returns original string when no matches", () => {
    expect(destructTemplate("hello world", { x: 12 })).toEqual(["hello world"]);
  });

  it("returns original string for empty lookup", () => {
    expect(destructTemplate("hello world", {})).toEqual(["hello world"]);
  });

  it("handles empty string template", () => {
    expect(destructTemplate("", { x: 12 })).toEqual([""]);
  });

  it("handles placeholder that is entire string", () => {
    expect(destructTemplate("x", { x: 42 })).toEqual([42]);
  });

  it("preserves replacement types", () => {
    const obj = { nested: "value" };
    const result = destructTemplate("before OBJ after", { OBJ: obj });
    expect(result).toEqual(["before ", obj, " after"]);
    expect(result[1]).toBe(obj); // same reference
  });

  it("handles multi-character placeholders", () => {
    expect(
      destructTemplate("hello [NAME], welcome to [PLACE]", {
        "[NAME]": "Alice",
        "[PLACE]": "Wonderland",
      }),
    ).toEqual(["hello ", "Alice", ", welcome to ", "Wonderland"]);
  });

  it("handles overlapping placeholder names (first match wins)", () => {
    // Note: iteration order dependent
    const result = destructTemplate("foobar", { foo: 1, foobar: 2 });
    // With object iteration, 'foo' comes first
    expect(result).toEqual([1, "bar"]);
  });

  it("works with array values", () => {
    const arr = [1, 2, 3];
    expect(destructTemplate("data: ARR", { ARR: arr })).toEqual(["data: ", arr]);
  });

  it("works with null/undefined values", () => {
    expect(destructTemplate("a X b Y c", { X: null, Y: undefined })).toEqual([
      "a ",
      null,
      " b ",
      undefined,
      " c",
    ]);
  });
});
