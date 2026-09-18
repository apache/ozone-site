---
sidebar_label: Integration Tests
---

# Integration Tests

This guide describes how integration tests are organized in [Apache Ozone](https://github.com/apache/ozone), and how to run, write, and debug them locally. It is aimed at new contributors who already have the project building (see [Building Ozone With Maven](../../developer-guide/build/maven)).

## Scope and Purpose

Ozone's automated tests fall into three tiers:

- **Unit tests** exercise individual classes or small collaborations in isolation. They are fast, avoid starting real Ozone daemons, and typically rely on **JUnit** and **Mockito** (or test doubles) instead of a live cluster.
- **Integration tests** validate behavior across components using **`MiniOzoneCluster`** or similar harnesses inside the test JVM. Most live in **`hadoop-ozone/integration-test`**. They are slower and closer to a real deployment.
- **Acceptance tests** validate the complete system as deployed in containers, using Robot Framework.

Integration tests are ideal for:

- Multi-component interactions (Ozone Manager ↔ Storage Container Manager ↔ Datanodes)
- Ratis and HA scenarios — leader election, failover, log replication
- Restart and recovery code paths
- Client and shell behavior against a real cluster
- Reproducing race conditions and timing-sensitive bugs

## Testing Framework

Integration tests are written in Java and run by the Apache Maven **Surefire** plugin. The core ingredients:

- **[JUnit 5](https://junit.org/junit5/)** (`org.junit.jupiter.api`) — assertions, lifecycle annotations (`@BeforeAll`, `@AfterEach`, `@TempDir`), parameterized tests.
- **[AssertJ](https://assertj.github.io/doc/)** — fluent assertions used widely across the integration-test modules, alongside the JUnit Jupiter assertions (`assertEquals`, `assertTrue`, …) that you'll also see in many existing tests.
- **`MiniOzoneCluster`** — the in-JVM Ozone cluster harness; covered in detail below.
- **`GenericTestUtils.waitFor(...)`** — polling helper used in preference to `Thread.sleep` for any state that becomes true asynchronously.

## MiniOzoneCluster

`MiniOzoneCluster` is the in-JVM Ozone cluster used by integration tests. It boots one or more Storage Container Managers (SCMs), Ozone Managers (OMs), and Datanodes inside the test process and exposes them through a small Java API so a test can submit requests, inspect internal state, and tear everything down deterministically.

The interface lives in the `org.apache.hadoop.ozone` package of the `hadoop-ozone/mini-cluster` module. Two implementations are provided:

- `MiniOzoneClusterImpl` — a single-OM, single-SCM cluster with multiple Datanodes.
- `MiniOzoneHAClusterImpl` — a multi-OM, multi-SCM cluster with multiple Datanodes, for testing HA, leader election, and Ratis-driven replication.

### Construction

A `MiniOzoneCluster` is configured along two axes:

- **Cluster topology** — picked at builder selection:
  - `MiniOzoneCluster.newBuilder(conf)` → single-OM/single-SCM cluster (`MiniOzoneClusterImpl.Builder`).
  - `MiniOzoneCluster.newHABuilder(conf)` → multi-OM/multi-SCM HA cluster (`MiniOzoneHAClusterImpl.Builder`).
- **Feature flags** — set on the `OzoneConfiguration` before it is passed to the builder. Common keys include `OZONE_DEFAULT_BUCKET_LAYOUT`, `OZONE_SECURITY_ENABLED_KEY`, and `HDDS_SCM_SAFEMODE_ENABLED`.

A typical test builds the cluster from an OzoneConfiguration, waits for the cluster to be ready, and closes it in teardown.

### Lifecycle controls

- `waitForClusterToBeReady()`, `waitForPipelineTobeReady(factor, timeoutMs)`, `waitTobeOutOfSafeMode()` — block until the cluster is usable
- `restartStorageContainerManager(...)`, `restartOzoneManager()`, `restartHddsDatanode(...)` — exercise restart / recovery code paths
- `shutdownHddsDatanode(...)`, `startHddsDatanodes()`, `shutdownHddsDatanodes()` — manipulate the Datanode fleet mid-test
- `shutdown()` (also via `AutoCloseable.close()`) wipes storage dirs; `stop()` halts without cleanup

## Test Structure

The simplest end-to-end example of the harness lives in the integration-test module itself: [`TestMiniOzoneCluster`](https://github.com/apache/ozone/blob/master/hadoop-ozone/integration-test/src/test/java/org/apache/hadoop/ozone/TestMiniOzoneCluster.java). It starts a small cluster, waits for it to be ready, and verifies the Datanodes registered. It's a useful template for any new integration test that boots its own cluster.

```java
public class TestMiniOzoneCluster {

  private MiniOzoneCluster cluster;
  private static OzoneConfiguration conf;

  @BeforeAll
  static void setup(@TempDir File testDir) {
    conf = new OzoneConfiguration();
    conf.set(HddsConfigKeys.OZONE_METADATA_DIRS, testDir.getAbsolutePath());
    conf.setInt(ScmConfigKeys.OZONE_DATANODE_PIPELINE_LIMIT, 1);
    conf.setBoolean(OzoneConfigKeys.HDDS_CONTAINER_RATIS_IPC_RANDOM_PORT, true);
    conf.set(ScmConfigKeys.OZONE_SCM_STALENODE_INTERVAL, "1s");
  }

  @AfterEach
  public void cleanup() {
    if (cluster != null) {
      cluster.shutdown();
    }
  }

  @Test
  public void testStartMultipleDatanodes() throws Exception {
    final int numberOfNodes = 3;
    cluster = MiniOzoneCluster.newBuilder(conf)
        .setNumDatanodes(numberOfNodes)
        .build();
    cluster.waitForClusterToBeReady();
    List<HddsDatanodeService> datanodes = cluster.getHddsDatanodes();
    assertEquals(numberOfNodes, datanodes.size());
    // ... per-Datanode assertions
  }
}
```

For an HA example, see [`TestOzoneManagerHAWithStoppedNodes`](https://github.com/apache/ozone/blob/master/hadoop-ozone/integration-test/src/test/java/org/apache/hadoop/ozone/om/TestOzoneManagerHAWithStoppedNodes.java).

## Layout of Test Code

Integration tests are split across three Maven modules under `hadoop-ozone/`:

```text
hadoop-ozone/
├── mini-cluster/             # Reusable MiniOzoneCluster harness (non-test scope)
├── integration-test/         # Core integration tests
│   └── src/test/java/org/apache/hadoop/ozone/
│       ├── client/rpc/       # RPC client tests
│       ├── container/        # Datanode container tests
│       ├── om/               # Ozone Manager tests
│       ├── scm/              # Storage Container Manager tests
│       └── shell/            # CLI tests
├── integration-test-recon/   # Recon-focused tests
└── integration-test-s3/      # S3 Gateway tests
```

| Module                   | Purpose                                                                                                                                   |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `integration-test`       | Core integration tests covering Ozone Manager (OM), Storage Container Management (SCM), Datanode, client, shell, and filesystem behavior. |
| `integration-test-recon` | Tests that focus on Recon and its interactions with the rest of the cluster.                                                              |
| `integration-test-s3`    | Tests that focus on the S3 Gateway.                                                                                                       |

Each module is a plain Maven jar (`ozone-integration-test`, `ozone-integration-test-recon`, `ozone-integration-test-s3`) whose dependencies are almost all declared at `test` scope — the modules contribute no production code.

Two factors drive this layout:

1. **They sit downstream of every production module.** An integration test routinely needs types from `ozone-manager`, `hdds-server-scm`, `hdds-container-service`, `ozone-client`, `recon`, `s3gateway`, and more. If these tests lived inside any of those modules, the consuming module would have to depend on its siblings, creating cycles that Maven cannot resolve. A dedicated downstream module breaks the cycle by being the single place that pulls everything together.
2. **Splitting Recon and S3 keeps the classpaths focused and the build parallelizable.** Recon and S3 Gateway each bring large transitive dependency trees (web framework, codegen output, AWS SDK). Isolating their tests in `integration-test-recon` and `integration-test-s3` keeps the core `integration-test` module lighter, lets Maven build and run the three suites independently, and makes it easier to run only the slice you care about during development.

The reusable cluster harness — `MiniOzoneCluster` and its builders — lives in a separate `hadoop-ozone/mini-cluster` module so that non-test modules can depend on it without inheriting an integration test's test-scoped classpath.

## Running Integration Tests Locally

Integration tests run as part of the standard Maven build, but you'll rarely want to run them all — the full suite takes tens of minutes. The common workflows:

```bash
# Run a single test class (the fastest feedback loop).
mvn -pl :ozone-integration-test test -Dtest=TestMiniOzoneCluster

# Run a single test method.
mvn -pl :ozone-integration-test test -Dtest='TestMiniOzoneCluster#testStartMultipleDatanodes'

# Same, but for the Recon and S3 modules.
mvn -pl :ozone-integration-test-recon test -Dtest=TestReconWithOzoneManager
mvn -pl :ozone-integration-test-s3    test -Dtest=TestS3SDK

# Run every integration test in a module (slow).
mvn -pl :ozone-integration-test test
```

A few practical notes:

- If you haven't built recently, add **`-am`** (`also-make`) so Maven builds the upstream modules first: `mvn -am -pl :ozone-integration-test test -Dtest=TestMiniOzoneCluster`.
- Skip work you don't need to shorten the rebuild: **`-DskipRecon`** (skip the Recon JS frontend) and **`-DskipShade`** (skip the fat-jar) are the two big wins. See [Maven build options](../../developer-guide/build/maven#common-maven-build-options) for the full list.
- When adding new coverage, prefer unit tests whenever possible to keep overall test runtime manageable; integration tests are much heavier, since they start a mini cluster of multiple networked services that must initialize and connect, which takes significant time.

## Test Reports

Surefire writes per-class reports under each module's `target/surefire-reports/`:

- `TEST-<class>.xml` — JUnit XML consumed by CI dashboards and the GitHub Actions test summary.
- `<class>.txt` — plain-text summary, handy when grepping locally.
- `<class>-output.txt` — captured stdout/stderr from the test JVM, including Ozone daemon logs.

## Best Practices

1. **Use `@TempDir` for storage directories.** Pointing `OZONE_METADATA_DIRS` at a JUnit-managed temp dir prevents RocksDB files from leaking between runs.
2. **Place new tests next to similar ones.** Recon-specific → `integration-test-recon`; S3 Gateway-specific → `integration-test-s3`; everything else → `integration-test`, grouped by feature area (`om/`, `scm/`, `client/rpc/`, `fs/ozone/`, …).
3. **Keep tests independent.** Each test should build, exercise, and tear down its own cluster; sharing state across `@Test` methods reintroduces ordering bugs that the harness is meant to avoid.
