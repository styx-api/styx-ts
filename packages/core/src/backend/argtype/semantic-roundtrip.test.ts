import { describe, expect, it } from "vitest";
import { defaultPipeline } from "../../ir/index.js";
import { createContext } from "../../manifest/context.js";
import { resolveOutputs, solve } from "../../solver/index.js";
import { generatePython } from "../python/python.js";
import { generateTypeScript } from "../typescript/typescript.js";
import { BoutiquesParser } from "../../frontend/boutiques/parser.js";
import { ArgdumpParser } from "../../frontend/argdump/parser.js";
import { ArgtypeParser } from "../../frontend/argtype/parser-frontend.js";
import type { ParseResult } from "../../frontend/frontend.js";
import { generateArgtype } from "./emit.js";

/**
 * Semantic round-trip: an existing-style Boutiques descriptor -> IR -> emit
 * argtype -> parse back -> IR, then solve + codegen, asserting the generated
 * TypeScript and Python match the direct Boutiques -> IR -> codegen path.
 *
 * The descriptor deliberately avoids the documented lossiness so the match is
 * exact (no normalization):
 * - No `name` fields (Boutiques `name` -> `doc.title`, which argtype has no
 *   surface for), only `description` (-> `///`).
 * - Defaults only where the IR keeps them on a node argtype can decorate (a
 *   positional terminal, or an enum `alternative`), never hoisted onto a
 *   flag/optional wrapper.
 * - No `mutable` / `resolve-parent` paths and no output docs.
 */

const boutiques = new BoutiquesParser();
const argtype = new ArgtypeParser();

const DESCRIPTOR = {
  id: "resample",
  "tool-version": "2.0",
  author: "Test Author",
  url: "https://example.org/resample",
  "command-line": "resample [INPUT] [METHOD] [VERBOSE] [SCALE] [LABELS] [OUTPUT]",
  inputs: [
    { id: "input", description: "Input volume", type: "File", "value-key": "[INPUT]" },
    {
      id: "method",
      description: "Resampling method",
      type: "String",
      "value-key": "[METHOD]",
      "value-choices": ["linear", "nearest", "cubic"],
      "default-value": "linear",
    },
    {
      id: "verbose",
      description: "Verbose logging",
      type: "Flag",
      "command-line-flag": "-v",
      "value-key": "[VERBOSE]",
    },
    {
      id: "scale",
      description: "Scale factor",
      type: "Number",
      "value-key": "[SCALE]",
      "command-line-flag": "--scale",
      optional: true,
      minimum: 0,
      maximum: 10,
    },
    {
      id: "labels",
      description: "Label values",
      type: "Number",
      integer: true,
      list: true,
      "value-key": "[LABELS]",
      "command-line-flag": "--labels",
      "list-separator": ",",
      optional: true,
    },
    { id: "output", description: "Output prefix", type: "String", "value-key": "[OUTPUT]" },
  ],
  "output-files": [
    {
      id: "out_file",
      "path-template": "[OUTPUT].nii.gz",
      "path-template-stripped-extensions": [".nii", ".nii.gz"],
    },
  ],
};

function codegen(parsed: ParseResult) {
  expect(parsed.errors).toEqual([]);
  const optimized = defaultPipeline.apply(parsed.expr);
  const solveResult = solve(optimized.expr);
  const outputs = resolveOutputs(optimized.expr, solveResult);
  expect(outputs.diagnostics.errors).toEqual([]);
  const ctx = createContext(optimized.expr, solveResult, outputs, {
    app: parsed.meta ?? { id: "tool" },
    package: { name: "pkg" },
  });
  return { ts: generateTypeScript(ctx), py: generatePython(ctx) };
}

describe("argtype backend semantic round-trip (argdump -> argtype -> codegen)", () => {
  it("keeps a boolean_optional pair collapsed to one bool", () => {
    const parsed = new ArgdumpParser().parse(
      JSON.stringify({
        prog: "tool",
        actions: [
          {
            dest: "verbose",
            option_strings: ["--verbose", "--no-verbose"],
            action_type: "boolean_optional",
          },
        ],
      }),
    );
    const emitted = generateArgtype(parsed.expr, parsed.meta);
    // The arm names are the only surface argtype has for the pair, so they must
    // be emitted as labels or the collapse is lost on re-parse.
    expect(emitted.source).toContain('alt(true: "--verbose", false: "--no-verbose")');
    expect(emitted.warnings.filter((w) => w.message.includes("discriminator"))).toEqual([]);

    const direct = codegen(parsed);
    const viaArgtype = codegen(argtype.parse(emitted.source));
    expect(direct.py).toContain('"verbose": typing.NotRequired[bool]');
    expect(viaArgtype.py).toContain('"verbose": typing.NotRequired[bool]');
    // Each branch keeps its own spelling on the command line.
    expect(viaArgtype.py).toContain('cargs.append("--verbose")');
    expect(viaArgtype.py).toContain('cargs.append("--no-verbose")');
  });
});

describe("argtype backend semantic round-trip (Boutiques -> argtype -> codegen)", () => {
  it("produces identical TypeScript and Python via the argtype detour", () => {
    const direct = boutiques.parse(JSON.stringify(DESCRIPTOR));
    expect(direct.errors).toEqual([]);

    const { source, warnings } = generateArgtype(direct.expr, direct.meta);
    expect(warnings).toEqual([]);

    const reparsed = argtype.parse(source);
    expect(reparsed.errors, `re-parse failed:\n${source}`).toEqual([]);

    // The detour reconstructs the same IR (this is the strongest assertion;
    // identical codegen follows from it).
    expect(reparsed.expr).toEqual(direct.expr);
    expect(reparsed.meta).toEqual(direct.meta);

    const directOut = codegen(direct);
    const argtypeOut = codegen(reparsed);

    expect(argtypeOut.ts).toEqual(directOut.ts);
    expect(argtypeOut.py).toEqual(directOut.py);
  });
});
