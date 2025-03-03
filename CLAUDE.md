# pump-rand Development Guide

## Build Commands
- **Rust**: `cargo run --bin server` or `cargo run --bin listener`
- **Frontend**: `bun run web:dev` for development, `bun run web:build` for production
- **Contracts**: `bun run contract:build` to build, `bun run contract:deploy` to deploy
- **Complete Local Environment**: `bun dev:local` or `bun dev:local:reset` to reset

## Testing
- **Rust**: `cargo test` for all tests or `cargo test <test_name>` for specific tests
- **Solidity**: `forge test` or `forge test --match-test <test_name>` for specific tests
- **Frontend**: No specific test command found

## Linting/Formatting
- **Rust**: `bun run rust:fmt` or `bun run rust:fmt:check` for check-only
- **Frontend**: `bun run web:lint` for TypeScript/React code

## Database
- **Migrations**: `bun run db:migrate` to run, `bun run db:revert` to revert, `bun run db:reset` to clear and recreate

## Code Style Guidelines
- **Rust**: Use granular imports, max small heuristics, 100-char comments with wrapping, vertical trailing commas, field init shorthand
- **TypeScript**: Use strict type checking, ESLint with hooks plugin, Prettier with import sorting
- **Solidity**: Follow Foundry testing patterns with explicit assertions, clear test naming conventions
- **General**: Descriptive variable names, explicit error handling, comprehensive tests for edge cases