/** Line-buffer abstraction for code emission. */
export class CodeBuilder {
  private readonly lines: string[] = [];
  private depth = 0;
  private readonly indentStr: string;

  constructor(indent = "    ") {
    this.indentStr = indent;
  }

  /** Append a line at the current indentation level. */
  line(text: string): this {
    this.lines.push(this.indentStr.repeat(this.depth) + text);
    return this;
  }

  /** Append a blank line. */
  blank(): this {
    this.lines.push("");
    return this;
  }

  /** Append a comment line. */
  comment(text: string, prefix = "// "): this {
    return this.line(`${prefix}${text}`);
  }

  /** Run a callback with increased indentation. */
  indent(fn: () => void): this {
    this.depth++;
    fn();
    this.depth--;
    return this;
  }

  /** Append all lines from another CodeBuilder at the current indentation level. */
  append(other: CodeBuilder): this {
    const prefix = this.indentStr.repeat(this.depth);
    for (const line of other.lines) {
      this.lines.push(line === "" ? "" : prefix + line);
    }
    return this;
  }

  /** Return the built code as a string. */
  toString(): string {
    return this.lines.join("\n");
  }
}
