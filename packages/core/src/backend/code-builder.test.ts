import { describe, expect, it } from "vitest";
import { CodeBuilder } from "./code-builder.js";

describe("CodeBuilder", () => {
  it("emits a single line", () => {
    const cb = new CodeBuilder();
    cb.line("hello");
    expect(cb.toString()).toBe("hello");
  });

  it("emits multiple lines", () => {
    const cb = new CodeBuilder();
    cb.line("a").line("b");
    expect(cb.toString()).toBe("a\nb");
  });

  it("indents a block", () => {
    const cb = new CodeBuilder();
    cb.line("if x:");
    cb.indent(() => {
      cb.line("do_thing()");
      cb.line("do_other()");
    });
    expect(cb.toString()).toBe("if x:\n    do_thing()\n    do_other()");
  });

  it("supports nested indentation", () => {
    const cb = new CodeBuilder();
    cb.line("a");
    cb.indent(() => {
      cb.line("b");
      cb.indent(() => {
        cb.line("c");
      });
    });
    expect(cb.toString()).toBe("a\n    b\n        c");
  });

  it("emits blank lines", () => {
    const cb = new CodeBuilder();
    cb.line("a").blank().line("b");
    expect(cb.toString()).toBe("a\n\nb");
  });

  it("emits comments", () => {
    const cb = new CodeBuilder();
    cb.comment("a note");
    expect(cb.toString()).toBe("// a note");
  });

  it("emits comments with custom prefix", () => {
    const cb = new CodeBuilder();
    cb.comment("a note", "# ");
    expect(cb.toString()).toBe("# a note");
  });

  it("supports custom indent string", () => {
    const cb = new CodeBuilder("  ");
    cb.line("a");
    cb.indent(() => cb.line("b"));
    expect(cb.toString()).toBe("a\n  b");
  });

  it("is chainable", () => {
    const cb = new CodeBuilder();
    const result = cb.line("a").blank().line("b").comment("c");
    expect(result).toBe(cb);
  });

  it("appends another CodeBuilder", () => {
    const inner = new CodeBuilder();
    inner.line("x").line("y");

    const outer = new CodeBuilder();
    outer.line("header");
    outer.indent(() => {
      outer.append(inner);
    });
    expect(outer.toString()).toBe("header\n    x\n    y");
  });

  it("append preserves blank lines", () => {
    const inner = new CodeBuilder();
    inner.line("a").blank().line("b");

    const outer = new CodeBuilder();
    outer.append(inner);
    expect(outer.toString()).toBe("a\n\nb");
  });
});
