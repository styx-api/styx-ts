import type { AppMeta, Expr } from "../../ir/index.js";
import { describe, expect, it } from "vitest";
import { generate, lit, seq, str } from "./test-helpers.js";

const mutPath = (name: string): Expr => ({
  kind: "path",
  attrs: { mutable: true },
  meta: { name },
});

const streamApp = (stdout?: boolean, stderr?: boolean): AppMeta => ({
  id: "mytool",
  ...(stdout && { stdout: { name: "stdout" } }),
  ...(stderr && { stderr: { name: "stderr", doc: { description: "Standard error." } } }),
});

describe("Python boolean_optional pair", () => {
  it("renders a true/false-named literal pair as one optional bool", () => {
    const arm = (str: string, name: string): Expr => ({
      kind: "literal",
      attrs: { str },
      meta: { name },
    });
    const expr = seq(lit("mytool"), {
      kind: "optional",
      attrs: {
        node: {
          kind: "alternative",
          attrs: { alts: [arm("--submm-recon", "true"), arm("--no-submm-recon", "false")] },
          meta: { name: "submm_recon" },
        },
      },
      meta: { name: "submm_recon" },
    });
    const code = generate(expr, { app: { id: "mytool" } });
    // One bool parameter, not a union of two flag-string literals.
    expect(code).toContain("submm_recon: bool | None = None");
    expect(code).not.toContain('"--submm-recon" | ');
    // Each branch emits its own spelling.
    expect(code).toContain('cargs.append("--submm-recon")');
    expect(code).toContain('cargs.append("--no-submm-recon")');
  });
});

describe("Python stream outputs (stdout/stderr)", () => {
  it("declares list[str] fields on the Outputs NamedTuple", () => {
    const code = generate(seq(lit("mytool"), str("input")), { app: streamApp(true, true) });
    expect(code).toContain("stdout: list[str]");
    expect(code).toContain("stderr: list[str]");
    // The stderr stream's doc is surfaced as a field docstring.
    expect(code).toContain('"""Standard error."""');
  });

  it("initializes stream fields to empty lists in the build function", () => {
    const code = generate(seq(lit("mytool"), str("input")), { app: streamApp(true, true) });
    expect(code).toContain("stdout=[],");
    expect(code).toContain("stderr=[],");
  });

  it("wires handle_stdout / handle_stderr into execution.run", () => {
    const code = generate(seq(lit("mytool"), str("input")), { app: streamApp(true, true) });
    expect(code).toContain(
      "execution.run(args, handle_stdout=lambda s: out.stdout.append(s), " +
        "handle_stderr=lambda s: out.stderr.append(s))",
    );
    expect(code).toContain("return out");
  });

  it("wires only handle_stderr when stdout is absent", () => {
    const code = generate(seq(lit("mytool"), str("input")), { app: streamApp(false, true) });
    expect(code).toContain("execution.run(args, handle_stderr=lambda s: out.stderr.append(s))");
    expect(code).not.toContain("handle_stdout");
  });

  it("imports OutputPathType and emits the root field for a stream-only tool", () => {
    const code = generate(seq(lit("mytool"), str("input")), { app: streamApp(true, true) });
    expect(code).toContain("OutputPathType");
    expect(code).toContain("root: OutputPathType");
  });

  it("bumps a stream field whose name collides with an output field", () => {
    // A mutable input named "stdout" produces an output field "stdout"; the
    // stdout stream must dodge it (-> "stdout_") rather than emit a duplicate.
    const code = generate(seq(lit("tool"), mutPath("stdout")), {
      app: { id: "tool", stdout: { name: "stdout" } },
    });
    expect(code).toContain("stdout: OutputPathType");
    expect(code).toContain("stdout_: list[str]");
    expect(code).toContain("stdout_=[],");
  });
});
