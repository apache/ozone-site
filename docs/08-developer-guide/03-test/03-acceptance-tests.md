# Acceptance Tests

Acceptance tests validate the complete Ozone system from an end-user perspective. They deploy and test Ozone in a containerized environment that closely resembles real-world deployments.

## Scope and Purpose

Acceptance tests serve as the final validation layer in Ozone's testing strategy:
- **Unit Tests**: Test individual classes in isolation
- **Integration** Tests: Test component interactions using in-memory clusters
- **Acceptance Tests**: Test the entire system as deployed in containers

Acceptance tests are ideal for:
- End-to-end workflows
- API compliance (especially S3)
- Security configurations
- System behavior under various conditions
- External interfaces and integrations

## Testing Framework

Ozone uses [Robot Framework](https://robotframework.org/) for acceptance testing. Robot Framework is a generic test automation framework that uses a keyword-driven approach to testing.

You can run acceptance tests in any environment after [installing robot framework](https://github.com/robotframework/robotframework/blob/master/INSTALL.rst)


### Key Features

- Human-readable test syntax
- Extensive test libraries
- Test case organization by feature
- Detailed test reports
- Ability to create custom keywords

## Directory Structure
Acceptance tests are located in the `hadoop-ozone/dist/src/main/smoketest/` directory.

```text
smoketest/
├── basic/               # Basic functionality tests
├── s3/                  # S3 gateway tests
├── security/            # Security and authentication tests
├── recon/               # Recon service tests
├── ozone-lib/           # Shared libraries and utilities  
├── commonlib.robot      # Common test keywords
└── compose/             # Docker Compose test environment
    ├── ozone/           # Ozone-specific test configurations
    ├── security/        # Secure test configurations
    └── ha/              # HA test configurations
```

## Test Structure

Robot Framework tests are written in `test_name.robot` files with a structured format:

```text
*** Settings ***
Documentation       Test Ozone volume operations
Library             OperatingSystems
Resource            ../ozone-lib/shell.robot

*** Variables ***
${volume}           vol1

*** Test Cases ***
Create Volume
    Execute             ozone sh volume create /${volume}
    Execute             ozone sh volume list
    Should contain      ${OUTPUT}       ${volume}

Delete Volume
    Execute             ozone sh volume delete /${volume}
    Execute             ozone sh volume list
    Should not contain  ${OUTPUT}       ${volume}
```

## Running Tests Locally

You can run acceptance tests in several ways:

### Method 1: Using Docker Compose

```bash
# Go to the compose directory
cd hadoop-ozone/dist/src/main/compose/

# Run all tests
./test-all.sh

# Run single test
docker-compose up -d
# wait....
./test-single.sh scm basic/basic.robot
```

### Method 2: Against a Running Cluster

```bash
# Set environment variables to point to your cluster
export OZONE_OM_SERVICE_ID=om-service-test1
export OZONE_OM_INTERNAL_SERVICE_ID=om-internal-service-test1
export OZONE_OM_ADDRESS=ozonemanager.example.com:9862
export OZONE_ADMINISTRATORS=admin

# Run the Robot Framework tests directly
cd hadoop-ozone/dist/src/main/smoketest
robot basic/basic.robot
```

### Method 3: Using Maven

```bash
# Run acceptance tests with Maven
cd hadoop-ozone
mvn verify -Pacceptance
```

## Specialized Test Environments

Ozone provides several pre-configured test environments:

### Standard Environment

Basic Ozone cluster with minimal services.

### Secure Environment (Kerberos)

Ozone cluster with Kerberos security enabled.

### High Availability (HA) Environment

Ozone cluster with multiple OMs and SCMs for HA testing.

### S3

Running S3 specific tests requires the following setup:
1. Create a bucket
2. Configure your local aws cli
3. Set bucket/endpointurl during the robot test execution

```bash
robot -v bucket:ozonetest -v OZONE_TEST:false -v OZONE_S3_SET_CREDENTIALS:false -v ENDPOINT_URL:https://s3.us-east-2.amazonaws.com smoketest/s3
```

## Test Reports

After running tests, Robot Framework generates detailed HTML reports:

- `report.html`: Summary report of all test cases
- `log.html`: Detailed log of test execution
- `output.xml`: XML output for processing with other tools

These reports are typically found in the `robot-results/` directory.


## Best Practices

1. Use existing keywords: Leverage existing keywords from `commonlib.robot` and other libraries
2. Create reusable keywords: Define new keywords for complex operations
3. Clear test descriptions: Each test case should have a clear purpose
4. Independent tests: Tests should not depend on each other
5. Proper teardown: Always clean up resources in teardown sections
6. Meaningful assertions: Verify the right conditions with proper assertions
