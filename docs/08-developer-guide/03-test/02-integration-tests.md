# Integration Tests

Integration tests validate how multiple components of the Ozone system work together. They are more comprehensive than unit tests but run in a more controlled environment than full acceptance tests.

## Scope and Purpose

Integration tests serve a specific purpose in Ozone's testing strategy:

- **Unit Tests**: Test individual classes/methods in isolation with mocked dependencies
- **Integration Tests**: Test multiple components together within a JVM-based mini-cluster
- **Acceptance Tests**: Test a fully deployed Ozone system with actual Docker containers

Integration tests are ideal for validating:

- Component interactions (OM, SCM, Datanode)
- Client API behavior
- Data flow across components
- State transitions and recovery mechanisms
- Configuration changes

## MiniOzoneCluster

The cornerstone of Ozone's integration testing is the `MiniOzoneCluster` framework, which provides an in-memory Ozone cluster for testing.

### Key Features

- Configurable components (OM, SCM, Datanodes, Recon)
- Support for HA configurations
- Ability to start/stop individual components
- Simulated failures and recovery testing
- Custom configuration options

### Basic Usage

Here's how to create and use a MiniOzoneCluster:

```java
@Rule
public TemporaryFolder folder = new TemporaryFolder();

private MiniOzoneCluster cluster;
private OzoneClient client;

@Before
public void setup() throws Exception {
  MiniOzoneCluster.Builder builder = MiniOzoneCluster.newBuilder()
      .setNumDatanodes(3)
      .setTotalPipelineNumFactors(1)
      .setConf(new OzoneConfiguration());
  
  cluster = builder.build();
  cluster.waitForClusterToBeReady();
  
  client = cluster.newClient();
}

@After
public void tearDown() {
  if (client != null) {
    client.close();
  }
  
  if (cluster != null) {
    cluster.shutdown();
  }
}

@Test
public void testCreateVolume() throws Exception {
  ObjectStore objectStore = client.getObjectStore();
  objectStore.createVolume("test-volume");
  OzoneVolume volume = objectStore.getVolume("test-volume");
  assertEquals("test-volume", volume.getName());
}
```

### HA Configuration

For testing HA scenarios:

```java
MiniOzoneCluster.Builder builder = MiniOzoneCluster.newBuilder()
    .setNumDatanodes(3)
    .setTotalPipelineNumFactors(1)
    .setOMServiceId("om-service-test1")
    .setNumOfOzoneManagers(3)
    .setConf(conf);
```

## Project Structure

Integration tests are organized in a dedicated module: `hadoop-ozone/integration-test`.

This separation provides several benefits:

1. **Clean Dependency Management**: Integration tests often require dependencies that aren't needed for runtime
2. **Separate Compilation**: Keeps build times manageable by separating integration tests
3. **Targeted Execution**: Makes it easier to run only integration tests or skip them

The module is structured as follows:

```
hadoop-ozone/integration-test/
├── src/
│   └── test/
│       ├── java/
│       │   └── org/apache/hadoop/ozone/
│       │       ├── client/       # Client API tests
│       │       ├── container/    # Container-related tests
│       │       ├── om/           # Ozone Manager tests
│       │       ├── scm/          # Storage Container Manager tests
│       │       └── ...
│       └── resources/            # Test configurations
└── pom.xml                       # Module dependencies
```

## Running Integration Tests

Integration tests can be run using Maven:

```bash
# Run all integration tests
cd hadoop-ozone
mvn verify -DskipUnitTests

# Run a specific test class
mvn verify -DskipUnitTests -Dit.test=TestOzoneManagerHA

# Run with a specific profile
mvn verify -P integration
```

## Test Categories

Integration tests cover several areas:

1. **Component Tests**: Test specific components like OM, SCM, or Datanode
2. **Client API Tests**: Test client interfaces (e.g., Object Store, S3)
3. **Feature Tests**: Test specific features (e.g., encryption, replication)
4. **Failure Tests**: Test behavior during component failures
5. **Upgrade Tests**: Test version compatibility and upgrade procedures

## Best Practices

1. **Use appropriate test category**: Choose between unit, integration, and acceptance tests based on what you're testing
2. **Minimize test time**: Keep integration tests as focused as possible
3. **Clean up resources**: Ensure all resources are properly closed in `@After` methods
4. **Avoid network dependencies**: Tests should not depend on external systems
5. **Use randomized ports**: Avoid hardcoding ports to allow parallel test execution
