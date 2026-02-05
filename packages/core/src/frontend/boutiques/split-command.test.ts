import { describe, expect, it } from "vitest";
import { boutiquesSplitCommand } from "./split-command.js";

describe("boutiquesSplitCommand", () => {
  it("splits simple space-separated arguments", () => {
    expect(boutiquesSplitCommand("foo bar baz")).toEqual(["foo", "bar", "baz"]);
  });

  it("handles multiple spaces between arguments", () => {
    expect(boutiquesSplitCommand("foo   bar    baz")).toEqual(["foo", "bar", "baz"]);
  });

  it("handles leading and trailing whitespace", () => {
    expect(boutiquesSplitCommand("  foo bar  ")).toEqual(["foo", "bar"]);
  });

  it("preserves single-quoted strings", () => {
    expect(boutiquesSplitCommand("foo 'bar baz' qux")).toEqual(["foo", "bar baz", "qux"]);
  });

  it("preserves double-quoted strings", () => {
    expect(boutiquesSplitCommand('foo "bar baz" qux')).toEqual(["foo", "bar baz", "qux"]);
  });

  it("handles escaped spaces outside quotes", () => {
    expect(boutiquesSplitCommand("foo bar\\ baz qux")).toEqual(["foo", "bar baz", "qux"]);
  });

  it("handles escaped characters in double quotes", () => {
    expect(boutiquesSplitCommand('foo "bar\\"baz" qux')).toEqual(["foo", 'bar"baz', "qux"]);
  });

  it("preserves backslashes in single quotes", () => {
    expect(boutiquesSplitCommand("foo 'bar\\baz' qux")).toEqual(["foo", "bar\\baz", "qux"]);
  });

  it("handles mixed quote styles", () => {
    expect(boutiquesSplitCommand(`foo 'bar' "baz" qux`)).toEqual(["foo", "bar", "baz", "qux"]);
  });

  it("handles adjacent quoted strings", () => {
    expect(boutiquesSplitCommand(`'foo'"bar"baz`)).toEqual(["foobarbaz"]);
  });

  it("returns empty array for empty string", () => {
    expect(boutiquesSplitCommand("")).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    expect(boutiquesSplitCommand("   ")).toEqual([]);
  });

  it("throws on null input", () => {
    expect(() => boutiquesSplitCommand(null as unknown as string)).toThrow(
      "Command cannot be null or undefined",
    );
  });

  it("throws on undefined input", () => {
    expect(() => boutiquesSplitCommand(undefined as unknown as string)).toThrow(
      "Command cannot be null or undefined",
    );
  });

  it("throws on unclosed single quote", () => {
    expect(() => boutiquesSplitCommand("foo 'bar")).toThrow("Unclosed quote");
  });

  it("throws on unclosed double quote", () => {
    expect(() => boutiquesSplitCommand('foo "bar')).toThrow("Unclosed quote");
  });

  it("throws on trailing backslash", () => {
    expect(() => boutiquesSplitCommand("foo\\")).toThrow("Trailing backslash");
  });

  it("handles tabs and other whitespace", () => {
    expect(boutiquesSplitCommand("foo\tbar\nbaz")).toEqual(["foo", "bar", "baz"]);
  });
});
