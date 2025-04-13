---
sidebar_label: Kubernetes
---

# Deploy Ozone on Kubernetes

Apache Ozone can be easily deployed on a Kubernetes cluster using the official [Helm](https://helm.sh) chart or by applying raw Kubernetes manifests. Helm is the recommended approach for most users as it simplifies installation and configuration management.

## Using Helm (Recommended)

This is the quickest way to get an Ozone cluster running on Kubernetes.

### Prerequisites

*   A running Kubernetes cluster (v1.29+ recommended).
*   [Helm v3](https://helm.sh/docs/intro/install/) installed on your client machine.
*   `kubectl` configured to interact with your cluster.

### Installation Steps

1.  **Add the Apache Ozone Helm repository:**
    ```bash
    helm repo add ozone https://apache.github.io/ozone-helm-charts/
    helm repo update
    ```

2.  **Install the Ozone chart:**
    This command installs Ozone with the release name `ozone` into the default namespace using default configuration values.
    ```bash
    helm install ozone ozone/ozone
    ```
    Wait for all the pods (SCM, OM, Datanodes, S3 Gateway, Recon) to become ready. You can monitor the status using:
    ```bash
    kubectl get pods -w
    ```

### Configuration

The default installation creates a basic Ozone cluster. You can customize the deployment by overriding values in the `values.yaml` file.

*   **View default values:**
    ```bash
    helm show values ozone/ozone
    ```
*   **Customize installation:** Create a custom `my-values.yaml` file with your overrides and install using:
    ```bash
    helm install ozone ozone/ozone -f my-values.yaml
    ```

*   **Persistence:** By default, the Helm chart does *not* enable persistence, meaning all data will be lost if pods are restarted. For storing actual data, enable persistence in your `my-values.yaml`:
    ```yaml
    # Example: my-values.yaml
    datanode:
      persistence:
        enabled: true
        # Optional: specify storage class, size, accessModes
        # size: 50Gi
        # storageClassName: my-storage-class
    om:
      persistence:
        enabled: true
        # size: 10Gi
    scm:
      persistence:
        enabled: true
        # size: 10Gi
    # Persistence might also be needed for Recon if you use it actively.
    ```
    Ensure your Kubernetes cluster has a default StorageClass or specify one that supports `ReadWriteOnce` access mode for the components requiring persistence.

### Accessing Ozone Services

Once installed, you can access Ozone services. Typically, services are exposed within the cluster using `ClusterIP`. To access them externally, you might use `kubectl port-forward` or configure Ingress.

*   **Example: Accessing S3 Gateway:**
    ```bash
    # Find the S3 Gateway service name (e.g., ozone-s3g)
    kubectl get svc

    # Forward a local port (e.g., 9878) to the S3 Gateway port
    kubectl port-forward service/ozone-s3g 9878:9878
    ```
    You can now access the S3 Gateway at `http://localhost:9878`.

### Uninstalling

To remove the Ozone deployment installed via Helm:
```bash
helm uninstall ozone
```
This will delete all Kubernetes resources associated with the release. If you enabled persistence, the PersistentVolumeClaims (PVCs) might need manual deletion depending on the reclaim policy.

## Using Raw Manifests

For advanced users or specific customization needs, Ozone provides example Kubernetes manifests. These are located within the Ozone source distribution under the `hadoop-ozone/dist/src/main/k8s/examples/` directory (or the corresponding path in the `source` directory if you checked out the code).

The `getting-started` example provides basic manifests for deploying Ozone components (OM, SCM, Datanodes, etc.) as StatefulSets and Services. You can apply these using `kubectl apply -f <directory>`.

```bash
# Example using kubectl and kustomize (if available)
# Navigate to the examples directory
cd hadoop-ozone/dist/src/main/k8s/examples/getting-started

# Apply the manifests
kubectl apply -k .
```

This method requires more manual configuration and management compared to using the Helm chart.

*(Refer to the [Administrator Guide > Installation](../administrator-guide/installation/kubernetes.md) for more advanced Kubernetes deployment topics like High Availability, security, and detailed configuration.)*
