---
sidebar_label: Continuous Integration
---

# Continuous Integration With GitHub Actions

Apache Ozone uses GitHub Actions for continuous integration (CI), automating the build, test, and verification processes. This ensures code quality and reduces the risk of introducing defects.

## CI Workflow Overview

The primary CI workflow in Ozone is defined in `.github/workflows/ci.yml`. It's triggered by:

- Pull request creation or updates
- Direct pushes to the main branch
- Scheduled runs (twice daily)

### Main Workflow Components

The CI workflow consists of several jobs:

1. **build-info**: Determines which tests should run based on modified files
2. **compile**: Builds the project with different Java versions (8, 11, 17)
3. **basic**: Runs quick checks like style validation and license header verification
4. **acceptance**: Executes Robot Framework tests in containerized environments
5. **kubernetes**: Tests Kubernetes deployment configurations
6. **integration**: Runs integration tests with MiniOzoneCluster
7. **coverage**: Collects and merges code coverage data

## Smart Test Selection

Ozone's CI optimizes resource usage by selectively running tests based on what files changed:

```bash
# Examples of selective test execution
if [[ changed_files =~ \.md$ ]]; then
  # Only documentation changed, run minimal checks
  RUN_CHECKS="author checkstyle"
elif [[ changed_files =~ pom\.xml ]]; then
  # Dependency changes, include dependency checks
  RUN_CHECKS="author rat checkstyle findbugs dependency"
fi
```

This logic is implemented in `.github/selective_ci_checks.sh` and helps reduce CI time for smaller changes.

## Available CI Jobs

### 1. Basic Checks

Quick checks that complete in under 10 minutes:

- **author**: Ensures no `@author` tags in code
- **rat**: Verifies Apache license headers
- **checkstyle**: Validates code style
- **findbugs**: Runs static code analysis
- **dependency**: Checks for dependency issues

### 2. Integration Tests

Tests component interactions using MiniOzoneCluster:

```bash
# Run integration tests with Maven
mvn verify -Pintegration
```

These tests are grouped into suites in `integration_suites.sh` and can run in parallel.

### 3. Acceptance Tests

End-to-end tests using Robot Framework with Docker:

```bash
# Run acceptance tests
cd hadoop-ozone/dist/src/main/smoketest/compose
./test.sh ozone basic
```

Acceptance tests verify real-world behavior in containerized environments.

### 4. Kubernetes Tests

Tests Ozone deployment on Kubernetes:

```bash
# Run Kubernetes tests
cd hadoop-ozone/dev-support/checks
./kubernetes.sh
```

## Adding a New Test to CI

To add a new test to the CI pipeline:

1. Create your test files in the appropriate directory
2. Update the relevant test selection script:
   - For acceptance tests: `acceptance_suites.sh`
   - For integration tests: `integration_suites.sh`
3. For new test types, update `.github/workflows/ci.yml`

## Running CI Locally

You can run the same checks locally:

```bash
# Run basic checks
cd hadoop-ozone/dev-support/checks
./rat.sh
./checkstyle.sh
./findbugs.sh

# Run unit tests
./unit.sh

# Run integration tests
./integration.sh
```

## Interpreting CI Results

GitHub Actions provides detailed logs for each job. When a job fails:

1. Look at the failed step in the workflow summary
2. Open the detailed job log
3. Search for "ERROR" or "FAIL" to find the issue
4. For test failures, check test reports in artifacts

## Rerunning Failed Jobs

If CI fails, you can:

1. Click "Re-run jobs" in the GitHub Actions interface
2. Make a small change and push again
3. Use the `/retest` comment command in your PR

## Best Practices

1. **Run checks locally** before pushing changes
2. **Check for similar failures** in recent PRs
3. **Add tests** for new features and bug fixes
4. **Minimize false positives** by making tests reliable
5. **Don't ignore failures** - fix the root cause

## Common Issues and Solutions

### Flaky Tests

Some tests may occasionally fail due to timing or resource issues:

1. Check recent runs to see if it's a known flaky test
2. Look for timeout or race condition issues
3. Consider improving the test's stability

### Resource Constraints

CI jobs run with limited resources:

1. Avoid excessive memory usage in tests
2. Use appropriate timeouts for operations
3. Clean up resources properly

### Dependency Issues

If dependency checks fail:

1. Verify compatibility with existing dependencies
2. Check for Maven shade plugin conflicts
3. Ensure proper dependency management

## Additional CI Information

For advanced CI topics, refer to:

- [GitHub Actions Tips and Tricks](https://cwiki.apache.org/confluence/display/OZONE/Github+Actions+tips+and+tricks)
- [PR Review Process](https://cwiki.apache.org/confluence/display/OZONE/Pull+Request+Review+Process)
