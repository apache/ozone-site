---
sidebar_label: Static Analysis
---

# Static Code Analysis

Apache Ozone uses static code analysis tools to identify potential bugs, code smells, security vulnerabilities, and other issues before they make it into production. SonarQube is the primary tool used for comprehensive code quality analysis.

## SonarQube Overview

[SonarQube](https://www.sonarqube.org/) is an open-source platform for continuous inspection of code quality. It performs automatic reviews with static analysis to detect:

- Bugs and logic errors
- Code smells (maintainability issues)
- Security vulnerabilities
- Duplicated code
- Test coverage gaps
- Coding standard violations

## SonarCloud for Apache Ozone

Apache Ozone uses SonarCloud, a cloud-based version of SonarQube, for continuous code quality analysis.

### Accessing SonarCloud

The Ozone project's SonarCloud dashboard is publicly available at: https://sonarcloud.io/project/overview?id=apache_ozone

### When Analysis Runs

SonarCloud analysis is triggered automatically on:

- Pull Request submissions
- Merges to the main branch
- Release branch creation

The analysis is integrated into the GitHub Actions CI workflow in .github/workflows/ci.yml.

## Understanding SonarQube Results

### Dashboard Overview

The SonarCloud dashboard provides high-level metrics including:

- **Quality Gate Status**: Overall pass/fail status based on quality thresholds
- **Bugs**: Logic errors and potential runtime issues
- **Vulnerabilities**: Security issues
- **Code Smells**: Maintainability issues
- **Coverage**: Percentage of code covered by tests
- **Duplications**: Percentage of duplicated code

### Issue Severity Levels

SonarQube categorizes issues by severity:

- **Blocker**: Issues that must be fixed immediately (risk of system failure)
- **Critical**: High-impact issues requiring urgent attention
- **Major**: Default severity for most issues
- **Minor**: Low-impact issues with minimal risk
- **Info**: Non-critical issues that represent best practice violations

## Addressing SonarQube Issues

### Viewing PR-Specific Issues

For Pull Requests, SonarCloud posts a comment with analysis results directly in the PR conversation. This includes:

- New issues introduced by the PR
- Code coverage changes
- Overall status of the quality gate

### Fixing Common Issues

#### 1. Code Smells

Typically maintenance-related issues like:

```java
// Before: Magic number
if (retryCount > 5) {
// Retry logic
}

// After: Named constant
private static final int MAX_RETRY_COUNT = 5;

if (retryCount > MAX_RETRY_COUNT) {
// Retry logic
}
```

#### 2. Bugs

Logic errors that could cause runtime issues:

```java
// Before: Potential NullPointerException
String value = map.get("key").toString();

// After: Null check
String rawValue = map.get("key");
String value = rawValue != null ? rawValue.toString() : "";
```

#### 3. Security Vulnerabilities

Issues that could expose security weaknesses:

```java
// Before: Hardcoded credentials
private static final String PASSWORD = "p@ssw0rd";

// After: Configuration-based approach
private String password = configuration.get("security.password");
```

## Other Static Analysis Tools

In addition to SonarQube, Ozone uses several other static analysis tools:

### 1. SpotBugs (Formerly FindBugs)

Detects potential bugs in Java code through bytecode analysis.

```shell
# Run SpotBugs
cd hadoop-ozone/dev-support/checks
./findbugs.sh
```

Configuration is `in hadoop-ozone/dev-support/checks/findbugs.sh`

### 2. PMD

Source code analyzer that finds common programming flaws.

```shell
# Run PMD
cd hadoop-ozone
mvn pmd:check
```

Rules are defined in `hadoop-ozone/dev-support/pmd/pmd-ruleset.xml`

### 3. Checkstyle

Enforces coding standards and conventions.

```shell
# Run Checkstyle
cd hadoop-ozone/dev-support/checks
./checkstyle.sh
```

Ozone's checkstyle rules ensure consistent code formatting and structure.

## Best Practices

1. **Fix issues early**: Address static analysis findings as you develop
2. **Prioritize by severity**: Focus on Blocker and Critical issues first
3. **Maintain test coverage**: Keep coverage high to catch regressions
4. **Understand false positives**: Some issues may be false alarms; use `@SuppressWarnings` with care
5. **Run locally before pushing**: Run static analysis checks locally to catch issues early

```shell
# Run all static analysis checks
cd hadoop-ozone/dev-support/checks
./findbugs.sh
./checkstyle.sh
./rat.sh
```

## Resources

- [SonarSource Rules](https://rules.sonarsource.com/java/) - Detailed explanations of Java rules
- [SpotBugs Bug Patterns](https://spotbugs.readthedocs.io/en/latest/bugDescriptions.html) - Explanations of bug patterns
- [PMD Rules](https://pmd.github.io/latest/pmd_rules_java.html) - Complete list of PMD rules
- [Checkstyle Checks](https://checkstyle.sourceforge.io/checks.html) - Available Checkstyle checks
cspell.yaml
