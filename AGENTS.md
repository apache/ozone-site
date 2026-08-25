# AGENTS instructions

## Working Style

- Prefer the smallest correct change. Do not add features, refactors, or
  cleanup that were not asked for.
- Keep diffs surgical. Every changed line should trace back to the task.
  Do not reformat, rewrap, or rename adjacent pages "while you are here".
- Match the surrounding page or module before introducing a new pattern.
- If there are multiple reasonable interpretations, state the tradeoff and
  ask instead of guessing.
- Use established Ozone vocabulary in docs and PR text:
  SCM, OM, Datanode, container, pipeline, volume, bucket, key, snapshot,
  Recon, FSO, OBS, and S3 Gateway.
  Avoid inventing new architecture terms unless the repo already uses them.

## Repository Snapshot

This repository is the Apache Ozone website
([ozone.apache.org](https://ozone.apache.org/)), built with Docusaurus.
It is not the Ozone storage system. Product code lives in
[`apache/ozone`](https://github.com/apache/ozone).

Package coordinates (Node engine, pnpm version, Docusaurus version) live in
[`package.json`](./package.json). Do not hardcode those versions in new docs.

Two branches:

- `master`: source. All website PRs target this branch.
- `asf-site`: build output. CI publishes here. Do not edit it by hand.

## Local Environment

- Docker Compose is the recommended preview path and does not require pnpm.
- For lint and local `pnpm` commands, enable Corepack and use the Node
  version that CI uses (see `Dockerfile` and `.github/workflows/static.yml`).
- Preview and serve listen on port 3001, not the Docusaurus default 3000.
- After changing `docusaurus.config.js`, restart the dev server.
  Hot reload may not pick up config edits.

## Commands

Primary commands (see `package.json` for the full script list):

- Preview with Docker: `docker compose up`
  then open `http://localhost:3001`
- Preview with pnpm: `pnpm install` then `pnpm start`
- Production build: `pnpm build`
- Serve the build: `pnpm serve`
- Lint: `pnpm run lint`
- Auto-fix lint: `pnpm run lint:fix`
- Spell check: `.github/scripts/spelling.sh`
- CI-aligned website build: `docker compose run site pnpm build`

Notes:

- `pnpm run lint` needs `yamllint` on `PATH`
  (`pip install yamllint` or `brew install yamllint`).
- The Docker image installs `--prod` dependencies only. Do not rely on
  `docker compose run site pnpm run lint` for eslint or markdownlint.
- Rebuild the image after dependency changes: `docker compose up --build`

## Repository Structure

- `src/pages/`: standalone pages (home, download, Community). No docs
  sidebar and no versioning.
- `docs/`: product docs for the Next version. Number-prefixed paths.
- `versioned_docs/`: snapshots of released docs. Do not update unless the
  task is an explicit backport.
- `blog/`: blog posts.
- `static/`: copied as-is into the site root.
- `src/theme/`: swizzled Docusaurus components.
- `docusaurus.config.js`: site config, navbar, footer.
- `.github/`: CI workflows and check scripts.

## Change Boundaries

- Keep page types separated. Community and download content belongs in
  `src/pages/`. Product documentation belongs in `docs/`.
- Do not edit the `asf-site` branch.
- Do not update `versioned_docs/` unless the change is an explicit
  backport to a released version. Default to `docs/` (Next) only.
- Do not hand-edit generated configuration appendix pages when a
  generation workflow exists.
- Do not enable a `docs.exclude` section, navbar item, or plugin just
  because a draft page exists.
- Do not rearrange sidebar order or rename files for cosmetics.

## Coding Standards

- Follow the surrounding Markdown and JavaScript. Lint config is
  `.markdownlint.yaml` and `eslint.config.mjs`.
- Use ATX headings (`#`) and dash (`-`) lists.
- Keep headings at or under 80 characters.
- Add the Apache license header to new source files (`.js`, `.yml`,
  and similar). Markdown and MDX under this repo are exempted by
  `.licenserc.yaml`.
- Do not add `@author` tags.
- Keep comments concrete. Avoid vague architecture prose.

## Testing Standards

- Preview the affected URL at `http://localhost:3001` when the change
  is a page or style.
- Run `pnpm run lint` before opening a PR.
- Run `pnpm build`. Broken links, anchors, and duplicate routes fail
  the build (`onBrokenLinks` / `onBrokenAnchors` in
  `docusaurus.config.js`).
- If you added files, run `.github/scripts/spelling.sh`.
- Root files such as this `AGENTS.md` are not website routes. Do not
  treat "no new URL" as a test failure.

## Commits and PRs

- Every change should map to an Apache Jira in the HDDS project.
  Website issues may also use the `website` and `documentation` labels.
- Branch names usually start with the Jira ID, for example `HDDS-1234`.
- PR titles must be `HDDS-1234. Short summary of the change`.
- Prefer commit subjects that also start with the Jira ID when known.
- To bring a branch up to date with `master`, merge instead of rebasing:
  `git merge --no-edit origin/master`
- Avoid force-push unless a maintainer explicitly asks for rewritten
  history.
- PR descriptions should include the Jira link, the problem statement,
  the chosen approach, and how the patch was tested.
- When non-trivial content is generated with AI tooling, disclose it in
  the PR description as `Generated-by: TOOL (MODEL)`.
  See the ASF generative tooling guidance.

## Ask First

- New third-party dependencies or Docusaurus plugins
- Navbar, footer, or other `docusaurus.config.js` structure changes
- Publishing a previously excluded docs section
- Backports into `versioned_docs/`
- Broad terminology or heading cleanups across many files

## Never

- Commit secrets, credentials, or tokens
- Use destructive git commands unless explicitly requested
- Hand-edit `asf-site` or generated web artifacts
- Add unrelated cleanup, formatting churn, or speculative refactors
  to the same change

## References

- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`.github/pull_request_template.md`](./.github/pull_request_template.md)
- [Docusaurus docs](https://docusaurus.io/docs)
- [ASF generative tooling guidance](https://www.apache.org/legal/generative-tooling.html)
