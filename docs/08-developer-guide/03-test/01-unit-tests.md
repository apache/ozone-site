---
sidebar_label: Unit tests
---

# Unit tests

This guide describes how **unit tests** are organized in **[Apache Ozone](https://github.com/apache/ozone)** and how to run and debug them locally. It complements [Building with Maven](../build/maven).

:::info Ozone source tree

Unit tests live in the **`apache/ozone`** repository. This **`ozone-site`** repo only hosts documentation.

:::

## Scope: unit tests vs integration tests

Ozone uses two broad kinds of automated Java tests:

1. **Unit tests** exercise individual classes or small collaborations in isolation. They should be **fast**, avoid starting real Ozone daemons, and typically rely on **JUnit** and **Mockito** (or test doubles) instead of a live cluster.
2. **Integration tests** validate behavior across components and often use **`MiniOzoneCluster`** or similar harnesses. Most of those tests live in **`hadoop-ozone/integration-test`**. They are slower and closer to a real deployment.

Keeping heavy integration work out of the default unit-test path keeps `mvn test` and CI feedback loops usable. For cluster-style scenarios, use integration tests in the **`hadoop-ozone/integration-test`** module (and see [acceptance tests](acceptance-tests) for Docker-based suites).

## JUnit 4 vs JUnit 5 (Jupiter)

The Ozone parent **Maven** build is set up for **JUnit 5**. In many modules, **legacy JUnit 4 imports** (`org.junit.Test`, `org.junit.Assert`, …) are **disallowed** by import rules; new and migrated tests should use **`org.junit.jupiter.api.*`** and related APIs.

Practical guidance:

- Prefer **`@Test`**, **`@BeforeEach`**, **`@AfterEach`**, and **`Assertions`** from **`org.junit.jupiter.api`**.
- Use **Mockito** with **`mockito-junit-jupiter`** (`@ExtendWith(MockitoExtension.class)`) when you need mocks in JUnit 5.
- When you touch older tests still on JUnit 4, consider migrating them if the module’s rules require Jupiter.
- Do **not** use **`org.junit.jupiter.api.Disabled`** to skip tests in the normal way: the build enforces alternatives such as **`@Unhealthy`** or **`@Slow`** (see [HDDS-9276](https://issues.apache.org/jira/browse/HDDS-9276)).

Surefire is configured for the JUnit **Platform** (including default timeouts and stdout/stderr capture). Test class names must match the parent POM’s **`**/Test*.java`** include pattern.

## Layout of test code and resources

Each module follows the usual Maven layout:

| Location | Purpose |
|----------|---------|
| **`src/test/java`** | Test sources |
| **`src/test/resources`** | Config and fixtures (`ozone-site.xml`, Kerberos stubs, logging config, and so on) |
| **`target/test-classes`** | Compiled tests and copied resources |
| **`target/log`** | Log directory used when tests run (see **`hadoop.log.dir`** in the root POM) |

### Temporary files and directories

Do **not** hard-code paths under `/tmp` or the project root. Use **`GenericTestUtils.getTempPath(String)`** or **`GenericTestUtils.getTestDir()`** from **`org.apache.ozone.test.GenericTestUtils`** so files stay under the module’s **`target`** tree and clean up predictably.

## Configuring logging

### In test code

To focus logs while debugging a failure, set the level for a specific class:

```java
import org.apache.ozone.test.GenericTestUtils;
import org.slf4j.event.Level;

GenericTestUtils.setLogLevel(MyClassUnderTest.class, Level.DEBUG);
```

### In `src/test/resources`

Each module can ship logging configuration under **`src/test/resources`** (for example **`log4j.properties`** or Log4j 2 config, depending on what that module uses). Adjust logger levels there when you want a persistent default for all tests in that module:

```properties
log4j.logger.org.apache.hadoop.ozone.om=DEBUG
```

### From Maven

You can run a single test class from the repository root or from a module:

```bash
mvn test -Dtest=TestMyClass
```

Test output is often redirected to files under the module’s **`target`** directory (see **`maven.test.redirectTestOutputToFile`** in the Ozone POM). If you need more detail in the console for one run, check the **`target/surefire-reports`** directory or adjust Surefire/logging options for that module.

The parent configuration sets **`trimStackTrace`** to **`false`** so Surefire should print full stack traces for failures.

## See also

- [Building with Maven](../build/maven) — full build flags (`skipTests`, modules, and so on)
- [Acceptance tests](acceptance-tests) — Docker-based test suites
