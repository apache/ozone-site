# Apache Ozone Website Contribution Guide

Apache Ozone is a top-level Apache project and is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). The bug tracking system for Ozone and its website is under the [Apache Jira project named HDDS](https://issues.apache.org/jira/projects/HDDS/).

This document summarizes the contribution process.

## Quick Start

1. Review the main [Ozone contributing guide](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#contribute-your-modifications). Contributing to the new website follows a similar process with a few differences:
    - You should fork the [apache/ozone-site](https://github.com/apache/ozone-site) repo instead of the main [apache/ozone](https://github.com/apache/ozone) repo.
    - You should enable the `ci` workflow on your fork, which will run tests on your changes before submitting a pull request.
    - Your local branch containing changes for the new website should be based off of the [HDDS-9225-website-v2](https://github.com/apache/ozone-site/tree/HDDS-9225-website-v2) branch.

2. Use your favorite editor to write markdown content under the [docs/](docs/) and [src/pages/](src/pages/) directories.
    - A good option is [Visual Studio Code](https://code.visualstudio.com/) with [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) and [cspell](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) plugins, which will automatically detect the website's configuration files and give feedback as you type.

3. Preview your changes locally by running `docker compose up` and opening `localhost:3001` in your browser.
    - Make sure [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) are installed on your system.
    - If you need to update the dependencies in your Docker image at any time, run `docker compose up --build` to create an updated image.

4. Follow the same steps as the main [Ozone contributing guide](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#contribute-your-modifications) to create a pull request against the [apache/ozone-site](https://github.com/apache/ozone-site) repository.
    - The target branch for the PR should be [HDDS-9225-website-v2](https://github.com/apache/ozone-site/tree/HDDS-9225-website-v2) for changes targeting this new unreleased version of the website.

⬇️ Continue reading for more details, helpful tips, and advanced usage. ⬇️

## What Can I Contribute?

- **Issues**: If you find an issue or have an idea for an improvement to the website, please [file a Jira issue](#filing-jira-issues). Even if you are not able to fix the issue, please report it so we can find someone who can.

- **Documentation**: You can fix anything from a minor typo, an unclear or outdated section, or a completely missing page. Most changes in this area can be done with just basic markdown knowledge.

- **Theme and Styling**: You can help improve the overall appearance of the Ozone website using standard web development tools like Javascript, React, HTML, and CSS. You can also create or modify graphics and images used on the site.

- **Tests**: [HDDS-9601](https://issues.apache.org/jira/browse/HDDS-9601) is the parent Jira for implementing tests to run as part of CI for the website. You can help expand or improve them.

- **Tools**: You can submit improvements to how we use various tools like pnpm, Docker, and Dependabot that are used in the development of the website.

## Filing Jira Issues

Please follow the same [Jira guidelines](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#jira-guideline) as the main Ozone project when filing improvements or issues for the website. Website Jira issues are also under the HDDS project, but can be tagged with `website` and `documentation` to distinguish them from changes to Ozone itself.

## Migrating Content From the Current Website to the New Website

If you are migrating a page from the old website to the new website, please follow these steps:

1. Verify that the content of the original page is clear and accurate.
2. If there are issues with the original page, raise a PR with your fixes to the [current Ozone website](https://github.com/apache/ozone/tree/master/hadoop-hdds/docs) to fix the page first.
3. Once the page is merged into the current website, migrate it to the new website and raise a PR.
    - Pages being brought in from the current website may be enhanced with [additional markdown functionality](#page-format) supported by the new website.

## Modifying the Website

The Apache Ozone Website uses [Docusaurus](https://docusaurus.io/) as a static site generator. Most simple updates to the website can be done with little knowledge of Docusaurus, but for more complex modifications to the website or a better understanding of how it is built, see the Docusaurus [documentation](https://docusaurus.io/docs) and [API](https://docusaurus.io/docs/cli).

### Directory Layout

- [docusaurus.config.js](https://docusaurus.io/docs/configuration)
  - The main configuration file for the docusaurus site.

- [docs](https://docusaurus.io/docs/docs-introduction)
  - Documentation pages.
  - The layout of subdirectories determines the layout of the sidebar in the docs section.

- [versioned_docs](https://docusaurus.io/docs/versioning)
  - Contains older versions of the documentation.
  - Only update files in this directory if you need to backport a fix to older versions of the documentation.

- [versions.json](https://docusaurus.io/docs/versioning)
  - Contains a list of all versions of the documentation.

- [static](https://docusaurus.io/docs/static-assets)
  - Contains non-code files that are directly copied to the build output, including images.

- **src**
  - [css](https://docusaurus.io/docs/styling-layout)
    - Global CSS files loaded by `docusaurus.config.js`

  - [pages](https://docusaurus.io/docs/static-assets)
    - Static pages outside of the documentation section.

    - **index.js**: The website homepage.

  - [theme](https://docusaurus.io/docs/swizzling)
    - Contains theme overrides of Docusaurus specific components created with [swizzling](https://docusaurus.io/docs/swizzling).
    - Styling of the components is done with [CSS Modules](https://docusaurus.io/docs/styling-layout#css-modules) which are stored in the directory with their component.

### Creating or Updating Documentation

#### Page Format

Docusaurus docs are written in markdown. All standard markdown formatting can be used, but docusaurus provides some additional features to enhance your pages. Complete details are documented in [Docusaurus markdown features](https://docusaurus.io/docs/markdown-features), but a high level summary is provided here:

- The [.mdx file format](https://docusaurus.io/docs/markdown-features/react) allows you to embed Javascript React components into your markdown for interactive features.

- [Tabs](https://docusaurus.io/docs/markdown-features/tabs) can show multiple possibilities succinctly.

- Standard Markdown [Code blocks](https://docusaurus.io/docs/markdown-features/code-blocks) have extra features, including:
  - [Titles](https://docusaurus.io/docs/markdown-features/code-blocks#code-title)
  - [Optional line numbers](https://docusaurus.io/docs/markdown-features/code-blocks#line-numbering)
  - [Multi-language tabs](https://docusaurus.io/docs/markdown-features/code-blocks#multi-language-support-code-blocks)

- [Admonitions](https://docusaurus.io/docs/markdown-features/admonitions) (note, tip, info. warning, danger) optionally with [custom titles](https://docusaurus.io/docs/markdown-features/admonitions#specifying-title).

- Link to specific headings in pages with [Heading IDs](https://docusaurus.io/docs/markdown-features/toc#heading-ids)

- Various strategies for adding [graphics to markdown pages](https://docusaurus.io/docs/markdown-features/assets)

- Inline diagrams with [Mermaid](https://docusaurus.io/docs/markdown-features/diagrams)

#### Best Practices

Docusaurus provides many options for laying out documentation pages and their metadata. The following best practices are followed by this repo, and some are enforced by GitHub actions CI checks.

- [Number prefixes](https://docusaurus.io/docs/sidebar/autogenerated#using-number-prefixes) should be used for all file and sidebar directory names to enforce their order in the website and local editors.
  - Number prefixes will be automatically removed from links in the Docusaurus build.

- Let Docusaurus automatically generate a webpage URL from the file name.

- File names and therefore generated URLs should all be `kebab-case`.

- Let Docusaurus automatically generate the page's title from its top level markdown heading instead of using `title` in the front matter. This is different from the sidebar label or URL slug.

- Use [URL paths](https://docusaurus.io/docs/markdown-features/links) to link between pages. To use this format:
  - Do not include number prefixes in links. Use `./ozone-manager` instead of `./02-ozone-manager`.
  - Do not include file extensions. Use `./ozone-manager` instead of `./ozone-manager.md`.
  - Do not use absolute paths to docs (e.g., `/docs/...`). Use relative paths to keep page links pointing within the current version of the documentation.

- Use short, succinct labels in the sidebar.
  - For example, the pages on bucket layouts may be organized as:

  ```text
  ...
  Buckets
      ...
      Layouts
          File System Optimized (FSO)
          Object Store (OBS)
  ```

  - This avoids a verbose sidebar with duplicate information like this example:

  ```text
  ...
  Buckets
      ...
      Bucket Layouts
          File System Optimized Bucket Layout
          Object Store Bucket Layout
  ```

  - Sidebar labels are automatically generated from page titles. To use a different sidebar label, use the `sidebar_label` property in the page's front matter.

- Don't rely on Ozone specific acronyms in the sidebar. This makes docs navigation more beginner friendly.
  - For example, the pages on bucket layouts may be organized as:

  ```text
  ...
  Buckets
      ...
      Layouts
          File System Optimized (FSO)
          Object Store (OBS)
  ```

  - Which is easier for a new Ozone user to follow than this:

  ```text
  ...
  Buckets
      ...
      Layouts
          FSO
          OBS
  ```

- Use descriptive page titles.
  - Pages may be linked directly from other sources and users should be able to tell what the page is without looking at the sidebar.
  - There may also be multiple pages about the same topic, for example Kerberos. Readers should be able to tell which aspect of Kerberos the page is about to distinguish it from other pages.

  - For example, pages in the security configuration section may be organized like this:

  ```text
  Configuration
      ...
      Security
          ...
          Kerberos
  ```

  - The sidebar label makes sense because it has the context of the parent sidebar sections, however the Kerberos page should have a title like "Configuring Kerberos" instead of just "Kerberos" like its sidebar label.

#### Spelling

As part of the GitHub Actions CI, all markdown pages will be checked for spelling mistakes using [cspell](https://cspell.org/). Markdown code blocks are excluded from spelling checks. Spelling can also be checked locally by running the script [.github/scripts/spelling.sh](.github/scripts/spelling.sh). This requires you to have pnpm's dev dependencies installed on your machine for cspell to work (run `pnpm install --dev`).

**If spell check fails for words that are correct but not recognized:**

- **Option 1:** If the word is relevant for the whole Ozone project, add it to the `words` list in *cspell.yaml* so that it is considered valid.

- **Option 2:** If the word is only relevant for one specific page, add an [inline directive](https://cspell.org/configuration/document-settings/) as a comment in the markdown front matter of that page only.

#### Documentation Sidebar

Docusaurus provides a few different options to configure the documentation sidebar that organizes documentation pages into dropdown sections. The Ozone website configures this using a *README.mdx* file in each documentation directory. This gives a one to one mapping of subdirectories of the *docs* directory to sidebar dropdown sections.

When creating a new *docs* subdirectory (which will be rendered as a sidebar section), add a *README.mdx* file to that directory. In this file:

1. Use the `sidebar_label` front matter key to give the section a brief title that will be shown in the sidebar.
2. Add a descriptive title on the markdown page itself.
    - This should be more verbose than the sidebar label as described in [Best Practices](#best-practices) for documentation pages.
3. Write a brief summary (usually just one sentence) about the content in that section.
    - Avoid placing actual documentation on these pages, since it may be missed by readers clicking through the sidebar.
    - If an overview of content in a section is required, add a dedicated "Overview" page to the section.
4. Add an automatically generated index of the content in this section as the last line in the markdown file. Adding this index is described in the [Docusaurus docs](https://docusaurus.io/docs/sidebar/items#embedding-generated-index-in-doc-page), but in summary it only requires two lines:
    1. Add `import DocCardList from '@theme/DocCardList';` anywhere in the *README.mdx* file.
    2. Add the `<DocCardList/>` tag at the end of the file.

### Updating Graphics

When adding or updating graphics in the Ozone website, please follow these guidelines:

- Use SVG files for flat icons with minimal colors. These scale better and are smaller in size.

- Use PNG files for images that have more colors or complexity.

- Graphics used with documentation should go in the `docs` directory (not the `static` directory) so that they can be versioned with the rest of the documentation.

### Updating Theme or Styling

Changing appearance or theme of the website from Docusaurus defaults can be done with React and CSS. See the Docusaurus documentation on [Styling and Layout](https://docusaurus.io/docs/styling-layout) and [Swizzling](https://docusaurus.io/docs/swizzling) for more information. Here are some general guidelines:

- To update the website homepage, modify `src/pages/index.js` and add or modify CSS files as needed.

- For global CSS configurations:
  1. Create or modify a file in `src/css`.
  2. If creating a new file, add it to `config.presets.theme.customCss` in `docusaurus.config.js` to be loaded.

- For component specific CSS configurations, add a [CSS module](https://docusaurus.io/docs/styling-layout#css-modules) to the `theme` subdirectory of the component being modified.

- Make sure styling changes work in both [light and dark modes](https://docusaurus.io/docs/styling-layout#dark-mode).

### Package Management

**NOTE:** pnpm is **not** required for local website previews. Simply run `docker compose up` if a local preview is the only functionality you need.

The website uses [pnpm](https://pnpm.io/) as a package manager. This is the same package manager used to build [Recon](https://github.com/apache/ozone/tree/master/hadoop-ozone/recon/src/main/resources/webapps/recon/ozone-recon-web). Basic knowledge required to maintain the website's dependencies is outlined here. See [pnpm docs](https://pnpm.io/pnpm-cli) for complete usage.

#### Relevant Files

- **package.json**

This file contains version guidelines for all the top level dependencies required to build the website. This file may be updated manually to adjust which versions are installed, or automatically when commands like `pnpm update` are run.

- **pnpm-lock.yaml**

This file contains exact version information of all dependencies required to build the website. These are the versions of packages that will be used when `pnpm install` is run. This file should not be updated manually, and may be updated automatically by commands like `pnpm update`.

#### Version Pinning

*package.json* allows [version specifiers](https://docs.npmjs.com/about-semantic-versioning#using-semantic-versioning-to-specify-update-types-your-package-can-accept) to put limits on which versions are installed. The following specifiers are currently used for the website:

- `~` means to allow all patch updates (last semantic versioning digit)
- `^` means to allow all minor version updates (second semantic versioning digit)
- A version with no specifier means only the exact version declared in *package.json* is allowed.

Currently all `@docusaurus/*` packages are pinned to an exact version for website stability.

#### `pnpm` Command Cheat-Sheet

- **To install all packages after cloning the repo**: `pnpm install`

  - This will read the metadata for the packages and their transitive dependencies from *pnpm-lock.yaml*, which is generated from *package.json* - and install the required dependencies for the project in the *node_modules* folder.

  - This should make no modifications to *package.json* or *pnpm-lock.yaml* if all explicit versions in *pnpm-lock.yaml* comply with the version specifiers in *package.json*.

    - This should always be true for committed code, because the CI build of the website uses `pnpm install --frozen-lockfile` to fail the build if the two files do not match.

- **To update all packages to their latest versions allowed by package.json**: `pnpm update`

  - This will update *package.json* to match the exact versions that were installed, but this is for reference only. Exact version information still comes from *pnpm-lock.yaml*
    - Version specifiers like `^` and `~` will not be modified, and the new version will be the latest that still complies with the existing version specifiers.

  - This will update *pnpm-lock.yaml* to reflect the exact versions of all top level and transitive dependencies installed.

- **To update docusaurus to a specific version**:

  1. Update the version of all `@docusaurus/*` packages in *package.json* to the desired docusaurus version.

  2. Run `pnpm update '@docusaurus/*'` to update to the new version.

      - This should modify *pnpm-lock.yaml* with the exact versions of docusaurus and its transitive dependencies that were installed.

      - If pnpm needed to update other top level dependencies when updating docusaurus, this command may modify *package.json* as well.

  3. Commit *package.json* and *pnpm-lock.yaml* to git.

### Previewing Your Modifications Locally

Docusaurus supports previewing the website locally. Below are various options to launch a preview of the site at `localhost:3001` on your machine.

**NOTE**: If using the [Docusaurus development server](https://docusaurus.io/docs/installation#running-the-development-server), changes to `docusaurus.config.js` may not be automatically reloaded and require the server to be restarted.

#### Option 1: Docker (Recommended)

The project includes a `Dockerfile` and a `compose.yml` file to build and run the website in a containerized environment. This creates a Docker image called `ozone-site` with all the dependencies included, and uses it to run the [Docusaurus development server](https://docusaurus.io/docs/installation#running-the-development-server).

1. Install [Docker](https://docs.docker.com/engine/install/).

2. Install [Docker Compose](https://docs.docker.com/compose/install/).

3. Run `docker compose up` from the repository root.

    - **Note**: This will continue to use the last locally built version of the `ozone-site-dev` image, which saves time on future runs.
      - Run `docker compose up --build` to rebuild the image and incorporate any package dependency updates that may have been committed since the last build.

4. Preview the website at `localhost:3001` in your browser.

    - Any changes made in the repository will be reflected in the preview.

5. Press `Ctrl+C` or run `docker compose down` to stop the preview.

#### Option 2: pnpm

Build and run the website locally with the `pnpm` package manager.

1. Install [pnpm](https://pnpm.io/installation), which will be used to build the site.

2. Install dependencies required to build the website by running `pnpm install` at the website root.

- [**Development Server**](https://docusaurus.io/docs/installation#running-the-development-server): This option will start the Docusaurus development server, which allows updates to website files to be displayed in the browser in real time. It will not produce a `build` directory with build artifacts.

  1. Run `pnpm start` from the repository root to start the development server.

  2. Preview the website at `localhost:3001` in your browser.

  3. Press `Ctrl+C` to stop the preview.

- [**Local Build**](https://docusaurus.io/docs/installation#build): This option will do a production build, putting artifacts in the `build` directory. This can still be previewed locally, but will not automatically reflect changes to website files.

  1. Run `pnpm build` from the repository root to build the content.

  2. Run `pnpm serve` to preview the built website locally.

  3. Preview the website at `localhost:3001` in your browser.

  4. Press `Ctrl+C` to stop the preview.

### Contributing Your Modifications

Fork the [apache/ozone-site](https://github.com/apache/ozone-site) repo and follow the same steps as the main [Ozone contributing guide](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#contribute-your-modifications) to create a pull request against the [apache/ozone-site](https://github.com/apache/ozone-site) repository. The target branch for the PR should be `HDDS-9225-website-v2` for changes targeting this new unreleased version of the website.
