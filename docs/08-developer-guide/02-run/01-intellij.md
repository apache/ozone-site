---
sidebar_label: IntelliJ
---

# Running Ozone From IntelliJ IDEA

This guide helps you **run Ozone services on your laptop** from [IntelliJ IDEA](https://www.jetbrains.com/idea/) using the shared run configurations that ship in the Ozone source tree. You do **not** need to memorize main classes or JVM flags for a basic pseudo-cluster: the project already defines them.

:::info Use the Ozone source repository

These steps apply to **[`apache/ozone`](https://github.com/apache/ozone)** (the Java codebase). If you only edit this website, work in [`apache/ozone-site`](https://github.com/apache/ozone-site) instead; you do not need to start SCM or OM for doc-only changes.

:::

## Before you start

1. **Clone** [`apache/ozone`](https://github.com/apache/ozone) and open the repository in IntelliJ IDEA.
2. **Import as a Maven project** (File → Open → select the root `pom.xml` or the project folder and import Maven). Wait for indexing and the first Maven import to finish.
3. **Build at least once** so generated code and classes exist. From the repo root:

   ```bash
   mvn clean verify -DskipTests
   ```

   Shorter options and platform notes (for example Apple silicon) are in [Build with Maven](../build/maven). If `Make` fails when you press Run, return to that guide and confirm prerequisites (JDK, Maven).

4. **Trust the shared run configurations** — The `.run` directory in the repository holds XML definitions IntelliJ picks up automatically after import. You should see configurations such as **StorageContainerManagerInit** in **Run → Edit Configurations** (or the run dropdown).

:::tip First time running Ozone?

If you mainly need *any* local cluster to try the shell or APIs, [Docker Compose](./docker-compose) is often faster to bring up. IntelliJ is most useful when you are **debugging or changing Java code** and want breakpoints in SCM, OM, or datanodes.

:::

## Start services in order

Ozone components expect a **storage** (SCM) layer before the **manager** (OM), and datanodes expect **Recon** in this dev layout. Use the built-in configurations **in this order** (names match the **Run** dropdown):

| Step | Run configuration | What it does |
| --- | --- | --- |
| 1 | **StorageContainerManagerInit** | Initializes SCM metadata (run once for a fresh `/tmp` layout). |
| 2 | **StorageContainerManager** | Starts SCM. |
| 3 | **OzoneManagerInit** | Initializes OM (requires SCM to be up). |
| 4 | **OzoneManager** | Starts OM. |
| 5 | **Recon** | Starts Recon (needed before datanodes in this setup). |
| 6 | **Datanode1**, **Datanode2**, **Datanode3** | Starts three datanode processes. |

Wait until each step looks healthy in the **Run** tool window before starting the next (SCM and OM can take a moment on first boot).

**Quick glossary:** **SCM** is the Storage Container Manager (block and datanode coordination); **OM** is the Ozone Manager (namespace). **Recon** is the monitoring and UI service the bundled dev configs expect before datanodes. For a fuller picture, read the [architecture overview](../../core-concepts/architecture/overview) and the pages on [Ozone Manager](../../core-concepts/architecture/ozone-manager), [Storage Container Manager](../../core-concepts/architecture/storage-container-manager), and [Recon](../../core-concepts/architecture/recon).

The upstream contributing guide uses the same sequence; see [Using IDE — Run Ozone from IntelliJ](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#run-ozone-from-intellij) in [`CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md).

### Why this works

Ozone relies on the **Maven classpath**. Run configurations use the same modules and dependencies as `mvn` so the IDE starts processes with the expected classes. Configurations reference shared files under [`hadoop-ozone/dev-support/intellij/`](https://github.com/apache/ozone/tree/master/hadoop-ozone/dev-support/intellij) (for example `ozone-site.xml` and `log4j.properties`).

### HA and other configurations

The `.run` folder also contains **`*-ha.run.xml`** entries (for example **OzoneManager-ha**) and utilities such as **OzoneShell**, **S3Gateway**, and **FreonStandalone**. Use those after you are comfortable with the non-HA flow above.

### If a configuration cannot find `ozone-site.xml`

Run configurations pass paths like `hadoop-ozone/dev-support/intellij/ozone-site.xml`. Those paths are **relative to the project (repository) root**.

1. Open **Run → Edit Configurations…**.
2. Select the Ozone configuration that failed.
3. Open **Modify options** → enable **Working directory** if needed, and set it to your **repository root** (often `$PROJECT_DIR$` in IntelliJ).

Then run again.

## See also

- [Build with Maven](../build/maven)
- [Docker Compose pseudo-cluster](./docker-compose)
- [Ozone `CONTRIBUTING.md`](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md) (building from source, IDE, contacts)
