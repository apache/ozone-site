---
sidebar_label: IntelliJ IDEA
---

# Running Ozone Services in IntelliJ IDEA

Developers working on Apache Ozone often need to run individual services (Ozone Manager, Storage Container Manager, Datanode) directly within their IDE for easier debugging, testing, and development iteration. This guide outlines the steps to configure and run Ozone services using IntelliJ IDEA.

## Prerequisites

*   **Ozone Source Code:** Cloned from the [official repository](https://github.com/apache/ozone).
*   **IntelliJ IDEA:** Installed with Maven integration enabled.
*   **Maven Build:** You must have successfully built the Ozone project at least once using Maven (e.g., `mvn clean package -DskipTests`) from the root of the source code directory. This generates necessary classes and resources.

## Steps

The general approach involves creating separate "Application" Run/Debug configurations within IntelliJ for each Ozone service you want to run.

1.  **Import Ozone as Maven Project:**
    *   Open IntelliJ IDEA.
    *   Select `File -> Open...` or `Open` from the welcome screen.
    *   Navigate to the root directory of your cloned Ozone source code (the directory containing the main `pom.xml`).
    *   Click `Open`. IntelliJ should detect the `pom.xml` and ask if you want to open it as a project. Confirm this.
    *   Allow IntelliJ time to index the project and download Maven dependencies.

2.  **Create Run/Debug Configurations:**
    You'll typically need configurations for OM, SCM, and at least one Datanode.

    *   Go to `Run -> Edit Configurations...`.
    *   Click the `+` button and select `Application`.

    *   **For Ozone Manager (OM):**
        *   **Name:** `Ozone Manager` (or similar)
        *   **Main class:** `org.apache.hadoop.ozone.om.OzoneManager` (Use the search icon to find it).
        *   **VM options:** Set appropriate memory limits and potentially define the metadata directory location.
            ```
            -Xmx2g -Dozone.om.db.dirs=/path/to/your/dev/metadata/om
            ```
            *Replace `/path/to/your/dev/metadata/om` with an actual path on your system where OM can store its metadata.*
        *   **Working directory:** Set this to a directory containing development configuration files. **Crucially, use the files provided in `<ozone-source-root>/hadoop-ozone/dev-support/intellij` as your starting point** (see Step 3).
        *   **Use classpath of module:** Select `hadoop-ozone-ozone-manager`.
        *   Click `Apply`.

    *   **For Storage Container Manager (SCM):**
        *   **Name:** `Storage Container Manager`
        *   **Main class:** `org.apache.hadoop.hdds.scm.server.StorageContainerManager`
        *   **VM options:**
            ```
            -Xmx2g -Dhdds.scm.db.dirs=/path/to/your/dev/metadata/scm
            ```
            *Replace `/path/to/your/dev/metadata/scm` with an actual path.*
        *   **Working directory:** Same as the OM configuration (using files from `dev-support/intellij`).
        *   **Use classpath of module:** Select `hadoop-hdds-server-scm`.
        *   Click `Apply`.

    *   **For HddsDatanodeService (Datanode):**
        *   **Name:** `Datanode 1` (you might create more for multi-node testing)
        *   **Main class:** `org.apache.hadoop.ozone.HddsDatanodeService`
        *   **VM options:** Define the Datanode data directories.
            ```
            -Xmx2g -Dhdds.datanode.dir=/path/to/your/dev/data/dn1
            ```
            *Replace `/path/to/your/dev/data/dn1` with an actual path. Ensure this path is unique for each Datanode configuration if running multiple.*
        *   **Working directory:** Same as the OM/SCM configuration (using files from `dev-support/intellij`).
        *   **Use classpath of module:** Select `hadoop-hdds-container-service`.
        *   Click `Apply`.

3.  **Prepare Configuration Files (Using `dev-support/intellij`):**
    *   The Ozone source code includes pre-configured files specifically for running services within an IDE like IntelliJ, located in:
        `<ozone-source-root>/hadoop-ozone/dev-support/intellij`
    *   This directory contains `ozone-site.xml`, `core-site.xml`, `log4j.properties`, etc., tailored for local development runs.
    *   **Set the Working Directory:** In your Run/Debug configurations (Step 2), set the **Working directory** to this `dev-support/intellij` path within your source code checkout. IntelliJ will then pick up these configuration files automatically.
    *   **Review and Adjust:**
        *   Examine the `ozone-site.xml` in `dev-support/intellij`. It likely defines default ports and uses `${basedir}` or relative paths for metadata/data directories (e.g., `hdds.datanode.dir`, `ozone.om.db.dirs`).
        *   **Crucially, ensure the paths defined in the VM options (like `-Dozone.om.db.dirs=...`) match where you want the data stored, or modify the `ozone-site.xml` directly to use absolute paths suitable for your system.** Using the VM options is often clearer for defining data locations outside the source tree.
        *   Verify the ports defined do not conflict with other services running on your machine.
        *   You might need to adjust `hdds.datanode.dir.perm` based on your operating system and user permissions.

4.  **Run or Debug:**
    *   Select the desired configuration (e.g., `Storage Container Manager`) from the Run/Debug configuration dropdown near the top-right of the IntelliJ window.
    *   Click the "Run" (play) button or "Debug" (bug) button.
    *   Start SCM first, then OM, then Datanode(s). Observe the console output in IntelliJ for startup messages and potential errors.
    *   You can now set breakpoints, inspect variables, and step through the Ozone code as the services run.

## Tips

*   **Metadata Cleanup:** Remember to manually delete the contents of your development metadata and data directories (`/path/to/your/dev/...`) between runs if you want a clean start.
*   **Port Conflicts:** Ensure the ports configured in `ozone-site.xml` for OM, SCM, Datanodes, and their respective UIs are free on your machine.
*   **Classpath Issues:** If you encounter `ClassNotFoundException` errors, double-check that the correct module classpath is selected in the Run/Debug configuration and that you have run a successful Maven build (`mvn package`).
*   **Configuration Loading:** By setting the working directory to `dev-support/intellij`, IntelliJ typically ensures these configuration files are on the classpath when launching the services. You can also explicitly set the `OZONE_CONF_DIR` environment variable in the Run/Debug configuration if needed, but using the working directory is usually sufficient.

Running services directly in IntelliJ provides a powerful environment for Ozone development and debugging.
