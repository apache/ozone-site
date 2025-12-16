---
sidebar_label: Java Client API
---

# Ozone Java Client API

Apache Ozone provides a native Java client API that allows developers to interact with the Ozone cluster programmatically. This API offers the most comprehensive and efficient way to integrate Ozone into Java-based applications.

## Overview

The Ozone Java client library (`ozone-filesystem-hadoop3` or `ozone-filesystem-hadoop2`) allows applications to perform various operations, including:

- **Volume Operations:** Create, delete, list, and manage volumes.
- **Bucket Operations:** Create, delete, list, and manage buckets, including setting properties like versioning and replication factor.
- **Key Operations:** Write (put), read (get), delete, list, and manage metadata for keys (objects) within buckets.
- **Multipart Upload:** Efficiently upload large objects in parts.
- **File System Semantics:** Interact with Ozone's hierarchical namespace using familiar file system concepts like directories and files, especially when using File System Optimized (FSO) buckets.

## Key Concepts & Classes

- **`OzoneClientFactory`:** Used to create instances of `OzoneClient`. Requires configuration details like the OM service ID or host/port.
- **`OzoneClient`:** The main entry point for interacting with Ozone. Provides methods for volume and bucket operations.
- **`OzoneVolume`:** Represents a volume in Ozone. Obtained via `OzoneClient`.
- **`OzoneBucket`:** Represents a bucket within a volume. Obtained via `OzoneVolume`.
- **`OzoneKey`:** Represents a key (object) within a bucket.
- **`OzoneOutputStream`/`OzoneInputStream`:** Standard Java output/input streams for writing/reading key data.
- **`OzoneMultipartUpload`:** Classes for managing multipart uploads (`OzoneMultipartUploadPartList`, `OzoneMultipartUpload`).

## Maven Dependency

To use the Ozone Java client, add the following dependency to your `pom.xml` (adjust version as needed):

```xml
<dependency>
  <groupId>org.apache.hadoop</groupId>
  <artifactId>ozone-filesystem-hadoop3</artifactId>
  <version>${ozone.version}</version> <!-- Replace with your Ozone version -->
</dependency>
```

Ensure you also include necessary dependencies for Hadoop common and potentially Kerberos if using a secure cluster.

## Example Usage (Simplified)

```java
import org.apache.hadoop.hdds.conf.OzoneConfiguration;
import org.apache.hadoop.ozone.client.OzoneClient;
import org.apache.hadoop.ozone.client.OzoneVolume;
import org.apache.hadoop.ozone.client.OzoneBucket;
import org.apache.hadoop.ozone.client.OzoneKeyDetails;
import org.apache.hadoop.ozone.client.io.OzoneOutputStream;
import org.apache.hadoop.ozone.client.io.OzoneInputStream;
import org.apache.hadoop.ozone.om.client.OzoneClientFactory;

// Assume configuration is loaded or set appropriately
OzoneConfiguration conf = new OzoneConfiguration();
// Set OM service ID or OM host/port if needed
// conf.set("ozone.om.service.ids", "ozonecluster");
// conf.set("ozone.om.address", "om.example.com:9862"); // For non-HA

try (OzoneClient ozoneClient = OzoneClientFactory.getRpcClient(conf)) {

    // Get Volume and Bucket
    OzoneVolume volume = ozoneClient.getObjectStore().getVolume("vol1");
    OzoneBucket bucket = volume.getBucket("bucket1");

    // Write Data (Simple Put)
    String keyName = "myKey";
    String content = "This is the content of the key.";
    try (OzoneOutputStream outputStream = bucket.createKey(keyName, content.getBytes().length)) {
        outputStream.write(content.getBytes());
    }

    // Read Data
    try (OzoneInputStream inputStream = bucket.getKey(keyName)) {
        byte[] buffer = new byte[content.getBytes().length];
        int bytesRead = inputStream.read(buffer);
        String readContent = new String(buffer, 0, bytesRead);
        System.out.println("Read content: " + readContent);
    }

    // List Keys
    bucket.listKeys("").forEachRemaining(key -> {
        System.out.println("Key: " + key.getName() + ", Size: " + key.getDataSize());
    });

    // Delete Key
    // bucket.deleteKey(keyName);

} catch (IOException e) {
    e.printStackTrace();
}
```

**Note:** This is a simplified example. Error handling, resource management (closing streams), and more advanced features like multipart upload require more detailed code.

## When to Use

The Java client API is the recommended choice for:

- **Performance-critical applications:** Offers the most efficient way to interact with Ozone.
- **Complex interactions:** Provides full access to Ozone's features and configurations.
- **Integration with Java-based frameworks:** Seamless integration with applications built on the JVM.
- **Fine-grained control:** Allows precise management of object creation, versioning, and metadata.

For simple scripting or basic file operations, the command-line interface  might be sufficient. For integration with non-Java applications or S3-compatible tools, the S3 Gateway (`s3a`or`s3://`) is the appropriate choice.
