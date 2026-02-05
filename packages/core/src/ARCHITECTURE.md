# Architecture

A compiler for CLI interface specifications. Parses CLI definitions from various sources, optimizes the intermediate representation, solves for minimal parameter bindings, and generates typed wrappers and schemas for multiple target languages.

## Pipeline

```mermaid
flowchart LR
    subgraph Frontend
        F1[Boutiques]
        F2[Argparse]
        F3[...]
    end

    subgraph IR
        IR1[Expr Tree]
        IR2[Passes]
    end

    subgraph Solver
        S1[Solve]
        S2[Bindings]
    end

    subgraph Backend
        B1[Python]
        B2[R]
        B3[TypeScript]
        B4[JSON Schema]
    end

    F1 & F2 & F3 --> IR1
    IR1 --> IR2 --> S1 --> S2

    S2 --> B1 & B2 & B3 & B4
    IR2 -.-> B1 & B2 & B3
```

## Core Concepts

| Module        | Purpose                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **ir**        | Canonical expression tree (Expr = Literal \| Sequence \| Alternative \| Optional \| Repeat \| Int \| Float \| Str \| Path) |
| **ir/passes** | Optimization passes: flatten, simplify, canonicalize                                                                       |
| **bindings**  | Solved types (BoundType = scalar \| bool \| count \| optional \| list \| struct \| union \| nullable)                      |
| **solver**    | IR → Bindings via pattern matching                                                                                         |
| **manifest**  | Optional metadata: Project > Package > App                                                                                 |
| **frontend**  | Parsers producing IR                                                                                                       |
| **backend**   | Code generators consuming IR + Bindings                                                                                    |

## Solver Patterns

| IR Pattern              | BoundType            |
| ----------------------- | -------------------- |
| `optional<literal>`     | `bool`               |
| `repeat<literal>`       | `count`              |
| `optional<T>`           | `optional<solve(T)>` |
| `repeat<T>`             | `list<solve(T)>`     |
| `sequence<...named...>` | `struct<...>`        |
| `alternative<...>`      | `union<...>`         |
| terminal                | `scalar`             |
