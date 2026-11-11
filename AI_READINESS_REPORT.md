# AI Readiness: salesforce/sa11y

**46% Human | 48% AI** — L1 Reactive

> Audited 2026-05-04 | Rubric v1.2 | Type: code-monorepo | Enterprise: true | Source: working tree

---

## Executive Summary

**Status**: Below InnerSource standards — strong security and development process, but missing key discoverability, governance, and AI context infrastructure.

**Key Findings**:
- Strong security and CI/CD foundation (SEC: 88%, DEV: 65%) with semantic-release, pinned SHA actions, and comprehensive CONTRIBUTING.md
- Critical governance gaps — no trusted committers file, no CODEOWNERS rules beyond wildcard, no architecture docs or innersource.json
- No AI tool compatibility — no CLAUDE.md, AGENTS.md, or `.ai/` context files; Claude Code and all cross-vendor agents start cold

**Top 3 Actions** (~3 hrs of work):
1. Add `.ai/context.md` with package architecture, key files, and common tasks (+~8% AI)
2. Create `CLAUDE.md` + `AGENTS.md` for tool compatibility (+~5% Human & AI)
3. Add `innersource.json` + issue/PR templates to signal InnerSource readiness (+~4% Human)

---

## Scores at a Glance

| Dimension | Score | Level | Checks Passing |
|-----------|:-----:|:-----:|:--------------:|
| **Human Readiness** | 46% | L1 Reactive | 18/40 |
| **AI Readiness** | 48% | L1 Reactive | 20/44 |

**Repository Type**: code-monorepo — `lerna.json` + Yarn `workspaces`, 11 packages under `packages/`  
**Detected Stack(s)**: JavaScript/TypeScript  
**Enterprise context**: supply-chain guard is active — fixes avoid `.pre-commit-config.yaml`, `.husky/`, and third-party GitHub Actions.

**Category Health**:
- 🟢 Strong: Security & Compliance (88%), Development Process (65%), Documentation (62%)
- 🟡 Needs Work: Discoverability (50%), Contributor Experience (39%), Communication (38%)
- 🔴 Critical Gaps: Community Health (20%), Governance & Roles (19%)

*Note: 14 checks marked not applicable for this repository type (platform API checks, LLM checks, no external contract surface).*

---

<details>
<summary><strong>📋 Category Breakdown</strong> (8 categories)</summary>

| Category | Human Score | AI Score | Passing |
|----------|:-----------:|:--------:|:-------:|
| Documentation | 62% | 52% | 7/13 |
| Contributor Experience | 39% | 40% | 4/9 |
| Governance & Roles | 19% | 18% | 2/8 |
| Development Process | 65% | 65% | 8/12 |
| Communication | 38% | 28% | 1/3 |
| Discoverability | 50% | 50% | 1/2 |
| Community Health | 20% | 18% | 1/4 |
| Security & Compliance | 88% | 88% | 4/5 |

**Weights**: Documentation (H: 22%, AI: 28%) | Contributor Experience (H: 18%, AI: 22%) | Governance (H: 15%, AI: 8%) | DevProcess (H: 13%, AI: 24%) | Communication (H: 13%, AI: 4%) | Discoverability (H: 8%, AI: 3%) | Community (H: 7%, AI: 7%) | Security (H: 4%, AI: 4%)

</details>

---

## Recommendations

### Critical Issues

- **DOC-008**: No architecture documentation — create `ARCHITECTURE.md` describing monorepo package layout, data flow (axe-core → preset-rules → assert → jest/vitest/wdio), and entry points — [InnerSource pattern](https://patterns.innersourcecommons.org/p/repository-activity-score)
- **GOV-001**: No trusted committers documented — add `TRUSTED_COMMITTERS.md` or "Who We Are" README section with names and responsibilities — [InnerSource pattern](https://patterns.innersourcecommons.org/p/trusted-committer)
- **DOC-009**: No AI context files — add `.ai/context.md` with package overview, common tasks, key file map, and gotchas so AI agents can orient immediately

### Important

- **CX-001**: No issue templates — add `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`
- **CX-002**: No PR template — add `.github/pull_request_template.md` with description, testing, and checklist fields
- **GOV-002**: No governance level statement — declare open/collaborative stance in README or `innersource.json`
- **GOV-005**: CODEOWNERS has only a wildcard (`* @salesforce/sa11y-reviewers`) — add per-package rules for finer-grained ownership
- **DIS-003**: No `innersource.json` — add with `name`, `description`, `trusted_committers`, and `communication` fields
- **DOC-005**: No communication/support channel documented — add a "Getting Help" section to README with GitHub Discussions or issue link
- **DOC-012**: No pinned Node version (no `.nvmrc` or `.node-version`) and no env vars documented — `engines` field in `package.json` is present but not surfaced in docs

<details>
<summary>Nice to Have (8 items)</summary>

- **DOC-002**: README lacks Getting Started section and code blocks — add a quick-start code snippet and prerequisites
- **DOC-010**: No backtick-quoted file paths in task navigation docs — add task-to-file mappings in CONTRIBUTING or `.ai/common-tasks.md`
- **DEV-003**: `package.json` is private (monorepo root) — ensure individual package manifests carry semver versions; lerna does this but pre-check can't confirm from root alone
- **GOV-003**: No ADR directory or decision records — add `docs/adr/` or link to an external decision log
- **GOV-004**: No roles documented with responsibilities — describe `Trusted Committer` and `Contributor` roles
- **CH-001**: No warranty/support period documented — add a brief support commitment to CONTRIBUTING.md
- **CH-002**: No contributor recognition system — add `CONTRIBUTORS.md` or `.all-contributorsrc`
- **CX-006**: No response time SLA documented — add a "5 business days" or similar commitment to CONTRIBUTING.md

</details>

---

## Path to L2 Contributive

**Current**: 48% AI | 46% Human  
**Need**: L2 Contributive = 55%  
**Gap**: 7% AI | 9% Human

### To Reach 55% Human (~2 hrs of work)

| Do This | Gains | Time |
|---------|:-----:|:----:|
| Add `.ai/context.md` + `CLAUDE.md` (DOC-008, DOC-009) | +5% | 60 min |
| Add issue + PR templates (CX-001, CX-002) | +3% | 20 min |
| Add `innersource.json` (DIS-003) | +1% | 10 min |

**After these actions**: ~55% Human → **L2 Contributive** ✅

### To Reach 55% AI (~2.5 hrs of work)

| Do This | Gains | Time |
|---------|:-----:|:----:|
| Add `.ai/context.md` with full architecture (DOC-008, DOC-009) | +6% | 60 min |
| Add `CLAUDE.md` + `AGENTS.md` (DOC-009) | +2% | 20 min |
| Add `innersource.json` + templates (DIS-003, CX-001, CX-002) | +2% | 20 min |

**After these actions**: ~55% AI → **L2 Contributive** ✅

---

<details>
<summary><strong>🤖 AI Tool Compatibility</strong></summary>

| Tool | Status | What's Present |
|------|:------:|----------------|
| Claude Code | ❌ None | No CLAUDE.md or .ai/ context files |
| Cross-vendor (AGENTS.md) | ❌ None | No AGENTS.md |
| Cursor | N/A (enterprise) | Not an approved tool in Salesforce-internal environment |
| GitHub Copilot | N/A (enterprise) | Not available in Salesforce-internal environment |
| Windsurf | N/A (enterprise) | Not an approved tool in Salesforce-internal environment |
| Generic AI | ⚠️ Partial | README present (DOC-002 partial), no ARCHITECTURE.md, strong CONTRIBUTING.md |

**Legend**: ✅ Full support | ⚠️ Partial support | ❌ No support

</details>

---

<details>
<summary><strong>🔍 Detailed Check Results</strong> (66 core checks)</summary>

### Documentation (7/13 passing — 62% Human / 52% AI)

- **[PASS]** DOC-001 (README Exists) — README.md exists (9181 chars)
- **[WARN]** DOC-002 (README Quality, score 0.30) — README has strong package descriptions but no Getting Started/Prerequisites sections and 0 code blocks  
  💡 Add a quick-start snippet and prerequisites section to README
- **[PASS]** DOC-003 (CONTRIBUTING Exists) — CONTRIBUTING.md exists (12523 chars)
- **[PASS]** DOC-004 (CONTRIBUTING Quality, score 0.90) — 4/4 setup steps found; 3 in code blocks
- **[FAIL]** DOC-005 (COMMUNICATION Exists) — No COMMUNICATION.md, SUPPORT.md, or "Getting Help" README section  
  💡 Add a "Getting Help" section to README linking to GitHub Issues or Discussions
- **[PASS]** DOC-006 (LICENSE) — LICENSE.txt present matching BSD-3-Clause
- **[PASS]** DOC-007 (Code of Conduct) — CODE_OF_CONDUCT.md exists
- **[FAIL]** DOC-008 (Architecture Quality) — No ARCHITECTURE.md and no README architecture section  
  💡 Create ARCHITECTURE.md describing the package dependency chain: axe-core → preset-rules → matcher → assert → jest/vitest/wdio
- **[FAIL]** DOC-009 (AI Agent Context) — No CLAUDE.md, AGENTS.md, or .ai/ directory  
  💡 Add `.ai/context.md` with package map, common tasks, and gotchas; add CLAUDE.md referencing it
- **[FAIL]** DOC-010 (Task Navigation) — 0 backtick-quoted file path references found in docs  
  💡 Add task-to-file mappings (e.g., `` `packages/jest/src/index.ts` — entry point for Jest integration ``) to CONTRIBUTING or .ai/common-tasks.md
- **[N/A]** DOC-011 (Code Documentation Coverage) — No source files found in pre-check (monorepo root)
- **[FAIL]** DOC-012 (Environment Requirements, score 0.0) — No .nvmrc, no env vars documented; `engines` field present but not surfaced in docs  
  💡 Add `.nvmrc` pinning Node version and a "Prerequisites" section in README
- **[WARN]** DOC-013 (Monorepo Navigation, score 0.66) — 2/3 elements: package list present, working-in-package docs present, inter-package dep docs absent  
  💡 Add a section explaining how packages depend on each other (e.g., `@sa11y/common` → `@sa11y/assert` → `@sa11y/jest`)
- **[WARN]** DOC-014 (Navigation Graph Integrity, score 0.70) — CONTRIBUTING reachable from README, links resolve well; no "Where things live" directory map  
  💡 Add a brief directory map table to README or ARCHITECTURE.md
- **[N/A]** DOC-015 (AI Context Budget) — No AI context files (DOC-009 = 0)

---

### Contributor Experience (4/9 passing — 39% Human / 40% AI)

- **[FAIL]** CX-001 (Issue Templates) — No `.github/ISSUE_TEMPLATE/` directory  
  💡 Add bug_report.md and feature_request.md issue templates
- **[FAIL]** CX-002 (PR Template) — No `.github/pull_request_template.md`  
  💡 Add a PR template with description, test plan, and checklist
- **[FAIL]** CX-003 (Good First Issues) — No "good first issue" mention in docs  
  💡 Add a "good first issue" label guide to CONTRIBUTING.md
- **[PASS]** CX-004 (Contributor Onboarding) — 8/8 onboarding weight: clone, install, test all in code blocks
- **[WARN]** CX-005 (One-Command Setup, score 0.60) — Multi-step process in code blocks (clone → yarn install → yarn build)  
  💡 Consider adding a `.devcontainer/` for one-command setup
- **[FAIL]** CX-006 (Response Time SLA) — No response time commitment documented  
  💡 Add "We aim to respond within 5 business days" to CONTRIBUTING.md
- **[FAIL]** CX-007 (Working Examples) — No `examples/` directory  
  💡 Add an `examples/` directory with minimal usage examples for Jest and Vitest integrations
- **[PASS]** CX-008 (Command Discoverability) — build, test, lint all present in package.json scripts
- **[FAIL]** CX-009 (Structured Acceptance Criteria) — No issue/PR templates with acceptance criteria structure

---

### Governance & Roles (2/8 passing — 19% Human / 18% AI)

- **[FAIL]** GOV-001 (Trusted Committers) — No TRUSTED_COMMITTERS.md or MAINTAINERS.md  
  💡 Add TRUSTED_COMMITTERS.md listing names and responsibilities
- **[FAIL]** GOV-002 (Governance Level) — No explicit governance level statement  
  💡 Add a governance statement to README or innersource.json
- **[FAIL]** GOV-003 (Decision-Making Process) — No `docs/adr/` directory or external ADR link  
  💡 Add `docs/adr/` with numbered records or link to a decision log
- **[FAIL]** GOV-004 (Roles Documented) — No roles described with responsibilities  
  💡 Add Trusted Committer and Contributor role descriptions to CONTRIBUTING.md
- **[WARN]** GOV-005 (CODEOWNERS, score 0.10) — CODEOWNERS exists but contains only `* @salesforce/sa11y-reviewers` (wildcard-only)  
  💡 Add per-package rules (e.g., `packages/jest/ @salesforce/sa11y-reviewers`)
- **[WARN]** GOV-006 (Contribution Acceptance Criteria, score 0.50) — 1/4 elements found: PR title convention documented  
  💡 Document which areas welcome contributions, which are off-limits, and the proposal process
- **[PASS]** GOV-007 (Mechanical Review Floor) — Pre-commit hooks (lint-staged) + Snyk SAST in CI
- **[WARN]** GOV-008 (GUSINFO Team Ownership, score 0.50) — CODEOWNERS has `#ECCN: Open Source` and `#Open Source Workflow` but no team contact  
  💡 Add `#Team:` and `#Email:` comments to CODEOWNERS

---

### Development Process (8/12 passing — 65%)

- **[PASS]** DEV-001 (CI/CD Setup) — 3 workflows in `.github/workflows/` (CI + release)
- **[WARN]** DEV-002 (Release Process, score 0.75) — CHANGELOG.md exists; semantic-release in CI; no explicit release workflow docs in CONTRIBUTING  
  💡 Add a brief "Release Process" note to CONTRIBUTING.md
- **[FAIL]** DEV-003 (Semantic Versioning) — Root `package.json` has no version (private monorepo); individual packages have versions via lerna  
  💡 Verify `lerna.json` version field is kept up to date (currently `8.0.27`)
- **[PASS]** DEV-004 (Code Review Process) — Review process in CONTRIBUTING + CODEOWNERS present
- **[WARN]** DEV-005 (Testing Strategy, score 0.40) — Test files present, test command exists; no explicit test writing guide  
  💡 Add a test writing guide section to CONTRIBUTING.md
- **[WARN]** DEV-006 (Branch Protection, score 0.50) — CODEOWNERS present but no documented required-review policy  
  💡 Document branch protection requirements in CONTRIBUTING.md
- **[WARN]** DEV-007 (Setup Validation, score 0.50) — CI validates full chain; no `.devcontainer/` or local verify script  
  💡 Consider adding a `yarn verify` script that runs build + test to confirm setup
- **[WARN]** DEV-008 (Test Writing Guide, score 0.75) — 3/5 elements: file placement documented, run-single-test documented, test utilities documented; missing naming conventions and example test  
  💡 Add naming conventions (e.g., `*.spec.ts`) and a minimal example test to CONTRIBUTING.md
- **[PASS]** DEV-009 (Code Style Enforcement) — ESLint config + `lint:fix` command present
- **[WARN]** DEV-010 (Type Safety, score 0.75) — tsconfig.json extends `@tsconfig/node16/tsconfig.json`; not strict  
  💡 Consider enabling `"strict": true` in tsconfig.json for stronger type safety
- **[N/A]** DEV-011 (Executable Specifications) — No external contract surface detected
- **[WARN]** DEV-012 (Feedback Loop Discoverability, score 0.60) — `test:watch` and `build:watch` present; no standalone typecheck command  
  💡 Add a `typecheck` script (`tsc --noEmit`) for fast type checking without build
- **[FAIL]** DEV-013 (CI-Tool Alignment, score 0.0) — CI runs lint+build+test but pre-check could not confirm all tools (jest, eslint, prettier, tsc) are explicitly invoked in workflow YAML  
  💡 Verify CI workflow explicitly invokes `yarn lint`, `yarn test`, and `tsc --noEmit`
- **[N/A]** DEV-014 (AI Evaluation Harness) — No LLM dependencies

---

### Communication & Transparency (1/3 passing — 38%)

- **[WARN]** COM-001 (Public Channels, score 0.50) — GitHub URL and npm links present; no specific Slack channel or forum linked  
  💡 Add a specific communication channel (GitHub Discussions, Slack `#sa11y`, or forum) to README
- **[N/A]** COM-002 (Async-First) — Cannot assess without platform API
- **[N/A]** COM-003 (Issue Tracker Active) — Cannot assess without platform API
- **[WARN]** COM-004 (Support Process, score 0.50) — SECURITY.md has reporting channel; no structured "where to ask questions" guide  
  💡 Add a "Support" section to README linking to GitHub Issues for questions

---

### Discoverability (1/2 passing — 50%)

- **[N/A]** DIS-001 (Repository Description) — Requires platform API
- **[N/A]** DIS-002 (Repository Topics) — Requires platform API
- **[FAIL]** DIS-003 (InnerSource Metadata) — No `innersource.json`  
  💡 Add `innersource.json` with name, description, trusted_committers, and communication fields
- **[PASS]** DIS-004 (Homepage URL) — `homepage` set in package.json

---

### Community Health (1/4 passing — 20%)

- **[FAIL]** CH-001 (Warranty Policy) — No support period documented  
  💡 Add a support commitment (e.g., "best-effort support") to CONTRIBUTING.md
- **[FAIL]** CH-002 (Contributor Recognition) — No CONTRIBUTORS.md or .all-contributorsrc  
  💡 Add CONTRIBUTORS.md or integrate all-contributors bot
- **[PASS]** CH-003 (Activity Score) — Last commit 3 days ago (active)
- **[FAIL]** CH-004 (Welcome Automation) — No first-time contributor automation  
  💡 Add a welcome workflow in `.github/workflows/welcome.yml`
- **[N/A]** CH-005 (Dogfooding Consistency) — Not a dev-tool repo

---

### Security & Compliance (4/5 passing — 88%)

- **[PASS]** SEC-001 (Security Policy) — SECURITY.md exists with `security@salesforce.com` reporting contact
- **[PASS]** SEC-002 (Dependency Management) — `yarn.lock` committed + Snyk automation in CI
- **[WARN]** SEC-003 (Gitignore Coverage, score 0.25) — `.gitignore` exists but no sensitive patterns (`.env`, `*.pem`, `*.key`)  
  💡 Add `.env`, `*.pem`, `*.key`, `credentials*` patterns to `.gitignore`
- **[N/A]** SEC-004 (Export Control) — No cryptographic content detected
- **[PASS]** SEC-005 (Committed Dependencies) — No committed `node_modules/` or other dependency caches
- **[N/A]** SEC-006 (AI-Context Opt-Out) — No defensive exclusions active
- **[PASS]** SEC-007 (ECCN Declaration) — CODEOWNERS has `#ECCN: Open Source`

---

**Legend**: [PASS] ≥80% | [WARN] 40-79% | [FAIL] <40% | [N/A] Not Applicable

</details>

---

## Next Steps

### Path to L2 Contributive

**Quick wins** (do these first):
1. **Add `.ai/context.md`** — describe the package architecture (axe-core → preset-rules → assert → jest/vitest/wdio), key files, and common dev tasks (~60 min, largest single score impact)
2. **Add `CLAUDE.md` + `AGENTS.md`** — thin wrappers referencing `.ai/` files (~20 min)
3. **Add issue + PR templates** — copy from `salesforce/lwc` as a starting point (~20 min)
4. **Add `innersource.json`** — signal InnerSource participation (~10 min)

💡 **Tip**: Run `/ai-ready audit --fix` to auto-generate fixes in a PR that closes a tracking issue on merge.

---

## Fix Generation Results

### Projected Score Impact

| Dimension | Before | After | Delta |
|-----------|:------:|:-----:|:-----:|
| Human | 46% (L1 Reactive) | 56% (L2 Contributive) | +10% |
| AI | 48% (L1 Reactive) | 61% (L2 Contributive) | +13% |

> **Note**: Projected scores reflect the working tree with generated fixes. Actual scores are measured from the default branch after merge.

### Files Modified/Created

**Tier 1: Ready to Merge** (9 files)

- `.ai/context.md` — Package architecture, dependency chain, key directories, key files, gotchas
- `.ai/common-tasks.md` — Task-to-file workflows (add rule preset, debug tests, bump versions)
- `.ai/patterns.md` — Coding conventions, patterns to follow/avoid
- `.ai/dependencies.md` — Runtime requirements, env vars, CI environment
- `CLAUDE.md` — Thin Claude Code context file referencing `.ai/` files
- `AGENTS.md` — Inline cross-vendor agent orientation (condensed summary + commands)
- `innersource.json` — InnerSource metadata (participating: true, trusted committers, issue URL)
- `.github/ISSUE_TEMPLATE/bug_report.md` — Bug report template with acceptance criteria
- `.github/ISSUE_TEMPLATE/feature_request.md` — Feature request template with acceptance criteria
- `.github/pull_request_template.md` — PR template with checklist and acceptance criteria
- `README.md` — Added AI Readiness badge (L2, 56% Human | 61% AI)

**Tier 3: Not Generated** (needs human authorship)

- **GOV-001** — Add `TRUSTED_COMMITTERS.md` with names and responsibilities
- **GOV-002** — Add explicit governance level statement (e.g., in innersource.json or README)
- **GOV-003** — Create `docs/adr/` with numbered decision records or link to external ADR registry
- **DOC-005** — Add "Getting Help" section to README with a specific communication channel
- **innersource.json `channel`** — Replace TODO placeholder with your team's verified Slack channel name
