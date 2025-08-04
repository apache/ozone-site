# Unit Tests

Unit tests are the foundation of Ozone's testing strategy, focusing on validating the behavior of individual classes and methods in isolation. They are fast, reliable, and essential for detecting issues early in the development process.

## Test Framework

Ozone primarily uses JUnit 4 for unit testing. While the project is considering migration to JUnit 5 for newer tests, most existing tests are still written using JUnit 4.

```java
// Example of a typical JUnit 4 test in Ozone
@Test
public void testKeyNameValidator() {
  String keyName = "test-key-name";
  assertTrue(OzoneUtils.isValidKeyName(keyName));
  assertFalse(OzoneUtils.isValidKeyName(""));
}
```

## Directory Structure

Unit tests follow Maven's standard directory structure:

- Source code: `src/main/java`
- Test code: `src/test/java`
- Test resources: `src/test/resources`

Test classes typically mirror the package structure of the source code they're testing, with "Test" appended to the class name:

```
org.apache.hadoop.ozone.om.OzoneManager          // Implementation class
org.apache.hadoop.ozone.om.OzoneManagerTest      // Test class
```

## Running Unit Tests

You can run unit tests for specific modules or the entire project:

```bash
# Run all unit tests in a specific module
cd hadoop-ozone/common
mvn test

# Run a specific test class
mvn test -Dtest=OzoneManagerTest

# Run a specific test method
mvn test -Dtest=OzoneManagerTest#testStartUp
```

## Test Resources

Test resources like configuration files, test data, and certificates are stored in `src/test/resources`. These files are automatically added to the classpath during test execution.

## Configuring Log Levels

Ozone uses Log4j for logging. You can configure logging levels for tests in two ways:

### Method 1: Using log4j.properties

Create or modify a `log4j.properties` file in the `src/test/resources` directory:

```properties
# Set default logging level
log4j.rootLogger=INFO, stdout

# Configure console appender
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} %-5p %c{1}:%L - %m%n

# Set specific logger levels
log4j.logger.org.apache.hadoop.ozone.om=DEBUG
```

### Method 2: Programmatically in Tests

For temporary changes during testing, you can modify log levels programmatically:

```java
@Before
public void setup() {
  LogManager.getLogger("org.apache.hadoop.ozone.om").setLevel(Level.DEBUG);
}
```

## Best Practices

1. **Keep tests focused**: Each test should verify one specific behavior
2. **Use descriptive names**: Test methods should clearly describe what they're testing
3. **Avoid test dependencies**: Tests should be able to run independently
4. **Clean up resources**: Use `@After` or `@AfterClass` to clean up any resources created during tests
5. **Use appropriate assertions**: Choose the right assertion method for the condition you're testing
6. **Mock external dependencies**: Use Mockito to isolate the code under test
