# Contributing to Atlas x402

Thank you for your interest in contributing to Atlas x402! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/atlas-x402.git
   cd atlas-x402
   ```

3. **Install dependencies**:
   ```bash
   # For TypeScript
   cd client && npm install
   cd ../server && npm install
   
   # For Python
   pip install -r requirements.txt
   
   # For Go
   cd go && go mod download
   ```

4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### TypeScript

```bash
cd client
npm run build
npm test

cd ../server
npm run build
npm test
```

### Python

```bash
pytest tests/
black src/
mypy src/
```

### Go

```bash
cd go
go test ./...
go vet ./...
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
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Run linting/formatting
5. Submit pull request with clear description

## Testing

All contributions must include tests. Test coverage should be maintained above 80%.

## Questions?

Feel free to open an issue or join our Discord community.

