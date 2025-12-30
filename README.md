# Styx

Command line tool wrapper compiler/generator.

## Development

```bash
npm install
npm run build
npm test
```

### Watch mode

```bash
# Terminal 1: Watch core library
npm run dev -w @styx/core

# Terminal 2: Run playground
npm run dev
```

## Project Structure

```
styx/
├── packages/
│   └── core/          # Core compiler library + CLI
├── playground/        # Svelte playground for testing
└── ...
```
