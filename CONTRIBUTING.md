# Contributing to ScamShield AI

Thank you for your interest in contributing. This document covers the process for reporting bugs, requesting features, and submitting pull requests.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Reporting Bugs](#reporting-bugs)
4. [Requesting Features](#requesting-features)
5. [Pull Request Process](#pull-request-process)
6. [Development Setup](#development-setup)
7. [Commit Conventions](#commit-conventions)
8. [Code Style](#code-style)
9. [Branch Strategy](#branch-strategy)

---

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally.
3. Follow the [Installation](./README.md#installation) steps in the README.
4. Create a **feature branch** from `main`.
5. Make your changes, run lint and tests, then open a pull request.

---

## Reporting Bugs

Before opening a bug report:

- Check the [open issues](https://github.com/shubhh004/ScamShield-AI/issues) to avoid duplicates.
- Verify you can reproduce the bug on the latest `main`.

When opening a bug report, use the [bug report template](./.github/ISSUE_TEMPLATE/bug_report.md). Include:

- Clear description of the expected vs. actual behaviour
- Reproduction steps (minimal and exact)
- Screenshots or recordings if the bug is visual
- Environment details (OS, browser, Node.js version)

---

## Requesting Features

Use the [feature request template](./.github/ISSUE_TEMPLATE/feature_request.md). Describe:

- The problem you are trying to solve
- Your proposed solution
- Any alternatives you have considered

Features are evaluated against the project roadmap and architectural fit. Not all requests will be accepted, but all are read and considered.

---

## Pull Request Process

1. **Open an issue first** for non-trivial changes — discuss the approach before writing code.
2. **One concern per PR** — keep pull requests focused. A PR that fixes a bug should not also add a feature.
3. **Reference the issue** in your PR description with `Closes #123`.
4. **Pass all checks** — lint, type check, and build must all pass before review.
5. **Write a clear description** — explain what changed and why, not just what the diff shows.
6. **Respond to review feedback** promptly or let reviewers know if you need more time.

PRs that introduce security vulnerabilities, break the build, or do not follow the code style will not be merged.

---

## Development Setup

```bash
git clone https://github.com/<your-fork>/ScamShield-AI.git
cd ScamShield-AI

npm install
npm install --prefix client
npm install --prefix server

cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit server/.env with your credentials

npm run dev
```

Before pushing:

```bash
npm --prefix client run lint
npm --prefix server run lint
npm --prefix client run type-check
npm --prefix server run type-check
```

---

## Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <short description>

[optional body]
```

**Types:**

| Type | When to Use |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons — no logic change |
| `refactor` | Code restructuring with no feature or bug change |
| `test` | Adding or updating tests |
| `chore` | Build, dependency, or tooling changes |

**Examples:**

```
feat(url-scanner): add redirect chain depth to risk signals
fix(auth): clear refresh cookie on account deletion
docs(readme): update installation steps for Node 20
```

---

## Code Style

- **TypeScript everywhere** — no `any` unless absolutely unavoidable with a comment explaining why.
- **No commented-out code** — remove unused code; use version control instead.
- **No console.log** — use the structured logger in `server/src/config/logger.ts`.
- **No default exports from hooks** — use named exports.
- **Run Prettier before committing** — `npm run format` from the root.
- **Follow the existing patterns** — look at adjacent files before introducing a new pattern.

The ESLint configuration (`--max-warnings 0`) treats all warnings as errors. Fix them; do not disable rules.

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, deployable state. Direct commits are not accepted. |
| `develop` | Integration branch. Feature branches merge here first. |
| `feat/<name>` | New feature development |
| `fix/<name>` | Bug fix |
| `docs/<name>` | Documentation changes only |
| `chore/<name>` | Build or tooling changes |

PRs must target `main`. The maintainer merges `develop` → `main` for releases.
