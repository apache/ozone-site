---
sidebar_label: IntelliJ
---

# Ozone Development With IntelliJ IDEA

This page covers **IntelliJ IDEA setup** for day-to-day work on the Ozone **Java** codebase: **Checkstyle** in the editor and fixes for **common IDE problems**. It complements [Build with Maven](./maven), where you install JDK and Maven and run the first compile.

## Before you start

1. **Clone** [`apache/ozone`](https://github.com/apache/ozone) and open the repository in IntelliJ IDEA.
2. **Import as a Maven project** (**File** → **Open** → select the root `pom.xml` or the project folder and import Maven). Wait for indexing and the first Maven import to finish.
3. **Build at least once** so generated code and classes exist. From the repo root:

   ```bash
   mvn clean verify -DskipTests
   ```

   Shorter options, optional flags, and platform notes (for example Apple silicon) are in [Build with Maven](./maven). If **Build** or **Make** fails when you follow the sections below, fix the compile first using that guide.

:::info Work in the Ozone source repository

These steps assume you have cloned **[`apache/ozone`](https://github.com/apache/ozone)** and opened it in IntelliJ as a **Maven** project. Documentation-only work on **this website** lives in [`apache/ozone-site`](https://github.com/apache/ozone-site) instead.

:::

:::tip Running SCM, OM, and datanodes from the IDE?

That workflow uses shared **Run** configurations in the `.run` folder. It is described in [`CONTRIBUTING.md` — *Run Ozone from IntelliJ*](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#run-ozone-from-intellij) (and will be covered on this site under *Run → IntelliJ* when that page is published).

:::

## Checkstyle in IntelliJ

Ozone enforces Java style in CI (and via `checkstyle.sh`). Installing the Checkstyle plugin lets you see many of the same rules **before** you push.

1. **Install the plugin**  
   Open **Settings** (Windows/Linux: **File** → **Settings…**; macOS: **IntelliJ IDEA** → **Settings…**) → **Plugins** → **Marketplace**, search for **CheckStyle-IDEA** (sometimes listed as *Checkstyle-IDEA*), install it, and restart the IDE if prompted.

2. **Point the plugin at Ozone’s rules**  
   Open **Settings** → **Tools** → **Checkstyle**. (On older versions the path was **Other Settings** → **Checkstyle**.)  
   - Use **+** to add a **Configuration File**.  
   - **Description:** for example `Ozone`.  
   - **File:** choose [`hadoop-hdds/dev-support/checkstyle/checkstyle.xml`](https://github.com/apache/ozone/blob/master/hadoop-hdds/dev-support/checkstyle/checkstyle.xml) inside your clone (path is relative to the **repository root**).  
   Suppressions used in CI live next to it: [`suppressions.xml`](https://github.com/apache/ozone/blob/master/hadoop-hdds/dev-support/checkstyle/suppressions.xml) in the same directory—the Maven build wires that in automatically; the IDE configuration file above is the main entry point.

3. **Match the Checkstyle library version**  
   CI uses the version pinned in the Maven build. In your clone, open the root [`pom.xml`](https://github.com/apache/ozone/blob/master/pom.xml) and find the `checkstyle.version` property (for example `9.3`—**your** tree may differ after upgrades). In **Settings** → **Tools** → **Checkstyle**, set the **Checkstyle version** to that same value so IDE results match `mvn` and [`checkstyle.sh`](https://github.com/apache/ozone/blob/master/hadoop-ozone/dev-support/checks/checkstyle.sh).

4. **Run a scan**  
   Open the **Checkstyle** tool window, select your **Ozone** configuration, and run the check on the current file, module, or whole project.

The same procedure is summarized upstream in [`CONTRIBUTING.md` — *Setting up Checkstyle*](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#setting-up-checkstyle).

### Code style and `.editorconfig`

Ozone also ships [`.editorconfig`](https://github.com/apache/ozone/blob/master/.editorconfig) in the repo (indentation, line endings, and similar). IntelliJ can honor it when project settings are shared through Git; see [JetBrains: Share IDE settings](https://www.jetbrains.com/help/idea/configure-project-settings.html#share-project-through-vcs).

## Common IDE problems

This section mirrors [`CONTRIBUTING.md` — *Common problems*](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#common-problems) with a bit more context for newcomers.

### Generated sources (protobuf) feel “too large” for the IDE

Protobuf-generated Java can be huge. IntelliJ may stop analyzing or navigating those files and look “stuck.”

1. **Help** → **Edit Custom Properties…**  
2. Add a line: `idea.max.intellisense.filesize=10000`  
3. **Restart** IntelliJ IDEA.

If issues remain, try **File** → **Invalidate Caches…** → **Invalidate and Restart** after a full Maven build (`mvn clean verify -DskipTests` from the repo root, as in [Build with Maven](./maven)).

### `bad class file` after an incremental compile

You might see an error similar to:

`bad class file: hadoop-hdds/common/target/classes/org/apache/hadoop/ozone/common/ChunkBufferImplWithByteBufferList$1.class`

That usually means a **stale or partial** compile in `target/`.

1. Stop running apps/tests that use that module.  
2. Delete the offending path under `target/` (or the whole module’s `target` directory) **outside** the IDE, or run `mvn clean` for that module / the whole tree.  
3. In IntelliJ: **Build** → **Rebuild Project**.  
4. If the error persists, run `mvn clean verify -DskipTests` from the repository root, then **File** → **Reload All Maven Projects**.

## See also

- [Build with Maven](./maven)
- [Static code analysis](../test/static-analysis) (Sonar/SonarCloud and broader quality tooling)
- [Ozone `CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md) (full contribution flow, IDE run order, Checkstyle, contacts)
