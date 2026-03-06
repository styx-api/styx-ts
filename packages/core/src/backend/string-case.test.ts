import { describe, expect, it } from "vitest";
import { camelCase, pascalCase, screamingSnakeCase, snakeCase } from "./string-case.js";

describe("snakeCase", () => {
  it("converts simple words", () => expect(snakeCase("hello world")).toBe("hello_world"));
  it("converts camelCase", () => expect(snakeCase("helloWorld")).toBe("hello_world"));
  it("converts PascalCase", () => expect(snakeCase("HelloWorld")).toBe("hello_world"));
  it("converts kebab-case", () => expect(snakeCase("hello-world")).toBe("hello_world"));
  it("keeps consecutive uppercase together", () => expect(snakeCase("FSLBet")).toBe("fsl_bet"));
  it("handles mixed separators", () => expect(snakeCase("my--tool_v2")).toBe("my_tool_v2"));
  it("handles single word", () => expect(snakeCase("hello")).toBe("hello"));
  it("handles empty string", () => expect(snakeCase("")).toBe(""));
  it("is idempotent", () => expect(snakeCase(snakeCase("helloWorld"))).toBe("hello_world"));
  it("handles all-caps acronym", () => expect(snakeCase("FSL")).toBe("fsl"));
  it("handles acronym followed by word", () => expect(snakeCase("XMLParser")).toBe("xml_parser"));
  it("handles word followed by acronym", () => expect(snakeCase("getURL")).toBe("get_url"));
  it("handles acronym between words", () => expect(snakeCase("myXMLParser")).toBe("my_xml_parser"));
  it("handles digits at boundary", () => expect(snakeCase("v2Beta")).toBe("v2_beta"));
  it("handles trailing digits", () => expect(snakeCase("phase3")).toBe("phase3"));
  it("handles leading digits", () => expect(snakeCase("3dRender")).toBe("3d_render"));
  it("handles only separators", () => expect(snakeCase("---")).toBe(""));
  it("handles single char", () => expect(snakeCase("x")).toBe("x"));
  it("handles realistic Boutiques id", () =>
    expect(snakeCase("fractional_intensity")).toBe("fractional_intensity"));
});

describe("pascalCase", () => {
  it("converts snake_case", () => expect(pascalCase("hello_world")).toBe("HelloWorld"));
  it("converts kebab-case", () => expect(pascalCase("hello-world")).toBe("HelloWorld"));
  it("converts camelCase", () => expect(pascalCase("helloWorld")).toBe("HelloWorld"));
  it("handles consecutive uppercase", () => expect(pascalCase("FSLBet")).toBe("FslBet"));
  it("handles single word", () => expect(pascalCase("hello")).toBe("Hello"));
  it("is idempotent", () => expect(pascalCase(pascalCase("hello_world"))).toBe("HelloWorld"));
  it("handles acronym between words", () =>
    expect(pascalCase("my_xml_parser")).toBe("MyXmlParser"));
});

describe("camelCase", () => {
  it("converts snake_case", () => expect(camelCase("hello_world")).toBe("helloWorld"));
  it("converts PascalCase", () => expect(camelCase("HelloWorld")).toBe("helloWorld"));
  it("converts kebab-case", () => expect(camelCase("my-tool")).toBe("myTool"));
  it("handles single word", () => expect(camelCase("Hello")).toBe("hello"));
  it("is idempotent", () => expect(camelCase(camelCase("hello_world"))).toBe("helloWorld"));
  it("roundtrips with snakeCase", () =>
    expect(snakeCase(camelCase("fractional_intensity"))).toBe("fractional_intensity"));
});

describe("screamingSnakeCase", () => {
  it("converts camelCase", () => expect(screamingSnakeCase("helloWorld")).toBe("HELLO_WORLD"));
  it("converts kebab-case", () => expect(screamingSnakeCase("my-tool")).toBe("MY_TOOL"));
});
