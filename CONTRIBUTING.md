# Contributing to Nova402 Utilities

Thank you for your interest in contributing to Nova402! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nova-utils.git
   cd nova-utils
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @nova402/core build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @nova402/express-sdk test

# Run tests in watch mode
pnpm test --watch
```

### Linting and Formatting

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm typecheck
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(express-sdk): add rate limiting middleware
fix(core): resolve payment verification race condition
docs(readme): update installation instructions
```

## Pull Request Process

1. **Update documentation** for any changed functionality
2. **Add tests** for new features
3. **Ensure all tests pass**: `pnpm test`
4. **Run linting**: `pnpm lint`
5. **Update CHANGELOG.md** if applicable
6. **Submit pull request** with clear description

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Adding New Packages

When creating a new package:

1. Create package directory: `packages/your-package/`
2. Add `package.json` with proper metadata
3. Include `tsconfig.json` extending base config
4. Add `README.md` with usage examples
5. Include comprehensive tests
6. Update root `package.json` workspaces

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Write self-documenting code
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Prefer composition over inheritance

## Testing Guidelines

- Write tests for all new features
- Maintain >80% code coverage
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for all exported functions
- Include code examples
- Document breaking changes
- Keep documentation up-to-date

## Release Process

Releases are handled by maintainers using changesets:

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

## Questions?

- Join our [Discord](https://discord.gg/nova402)
- Open a [Discussion](https://github.com/nova402/nova-utils/discussions)
- Email us at dev@nova402.com

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
