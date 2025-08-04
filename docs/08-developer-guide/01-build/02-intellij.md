---
sidebar_label: IntelliJ IDEA Setup
---

# Setting Up IntelliJ IDEA for Ozone Development

Apache Ozone is a Java-based project built with Maven. This guide provides detailed instructions for importing, building, and properly setting up IntelliJ IDEA to work with the Ozone codebase, including handling generated source code.

## Prerequisites

- IntelliJ IDEA (Ultimate or Community Edition)
- JDK 8 or 11 (as required by the Ozone version you're working with)
- Maven 3.6+ installed
- Git

## Importing the Project

1. **Clone the Repository**
   ```bash
   git clone https://github.com/apache/ozone.git
   cd ozone
   ```

2. **Perform Initial Maven Build**
   Before importing into IntelliJ, run a Maven build to generate needed sources:
   ```bash
   mvn clean install -DskipTests
   ```
   This initial build:
   - Generates Protocol Buffer sources
   - Prepares Maven modules for IDE import
   - Creates necessary resources

3. **Import into IntelliJ IDEA**
   - Open IntelliJ IDEA
   - Select "Open" from the welcome screen
   - Navigate to the root directory of your Ozone checkout
   - Select the main `pom.xml` file
   - Choose "Open as Project"
   - Select "Import Maven projects automatically" when prompted

## Configuring Generated Sources

Ozone uses Protocol Buffers extensively, which requires special handling in the IDE:

1. **Add Generated Sources to Source Paths**
   - The Maven build automatically generates source files, but you may need to manually mark these directories:
   - Right-click on the following directories in the Project view and select "Mark Directory as" → "Generated Sources Root":
     - `hadoop-hdds/interface-client/target/generated-sources/java`
     - `hadoop-hdds/interface-client/target/generated-sources/protobuf`
     - `hadoop-hdds/interface-client/target/generated-sources/proto`
     - Other modules with similar generated source directories

2. **Increasing IntelliJ's File Size Limit**
   Protocol Buffer generated files can be large and may exceed IntelliJ's default maximum file size for code intelligence:

   - Go to "Help" → "Edit Custom Properties"
   - Create the `idea.properties` file if prompted
   - Add the following lines:
     ```
     # Maximum file size (kilobytes) IDE should provide code assistance for.
     idea.max.intellisense.filesize=999999

     # Maximum file size (kilobytes) IDE is able to open.
     idea.max.content.load.filesize=999999
     ```
   - Restart IntelliJ IDEA

3. **Maven Import Settings**
   - Go to "File" → "Settings" → "Build, Execution, Deployment" → "Build Tools" → "Maven" → "Importing"
   - Ensure "Generated sources folders" is set to "Detect automatically"
   - Check "Import Maven projects automatically"

## Handling Module Dependencies

Ozone has a complex module structure. Verify proper dependency resolution:

1. **Module SDK Settings**
   - Go to "File" → "Project Structure" → "Project"
   - Ensure the correct JDK is selected as Project SDK

2. **Maven Settings**
   - Verify Maven settings are correct in "File" → "Settings" → "Build, Execution, Deployment" → "Build Tools" → "Maven"
   - Set "Maven home directory" to your Maven installation

## Running Ozone Components in IntelliJ

Once you've set up your IntelliJ IDEA environment correctly, you can configure and run individual Ozone components directly from the IDE.

For detailed instructions on configuring run configurations for Ozone components (Ozone Manager, Storage Container Manager, Datanode), see:

**[Running Ozone Services in IntelliJ IDEA](../02-run/01-intellij.md)**

This guide provides step-by-step instructions for:
- Setting up each component's run configuration
- Configuring proper working directories
- Setting appropriate VM options
- Managing data/metadata directories
- Starting and debugging Ozone services

## Troubleshooting Common Issues

1. **Missing Generated Sources**
   - If IntelliJ can't resolve references to generated classes:
     - Verify Maven has run successfully with `mvn clean install -DskipTests`
     - Manually mark the generated directories as source roots
     - Refresh the Maven project in IntelliJ (right-click on project → "Maven" → "Reload Project")

2. **IDE Freezes When Opening Large Files**
   - Add the file size parameter mentioned above
   - Consider installing the "Performance" plugin from JetBrains

3. **Compilation Errors**
   - If compilation fails in IntelliJ but works with Maven:
     - Verify you've properly marked generated sources directories
     - Check that IntelliJ is using the same JDK as Maven
     - Ensure IntelliJ's Maven integration is properly configured

4. **Module Not Found Errors**
   - If modules cannot be resolved, try:
     - Close and reopen the project
     - Delete `.idea` directory and reimport the project
     - Manually verify module paths in "File" → "Project Structure" → "Modules"

## Additional Resources

- The Ozone codebase includes pre-configured files for running in IntelliJ at:
  `hadoop-ozone/dev-support/intellij/` (includes configuration files like `ozone-site.xml`)
- Refer to the main Ozone documentation for more details on architecture and components

## Contributing

When contributing code developed in IntelliJ:

1. Ensure all tests pass: Right-click on the test directory and select "Run Tests"
2. Verify code style compliance: Run Maven with `mvn spotless:check`
3. Format code according to project guidelines: `mvn spotless:apply`