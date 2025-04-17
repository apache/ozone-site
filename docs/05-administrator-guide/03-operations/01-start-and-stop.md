# Starting and Stopping Ozone Services

Ozone services (Ozone Manager, Storage Container Manager, Datanode, Recon, S3 Gateway) are typically managed using the `ozone` command-line interface (CLI) tool provided with the Ozone distribution.

## Using the `ozone --daemon` Command

The primary way to start and stop individual Ozone daemons on their respective hosts is using the `ozone --daemon` command.

**Syntax:**

```bash
ozone --daemon <start|stop> <service>
```

Where `<service>` is one of:

*   `om` (Ozone Manager)
*   `scm` (Storage Container Manager)
*   `datanode`
*   `recon`
*   `s3g` (S3 Gateway)

**Note:** You must run these commands on the host where the specific service is configured to run.

## Recommended Order

### Start Order

It's generally recommended to start services in the following order:

1.  **Storage Container Manager (SCM):** The SCM must be running before Ozone Managers and Datanodes can function correctly.
2.  **Ozone Manager (OM):** The OM depends on the SCM.
3.  **Datanodes:** Datanodes register with both SCM and OM.
4.  **S3 Gateway (S3G):** Depends on OM.
5.  **Recon:** Depends on OM and SCM.

### Stop Order

Stop services in the reverse order of startup to minimize disruption:

1.  **Recon**
2.  **S3 Gateway (S3G)**
3.  **Datanodes**
4.  **Ozone Manager (OM)**
5.  **Storage Container Manager (SCM)**

## Commands by Service

### Storage Container Manager (SCM)

Run these commands on the SCM host(s).

*   **Start:**
    ```bash
    ozone --daemon start scm
    ```
*   **Stop:**
    ```bash
    ozone --daemon stop scm
    ```

### Ozone Manager (OM)

Run these commands on the OM host(s).

*   **Start:**
    ```bash
    ozone --daemon start om
    ```
*   **Stop:**
    ```bash
    ozone --daemon stop om
    ```

### Datanode

Run these commands on all Datanode hosts.

*   **Start:**
    ```bash
    ozone --daemon start datanode
    ```
*   **Stop:**
    ```bash
    ozone --daemon stop datanode
    ```

### Recon

Run these commands on the Recon host.

*   **Start:**
    ```bash
    ozone --daemon start recon
    ```
*   **Stop:**
    ```bash
    ozone --daemon stop recon
    ```

### S3 Gateway (S3G)

Run these commands on the S3 Gateway host(s).

*   **Start:**
    ```bash
    ozone --daemon start s3g
    ```
*   **Stop:**
    ```bash
    ozone --daemon stop s3g
    ```

## Checking Service Status

While the `ozone --daemon` command doesn't have a `status` option, you can check if the service processes are running using standard Linux/Unix tools like `ps` or `jps`.

Example using `jps`:

```bash
jps -lm | grep -i ozone
# Look for processes like:
# ... OzoneManager
# ... StorageContainerManager
# ... HddsDatanodeService
# ... ReconServer
# ... OzoneS3Gateway
```

Alternatively, check the service logs (usually in the configured Ozone log directory) or the respective Web UIs for status information.
