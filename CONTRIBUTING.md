# Contributing Guidelines

We want to encourage the developer community to contribute to Sa11y. This guide has instructions to install, build, test and contribute. Adapted from [salesforce/lwc](https://github.com/salesforce/lwc/blob/master/CONTRIBUTING.md).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick start](#quick-start)
- [Requirements](#requirements)
- [Installation](#installation)
  - [1) Download the repository](#1-download-the-repository)
  - [2) Install Dependencies](#2-install-dependencies)
- [Building](#building)
- [Testing](#testing)
  - [Unit Testing](#unit-testing)
  - [Integration Testing](#integration-testing)
- [Release](#release)
  - [Making a pre-release](#making-a-pre-release)
    - [Upgrade dependencies](#upgrade-dependencies)
- [Editor Configurations](#editor-configurations)
  - [Types](#types)
  - [ESLint](#eslint)
- [Git Workflow](#git-workflow)
  - [Fork the repo](#fork-the-repo)
  - [Create a feature branch](#create-a-feature-branch)
  - [Make your changes](#make-your-changes)
    - [Media files](#media-files)
    - [Update dependency graph](#update-dependency-graph)
  - [Rebase](#rebase)
  - [Check your submission](#check-your-submission)
    - [Lint your changes](#lint-your-changes)
    - [Run tests](#run-tests)
  - [Create a pull request](#create-a-pull-request)
    - [Pull Request Title](#pull-request-title)
  - [Update the pull request](#update-the-pull-request)
  - [Commit](#commit)
    - [Commit Message Conventions](#commit-message-conventions)
    - [Commit Message Format](#commit-message-format)
    - [Reverting a commit](#reverting-a-commit)
    - [Commit Type](#commit-type)
    - [Commit Scope](#commit-scope)
    - [Commit Subject](#commit-subject)
    - [Commit Body](#commit-body)
    - [Commit Footer](#commit-footer)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Before you start, it helps to be familiar with [Web Accessibility](https://trailhead.salesforce.com/en/content/learn/trails/get-started-with-web-accessibility)

## Quick start

1. `yarn install` to install dependencies
2. Make changes while building, testing and linting the changed files

-   `yarn build:watch`
-   `yarn test:watch`
-   `yarn lint:watch`

3. Update changelog with `yarn release:changelog`
4. Stage changes in git and do `yarn commit` to check staged changes and commit them with a formatted commit message
5. Push changes to feature branch

## Requirements

-   [Node](https://nodejs.org/) >= 16
-   [Yarn](https://yarnpkg.com/) >= 1.22

## Installation

[Set up SSH access to Github][setup-github-ssh] if you haven't done so already.

### 1) Download the repository

```bash
git clone git@github.com:salesforce/sa11y.git
```

### 2) Install Dependencies

_We use [yarn](https://yarnpkg.com/)]. See this [CLI commands comparison cheat-sheet](https://yarnpkg.com/lang/en/docs/migrating-from-npm/) if you are used to npm._

```bash
yarn install
```

-   Have to do this every time there are changes to `package.json` from external sources e.g. after switching branches or after merging/rebasing
-   If this fails with an error about _UNABLE_TO_GET_ISSUER_CERT_LOCALLY_, _Error: unable to get local issuer certificate_, or a registry communication issue then re-verify that step 2 was successful.

## Building

When developing typescript compiler can be invoked using the `build` target.
With `:watch` the compiler would watch for changes and incrementally compile changed sources as required.

```bash
yarn build[:watch]
```

## Testing

### Unit Testing

When developing, utilize [jest](https://jestjs.io/en/) unit testing to provide test coverage for new functionality. To run the jest tests use the following command from the root directory:

```bash
yarn test
```

Additionally, the testing can be started in `watch` mode which allows for automatic test re-runs on a save:

```bash
yarn test:watch
```

To execute a particular test, use the following command:

```bash
yarn test <path_to_test>
```

To debug unit tests

1. Insert `debugger` in a new line in your code where you think it might be failing. This will serve as a break point for the debugger to stop at.
2. Optionally run only a specific test by using `it.only(..)`
3. Open up Chrome and type in the address bar: `chrome://inspect`
4. Click on "Open dedicated DevTools for Node"
5. In your terminal, type the following command: `yarn test:debug <path_to_test>`

Your test should now be running in the Chrome debugger. You get your handy console to poke around all sorts of stuff! Now simply hit "Enter" in the terminal running your Jest process anytime you want to re-run your currently selected specs. You'll be dropped right back into the Chrome debugger.

### Integration Testing

-   Integration tests are available for certain packages executed using [WebdriverIO](https://webdriver.io/)
-   Run with `yarn test:wdio`
-   To [debug WebdriverIO tests](https://webdriver.io/docs/api/browser/debug.html)
    -   Add `await browser.debug();` to introduce a breakpoint
    -   Run test using `yarn test:debug` or `DEBUG=true yarn test`
        -   To apply different configuration settings to aid debugging (e.g. disable headless, increase timeouts, increase logging)

## Release
-   Merge to the default branch

### Making a pre-release
-   Merge to the `alpha` branch

#### Upgrade dependencies

-   `yarn install:update`
    -   Select dependencies to update
-   Check for GitHub Action updates

## Editor Configurations

Configuring your editor to use our lint and code style rules will make the code review process delightful!

### Types

This project relies on type annotations.

-   Make sure your editor supports [typescript](https://www.typescriptlang.org/).

### ESLint

[Configure your editor][eslint-integrations] to use our eslint configurations.

## Git Workflow

The process of submitting a pull request is fairly straightforward and
generally follows the same pattern each time:

1. [Fork the repo](#fork-the-repo)
1. [Create a feature branch](#create-a-feature-branch)
1. [Make your changes](#make-your-changes)
1. [Rebase](#rebase)
1. [Check your submission](#check-your-submission)
1. [Create a pull request](#create-a-pull-request)
1. [Update the pull request](#update-the-pull-request)
1. [Commit Message Guidelines](#commit)

### Fork the repo

[Fork][fork-a-repo] the [salesforce/sa11y](https://github.com/salesforce/sa11y) repo. Clone your fork in your local workspace and [configure][configuring-a-remote-for-a-fork] your remote repository settings.

```bash
git clone git@github.com:<YOUR-USERNAME>/sa11y.git
cd sa11y
git remote add upstream git@github.com:salesforce/sa11y.git
```

### Create a feature branch

```bash
git checkout master
git pull origin master
git checkout -b <name-of-the-feature>
```

### Make your changes

Modify the files, build, test, lint and eventually commit your code using the following command:

```bash
git add <path/to/file/to/commit>
yarn commit or git commit
git push origin <name-of-the-feature>
```

Commit your changes using a descriptive commit message that follows our [Commit Message Guidelines](#commit). Adherence to these conventions is necessary because release notes are automatically generated from these messages.
NOTE: optional use of _yarn commit_ command triggers interactive semantic commit, which prompts user with commit related questions, such as commit type, scope, description, and breaking changes. Use of _yarn commit_ is optional but recommended to ensure format consistency.

The above commands will commit the files into your feature branch. You can keep
pushing new changes into the same branch until you are ready to create a pull
request.

#### Media files

Media files such as screenshots, images and demo videos are uploaded into a separate `media` branch. The uploaded files are then linked/referenced from the `media` branch to the other branches. This helps [manage the binary assets separately](https://gist.github.com/joncardasis/e6494afd538a400722545163eb2e1fa5) without bloating the history/size of the main repo.

#### Update dependency graph

-   Generate dependency graph using `yarn pkg:depgraph`
    -   Check if dependency graph needs to be updated using `yarn lint:depgraph`

### Rebase

Sometimes your feature branch will get stale with respect to the master branch,
and it will require a rebase. The following steps can help:

```bash
git checkout master
git pull upstream master
git checkout <name-of-the-feature>
git rebase upstream/master
```

_note: If no conflicts arise, these commands will ensure that your changes are applied on top of the master branch. Any conflicts will have to be manually resolved._

### Check your submission

#### Lint your changes

```bash
yarn run lint
```

The above command may display lint issues that are unrelated to your changes.
The recommended way to avoid lint issues is to [configure your
editor][eslint-integrations] to warn you in real time as you edit the file.

Fixing all existing lint issues is a tedious task so please pitch in by fixing
the ones related to the files you make changes to!

#### Run tests

Test your change by running [the unit tests and integration tests](#testing).

-   `yarn test`

### Create a pull request

If you've never created a pull request before, follow [these
instructions][creating-a-pull-request]. Pull request samples can be found [here](https://github.com/salesforce/sa11y/pulls).

#### Pull Request Title

A pull request title follows [conventional commit](#commit) format and is automatically validated by our CI.

```shell
ex:
commit-type(optional scope): commit description. ( NOTE: space between column and the message )

Types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test, proposal.
Scope: The scope should be the name of the npm package affected (preset-rules, assert, jest, format etc.)
```

### Update the pull request

```sh
git fetch origin
git rebase origin/${base_branch}

# If there were no merge conflicts in the rebase
git push origin ${feature_branch}

# If there was a merge conflict that was resolved
git push origin ${feature_branch} --force
```

_note: If more changes are needed as part of the pull request, just keep committing and pushing your feature branch as described above, and the pull request will automatically update._

### Commit

#### Commit Message Conventions

Git commit messages have to be formatted according to a well-defined set of rules. This leads to **more
readable messages** that are easy to follow when looking through the **project history**.

#### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, a **scope**, and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory, and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

Footer should contain a [closing reference to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if any.

Samples: (even more [samples](https://github.com/salesforce/sa11y/pulls))

```
docs(changelog): update change log to beta.5
```

```
fix(release): need to depend on latest rxjs and zone.js

The version in our package.json gets copied to the one we publish, and users need the latest of these.
```

#### Reverting a commit

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

#### Commit Type

Must be one of the following:

-   **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
-   **chore**: Other changes that don't modify src or test files
-   **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
-   **docs**: Documentation only changes
-   **feat**: A new feature
-   **fix**: A bug fix
-   **perf**: A code change that improves performance
-   **refactor**: A code change that neither fixes a bug nor adds a feature
-   **revert**: Reverts a previous commit
-   **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
-   **test**: Adding missing tests or correcting existing tests

#### Commit Scope

The scope should be the name of the npm package affected, as perceived by the person reading the changelog.

There are currently a few exceptions to the "use package name" rule:

-   **root**: used for changes that change the npm package layout in all of our packages, e.g. public path changes, package.json changes done to all packages, d.ts file/format changes, changes to bundles, etc.

#### Commit Subject

The subject contains a succinct description of the change:

-   use the imperative, present tense: "change" not "changed" nor "changes"
-   don't capitalize first letter
-   no dot (.) at the end

#### Commit Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

#### Commit Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

[fork-a-repo]: https://docs.github.com/en/get-started/quickstart/fork-a-repo
[configuring-a-remote-for-a-fork]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/configuring-a-remote-for-a-fork
[setup-github-ssh]: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
[creating-a-pull-request]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[eslint-integrations]: http://eslint.org/docs/user-guide/integrations
