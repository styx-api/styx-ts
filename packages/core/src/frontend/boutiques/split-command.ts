/**
 * Split a Boutiques command into a list of arguments.
 *
 * @param command - The Boutiques command.
 * @returns The list of arguments.
 * @throws {Error} If command is null or undefined.
 */
export function boutiquesSplitCommand(command: string): string[] {
  if (command == null) {
    throw new Error("Command cannot be null or undefined");
  }

  const args: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;

  for (const char of command) {
    if (escaped) {
      // In double quotes, only certain escapes are meaningful
      if (inDoubleQuote && !["\\", '"', "$", "`", "\n"].includes(char)) {
        current += "\\";
      }
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\" && !inSingleQuote) {
      escaped = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
      if (current) {
        args.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (inSingleQuote || inDoubleQuote) {
    throw new Error("Unclosed quote in command string");
  }

  if (escaped) {
    throw new Error("Trailing backslash in command string");
  }

  if (current) {
    args.push(current);
  }

  return args;
}
