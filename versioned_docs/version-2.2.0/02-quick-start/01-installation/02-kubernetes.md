---
sidebar_label: Kubernetes
---

# Try Ozone With Kubernetes

Ozone is designed to work well under Kubernetes. This document provides a guide for deploying and experimenting with Ozone on K8s, using Helm Chart, MiniKube or a self-hosted Kubernetes cluster.

## Helm Chart

For a streamlined deployment of Apache Ozone on Kubernetes, consider using the [Apache Ozone Helm Chart](https://apache.github.io/ozone-helm-charts/). This Helm Chart simplifies the installation and management of an Ozone cluster by packaging best practices into a set of configurable Kubernetes resources.

1. **Add the Ozone Helm Repository**

   First, add the Apache Ozone Helm repository and update your local Helm repo cache:

   ```bash
   helm repo add ozone-helm https://apache.github.io/ozone-helm-charts/
   helm repo update
   ```

2. Install the Chart

   Install the Ozone Helm Chart using the following command. This command deploys a default Ozone cluster:

   ```bash
   helm install my-ozone-cluster ozone-helm/ozone
   ```

3. Customize Your Deployment

   To customize the configuration, create or modify a values.yaml file with your desired settings and install the chart as follows:

   ```bash
   helm install my-ozone-cluster -f values.yaml ozone-helm/ozone
   ```

For more detailed documentation and advanced configuration options, please refer to the [Apache Ozone Helm Chart](https://apache.github.io/ozone-helm-charts/) documentation.

## Minikube

### Requirements

- Working minikube setup
- kubectl

### Deploy the Services

The `kubernetes/examples` directory of the Ozone distribution contains Kubernetes deployment resource files for multiple use cases. By default the Kubernetes resource files are configured to use the [apache/ozone](https://hub.docker.com/r/apache/ozone) image from Docker Hub.

To deploy it to minikube, use the minikube configuration set:

``` bash
cd kubernetes/examples/minikube
kubectl apply -k .
```

And you can check the results with

``` bash
kubectl get pod
kubectl exec scm-0 -- ozone version
```

:::note

the `kubernetes/examples/minikube` resource set is optimized for minikube usage:

- You can have multiple Datanodes even if you have only one host (in a real production cluster usually you need one Datanode per physical host)
- The services are published with node port

:::

### Access the services

Now you can access any of the services. For each web endpoint an additional NodeType service is defined in the minikube k8s resource set. NodeType services are available via a generated port on any of the host nodes:

``` bash
kubectl get svc
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
datanode     ClusterIP   None            <none>        <none>           27s
kubernetes   ClusterIP   10.96.0.1       <none>        443/TCP          118m
om           ClusterIP   None            <none>        9874/TCP         27s
om-public    NodePort    10.108.48.148   <none>        9874:32649/TCP   27s
s3g          ClusterIP   None            <none>        9878/TCP         27s
s3g-public   NodePort    10.97.133.137   <none>        9878:31880/TCP   27s
scm          ClusterIP   None            <none>        9876/TCP         27s
scm-public   NodePort    10.105.231.28   <none>        9876:32171/TCP   27s
```

Minikube provides a convenience command to access any of the NodePort services:

``` bash
minikube service s3g-public
Opening kubernetes service default/s3g-public in default browser...
```

## Hosted Kubernetes Cluster

**Note:** The Kubernetes examples and scripts here have been tested with Kubernetes 1.34.2 (k3s v1.34.2+k3s1).

### Requirements

- Working Kubernetes cluster (LoadBalancer, PersistentVolume are not required)
- kubectl

### Deploy to Kubernetes

As [apache/ozone](https://hub.docker.com/r/apache/ozone) images are available from Docker Hub, the deployment process is very similar to Minikube deployment. The only big difference is that we have dedicated set of k8s files for hosted clusters (for example we can use one Datanode per host)

To deploy to a hosted cluster, use the Ozone subdirectory:

``` bash
cd kubernetes/examples/ozone
kubectl apply -k .
```

And you can check the results with

``` bash
kubectl get pod
kubectl exec scm-0 -- ozone version
```

### Access the services

Now you can access any of the services. By default the services are not published but you can access them with port-forward rules.

``` bash
kubectl port-forward s3g-0 9878:9878
kubectl port-forward scm-0 9876:9876
```
