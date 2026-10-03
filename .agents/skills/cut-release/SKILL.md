---
name: cut-release
description: Walks a druxt.js maintainer through a stable release, from a release branch off develop to versioned packages on npm and the merges back into main and develop.
---

# Cut a release

Maintainers release. Run this only when the person you work for is a maintainer and asks for the release. Never publish to npm, push a tag or push `main` on your own. Prepare each step and show the result. The maintainer runs every step that writes to npm or GitHub.

## What is automatic and what is not

- **`dev` snapshots are automatic.** A merge to `develop` that changes a changeset publishes every pending package under the `dev` npm tag (`.github/workflows/release.yml`). It doesn't commit, tag or move `latest`.
- **Stable releases are manual.** No workflow publishes `latest`. The steps below are the GitFlow release the history shows (`release/*` branches, a `chore: update versions` commit, a merge to `main`, a tag merged back into `develop`).

## 1. Branch

Start from an up-to-date `develop` with the changesets you want to release merged:

```bash
git checkout develop && git pull
git checkout -b release/<version>
```

Name the branch after the version for a release of the whole set (`release/0.24.1`), or after the package for one package (`release/druxt-menu-0.21.0`). The tag uses the same name without `release/`.

## 2. Version

```bash
yarn version   # changeset version, then dates the new changelog headings
yarn install   # refreshes yarn.lock for the new workspace versions
```

`yarn version` runs the root `version` script and has no dry run: it ignores flags such as `--help` and versions the checkout. Run it only on the release branch.

It consumes every changeset in `.changeset/`, bumps each `package.json` and writes the `CHANGELOG.md` entries (`.changeset/changelog.cjs`, `scripts/changelog-dates.mjs`). If `.changeset/pre.json` exists the set is in pre mode. Ask the maintainer before leaving it (`yarn changeset pre exit`).

Read the diff. Check that each bump matches its changesets and that dependents of a bumped package moved too. Each changelog entry should read well for someone upgrading.

## 3. Check

Run the gate with the `verify-change` skill, then the pre-publish check against npm:

```bash
yarn lint && yarn build && yarn test:unit
yarn release:check
```

`yarn release:check` refuses a set that would publish broken or skewed packages. It catches `workspace:` and private dependencies, sibling ranges the set does not satisfy, versions not above the published `latest` and `files` entries that were not built. Fix the cause. Do not pass `--offline` or `--skip-files` for a real release.

Commit the version changes under the maintainer's identity:

```bash
git add -A && git commit -m "chore(release): update versions"
```

## 4. Merge and tag

```bash
git checkout main && git pull
git merge --no-ff release/<version>
git tag <version>
git checkout develop
git merge --no-ff <version>
```

Show the maintainer the result before anything is pushed.

## 5. Publish

Pack the set from the tagged commit, in dependency order, and publish each tarball:

```bash
git checkout <version>
yarn build
yarn release:pack release-packages
```

`release-packages/manifest.json` lists the tarballs in publish order, so a package always follows the siblings it depends on. The maintainer publishes them under their own npm login, in that order:

```bash
npm publish ./release-packages/<file>.tgz --access public
```

Keep the leading `./`: without it npm reads the path as a GitHub repository.

## 6. Push

The maintainer pushes `main`, `develop` and the tag:

```bash
git push origin main develop <version>
```

Then delete the `release/<version>` branch. A `dev` snapshot made after the release is versioned from the new numbers.

## Report

Say which packages and versions the release set holds, the output of the gate and `yarn release:check`, and which steps the maintainer still has to run.
