import type { Binding } from "../../bindings/index.js";
import type { BoundType } from "../../bindings/index.js";
import type { Expr } from "../../ir/index.js";
import type { CodegenContext } from "../../manifest/index.js";
import { Scope } from "../scope.js";
import { pascalCase } from "../string-case.js";

// -- Key functions --

export function structKey(type: Extract<BoundType, { kind: "struct" }>): string {
  return `struct:${Object.keys(type.fields).join(",")}`;
}

export function unionKey(type: Extract<BoundType, { kind: "union" }>): string {
  return `union:${type.variants.map((v) => v.name ?? "?").join(",")}`;
}

function typeKey(type: BoundType): string | undefined {
  if (type.kind === "struct") return structKey(type);
  if (type.kind === "union") return unionKey(type);
  return undefined;
}

// -- Named type collection --

export interface NamedType {
  name: string;
  type: BoundType;
}

export function collectNamedTypes(
  rootType: BoundType,
  rootName: string,
  scope: Scope,
): { namedTypes: Map<string, string>; typeDecls: NamedType[] } {
  const namedTypes = new Map<string, string>();
  const typeDecls: NamedType[] = [];

  function visit(type: BoundType, hint: string): void {
    switch (type.kind) {
      case "struct": {
        const key = structKey(type);
        if (!namedTypes.has(key)) {
          const name = scope.add(pascalCase(hint));
          namedTypes.set(key, name);
          typeDecls.push({ name, type });
          for (const [fieldName, fieldType] of Object.entries(type.fields)) {
            visit(fieldType, fieldName);
          }
        }
        break;
      }
      case "union": {
        const key = unionKey(type);
        if (!namedTypes.has(key)) {
          const name = scope.add(pascalCase(hint));
          namedTypes.set(key, name);
          typeDecls.push({ name, type });
          for (const v of type.variants) {
            visit(v.type, v.name ?? hint);
          }
        }
        break;
      }
      case "optional":
        visit(type.inner, hint);
        break;
      case "list":
        visit(type.item, hint);
        break;
      default:
        break;
    }
  }

  visit(rootType, rootName);
  return { namedTypes, typeDecls };
}

// -- Field metadata --

export interface FieldInfo {
  doc?: string;
  defaultValue?: string | number | boolean;
}

export function collectFieldInfo(
  ctx: CodegenContext,
  structType: Extract<BoundType, { kind: "struct" }>,
): Map<string, FieldInfo> {
  const info = new Map<string, FieldInfo>();

  function findStructNode(node: Expr): Extract<Expr, { kind: "sequence" }> | undefined {
    switch (node.kind) {
      case "sequence": {
        for (const child of node.attrs.nodes) {
          if (resolveFieldBinding(child, ctx, structType)) return node;
        }
        for (const child of node.attrs.nodes) {
          const result = findStructNode(child);
          if (result) return result;
        }
        return undefined;
      }
      case "optional":
        return findStructNode(node.attrs.node);
      case "repeat":
        return findStructNode(node.attrs.node);
      case "alternative": {
        for (const alt of node.attrs.alts) {
          const result = findStructNode(alt);
          if (result) return result;
        }
        return undefined;
      }
      default:
        return undefined;
    }
  }

  const structNode = findStructNode(ctx.expr);
  if (!structNode) return info;

  for (const child of structNode.attrs.nodes) {
    const match = resolveFieldBinding(child, ctx, structType);
    if (!match) continue;
    const { binding, wrapperNode } = match;
    const fieldInfo: FieldInfo = {};
    const fieldType = structType.fields[binding.name]!;
    // Check wrapper node first (doc may be hoisted there), then binding node
    const doc = findDoc(wrapperNode, fieldType) ?? findDoc(binding.node, fieldType);
    if (doc) fieldInfo.doc = doc;
    const defaultValue = wrapperNode.meta?.defaultValue ?? binding.node.meta?.defaultValue;
    if (defaultValue !== undefined) fieldInfo.defaultValue = defaultValue;
    info.set(binding.name, fieldInfo);
  }

  return info;
}

/**
 * Resolve a struct child to its field binding, handling collapsed sequences.
 * When the solver collapses seq(lit("--flag"), terminal) to just the terminal,
 * the binding is on the inner node but the doc may be on the outermost wrapper.
 */
function resolveFieldBinding(
  node: Expr,
  ctx: CodegenContext,
  structType: Extract<BoundType, { kind: "struct" }>,
  outermost?: Expr,
): { binding: Binding; wrapperNode: Expr } | undefined {
  const wrapper = outermost ?? node;
  const binding = ctx.resolve(node);
  if (
    binding &&
    binding.name in structType.fields &&
    binding.type === structType.fields[binding.name]
  ) {
    return { binding, wrapperNode: wrapper };
  }
  // Recurse into collapsed sequences to find the binding deeper
  if (node.kind === "sequence") {
    for (const inner of node.attrs.nodes) {
      const result = resolveFieldBinding(inner, ctx, structType, wrapper);
      if (result) return result;
    }
  }
  return undefined;
}

/**
 * Find description from a node, traversing through wrappers.
 * Only traverses into sequences when the field type indicates the seq was
 * collapsed (non-struct), avoiding stealing docs from nested struct children.
 */
function findDoc(node: Expr, fieldType: BoundType): string | undefined {
  if (node.meta?.doc?.description) return node.meta.doc.description;
  switch (node.kind) {
    case "optional":
      return findDoc(node.attrs.node, fieldType.kind === "optional" ? fieldType.inner : fieldType);
    case "repeat":
      return findDoc(node.attrs.node, fieldType.kind === "list" ? fieldType.item : fieldType);
    case "sequence": {
      // Only traverse into sequences that were collapsed (non-struct field types).
      // Struct sequences have their own collectFieldInfo call for their children.
      if (fieldType.kind === "struct") return undefined;
      for (const child of node.attrs.nodes) {
        const doc = findDoc(child, fieldType);
        if (doc) return doc;
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

// -- Type name resolution --

export function resolveTypeName(
  namedTypes: Map<string, string>,
): (type: BoundType) => string | undefined {
  return (type) => {
    const key = typeKey(type);
    return key ? namedTypes.get(key) : undefined;
  };
}
