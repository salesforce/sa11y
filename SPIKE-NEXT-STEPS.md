# Sa11y Custom Rules Spike — Handoff / Next Steps

**Work item:** W-22990841 — Custom rules for Sa11y Selenium
**Plan:** `core/.eclipse/custom-rules.md` (targets WCAG SC 1.4.12, 2.5.3, 1.4.10)
**This branch base:** sa11y `master` @ `7fb5873d64520a236f3bad0c2de3657f419d4565`
**Core branch in play:** `t/aia11y/w-22944875/resize-reflow-duallistbox-iframe-issue` @ `bbed8e6af56ac`

---

## TL;DR — what was done

1. Implemented **3 custom Sa11y rules** (this repo, `packages/preset-rules/src/custom-rules/`).
2. Rebuilt `@sa11y/browser-lib` → `sa11y.min.js`.
3. Patched that JS into a **local copy of `axeservice-lib-0.19.17.jar`** and swapped it into the
   Bazel external repo so Core's FTest console picks it up **without publishing to Nexus**.
4. Enabled the rules for the Selenium FTest console via the runtime rule-list JSON in Core.

The JAR override and the Core JSON edit are **not committed** — they are local spike scaffolding.
Only the rule source (`rules.ts`, `checks.ts`) is committed on this branch.

---

## 1. Rules implemented (committed here)

| Rule ID | SC | Check logic |
|---------|-----|-------------|
| `sa11y-text-spacing-overflow` | **1.4.12** Text Spacing | Injects `word-spacing:0.16em`, `letter-spacing:0.12em`, `line-height:1.5` (`!important`), forces reflow, flags element if content is **newly** clipped (`scrollWidth/Height > clientWidth/Height`) vs. before-state; restores original inline styles afterward. |
| `sa11y-label-in-name` | **2.5.3** Label in Name | Flags interactive elements whose accessible name (`aria-label`/`aria-labelledby`) does not *contain* the normalized visible text. |
| `Resize-reflow-textoverflow` | **1.4.10** Reflow | **Fixed** the pre-existing check: `if (!node.innerText === "")` (dead guard, always false) and `-webkit-line-clamp != 0` (string-vs-number). Now correctly detects ellipsis/line-clamp truncation. |

Files:
- `packages/preset-rules/src/custom-rules/rules.ts` — rule definitions (selectors, tags, check refs)
- `packages/preset-rules/src/custom-rules/checks.ts` — evaluate() implementations (stringified JS)

**Validation so far:** all 5 evaluate fns parse as valid JS; 2.5.3 logic passed 6 jsdom cases
(incl. real bugs W-21264725 and the Cloud-Manager labelledby case); 1.4.12 + 1.4.10 are
runtime-safe (no throw). **Layout-dependent detection (1.4.12, 1.4.10) has NOT yet been
confirmed in a real browser** — that is the top next step (see §5).

---

## 2. How to rebuild the bundle (do this after ANY rule edit)

Environment gotchas in this workspace:
- `yarn` is blocked by the proxy SSL rewrite. Use **npm against the public registry**:
  ```
  cd ~/sa11y
  npm install --registry=https://registry.npmjs.org/ --no-audit --no-fund --ignore-scripts
  ```
  (`--ignore-scripts` skips the chromedriver postinstall, which the proxy blocks. There is
  **no browser in this env**, so wdio can't run here — validation happens in Core FTest.)
- After install, restore install noise so the branch stays clean:
  `git checkout -- .npmrc yarn.lock && rm -f package-lock.json`

Build:
```
cd ~/sa11y
./node_modules/.bin/tsc --build packages/common packages/format packages/preset-rules
cd packages/browser-lib && ../../node_modules/.bin/rollup -c rollup.config.mjs
# → packages/browser-lib/dist/sa11y.min.js
```
Note: full `tsc --build` fails on an unrelated nested `@types/node` in `packages/vitest`
(npm hoisting artifact) — build only the three packages above.

---

## 3. How the local JAR override works (spike, no publish)

Core FTest (Selenium) uses the **Maven** artifact `com.salesforce.sa11y:axeservice-lib:0.19.17`,
which **bundles `sa11y.min.js`**. The rule *definitions* live in that JS; the Java classes don't
change when rules change. (The separate npm `@sa11y/*@8.0.28` in Core drives Jest/JSDOM only —
layout rules can't be validated there.)

Rebuild the patched jar and swap it in place:
```
SRCJAR=<bazel-cache>/external/com_salesforce_sa11y_axeservice_lib/axeservice-lib-0.19.17.jar
WORK=/tmp/sa11y-spike-jar; rm -rf "$WORK"; mkdir -p "$WORK/extract"
cd "$WORK/extract" && unzip -q "$SRCJAR"
cp ~/sa11y/packages/browser-lib/dist/sa11y.min.js ./sa11y.min.js
jar cf "$WORK/axeservice-lib-0.19.17-spike.jar" .
# back up original once, then swap:
EXT=$(dirname "$SRCJAR")
[ -f "$EXT/axeservice-lib-0.19.17.jar.orig-bak" ] || cp -p "$SRCJAR" "$EXT/axeservice-lib-0.19.17.jar.orig-bak"
cp "$WORK/axeservice-lib-0.19.17-spike.jar" "$SRCJAR"
```
Bazel cache root this session: `/opt/workspace/.cache/bazel/870f52784d8c1b05455eb2199b432d26`
- original jar sha256: `d9de61fbe94ac8226f3dfebe9c6648257fb37a41b1478c6a30c94ba38fa78b2d`
- patched  jar sha256: `d254ff954cd8020bf391246ba096e5bb02315548c3b784f176eb2a45cc79dc8f`

**Why in-place swap and NOT a sha bump in the .bzl:** changing the sha in
`third_party/dependencies/pinned_catalog/com_salesforce_sa11y.bzl` invalidates the repo rule and
forces Bazel to **re-fetch the original** from Nexus (the opposite of what we want). Leaving the
`.bzl` untouched means Bazel keeps the swapped file (verified: `bazel build
@com_salesforce_sa11y_axeservice_lib//jar:file` did not re-fetch; execroot jar = `d254ff95…`).

**What clobbers the swap** (re-run the swap if any happen):
`bazel clean --expunge`, `bazel sync`/`fetch --force` on that repo, or editing the version/sha in
`third_party/dependencies/com_salesforce_sa11y.bzl` / `pinned_catalog/com_salesforce_sa11y.bzl`.

`bazel run //:core` does **not** touch it — `//:core` doesn't even depend on `axeservice-lib`
(it's a dep of `sfdc-test/func` + `sfdc-testutils/test/func` only; verified via `somepath` query).

---

## 4. Changes required in CORE (not committed — spike scaffolding)

Repo: `/opt/workspace/core-public/core`

1. **Enable the rules at FTest runtime** — `sfdc-testutils/test/func/java/resources/sa11y-rules/sa11y-custom-rules-selenium.json`:
   ```json
   { "rules": ["sa11y-Keyboard-button", "sa11y-text-spacing-overflow", "sa11y-label-in-name", "Resize-reflow-textoverflow"] }
   ```
   This file is read via the `-Dsa11y.customRulesPath` system property in
   `sfdc-testutils/test/func/java/src/accessibility/util/AccessibilityTestService.java:850`.
   The `runOnly` list is what bounds runtime (perf/timeout concern from the plan) — only listed
   rules fire.

2. **(Local jar swap)** — see §3. Nothing in the Core git tree changes for this; the swap is in
   the Bazel external cache.

**For a REAL (non-spike) rollout later**, Core changes become:
- Publish a new `axeservice-lib` version to Nexus containing the rebuilt `sa11y.min.js`.
- Bump `_COM_SALESFORCE_SA11Y_AXESERVICE_LIB_VERSION` in
  `third_party/dependencies/com_salesforce_sa11y.bzl`.
- Regenerate `third_party/dependencies/pinned_catalog/com_salesforce_sa11y.bzl` (sha256/sha1) via
  graph-tool (`bazel run //:graph-tool -- …`) — it's a generated "DO NOT EDIT" file.
- Commit the selenium JSON rule-list change.
- NOTE: the `axeservice-lib` **Java** sources are NOT in this github repo — they live in a
  separate internal build that packages `sa11y.min.js` into the jar and publishes to Nexus.
  Locate that pipeline before a real publish (open question from the spike).

---

## 5. Next steps (in priority order)

1. **Validate layout rules in a real browser via Core FTest console.** Run a few a11y-enabled
   Selenium tests with `-Dsa11y.customRulesPath=<abs path to sa11y-custom-rules-selenium.json>`.
   Confirm `sa11y-text-spacing-overflow` and `Resize-reflow-textoverflow` actually fire on known
   truncation/text-spacing bug pages (plan §3 lists example W-items). For 1.4.10, set the viewport
   to ~320px CSS width (≈400% zoom) before the check.
2. **Tune false positives.** The 1.4.12 before/after diff and the selector lists in `rules.ts` are
   first-pass; check against the plan's <5% spike / <1% prod FP target. Watch intentionally-scrolling
   containers (code blocks) — may need an allowlist.
3. **2.5.3 route coverage.** Plan notes the real gap may be autobuild routes not reaching
   comboboxes, not just rule logic — audit route coverage in parallel.
4. **Measure perf per rule per page** (plan Phase 2) before widening the `runOnly` list.
5. **Add unit tests** for the new checks in this repo (see existing patterns in
   `packages/matcher/__tests__/automaticMatcher.test.ts` and `packages/common/__tests__/helpers.test.ts`).
6. When methodology is confirmed, do the **real Nexus publish + .bzl bump** (see §4).

---

## Quick reference — key files

- Rules (this repo): `packages/preset-rules/src/custom-rules/{rules.ts,checks.ts}`
- Bundle output: `packages/browser-lib/dist/sa11y.min.js`
- Core rule-list JSON: `core/sfdc-testutils/test/func/java/resources/sa11y-rules/sa11y-custom-rules-selenium.json`
- Core consumer: `core/sfdc-testutils/test/func/java/src/accessibility/util/AccessibilityTestService.java`
- Core version pin: `core/third_party/dependencies/com_salesforce_sa11y.bzl` (+ `pinned_catalog/com_salesforce_sa11y.bzl`)
