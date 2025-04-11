---
sidebar_label: Encryption (TDE)
---

# Bucket Encryption (Transparent Data Encryption)

Apache Ozone supports **Transparent Data Encryption (TDE)** at the bucket level, ensuring that all data written to an encrypted bucket is automatically encrypted at rest. This feature relies on an external Key Management Service (KMS) compatible with the Hadoop KeyProvider API.

## Overview

Ozone's TDE follows a standard envelope encryption strategy:

1.  **Key Management Service (KMS):** You must configure Ozone to communicate with a KMS (e.g., Hadoop KMS, Ranger KMS). This KMS manages the primary encryption keys.
2.  **Bucket Encryption Key (BEK):** When creating an encrypted bucket, you associate it with a specific key *already present* in the KMS. This key is known as the Bucket Encryption Key (BEK). You only provide the *name* of the BEK to Ozone.
3.  **Data Encryption Key (DEK):** For each object written to the encrypted bucket, Ozone generates a unique, random Data Encryption Key (DEK).
4.  **Envelope Encryption:**
    *   The object's data is encrypted using its unique DEK.
    *   The DEK itself is then encrypted using the bucket's BEK (retrieved from the KMS). This encrypted DEK (EDEK) is stored alongside the object's metadata.
    *   The plaintext DEK is discarded.
5.  **Decryption:** To read an object, Ozone retrieves the EDEK, sends it to the KMS for decryption (using the BEK), obtains the plaintext DEK, and uses it to decrypt the object's data.

This process is "transparent" because applications writing to or reading from the bucket do not need to manage the encryption/decryption process themselves; Ozone handles it automatically based on the bucket's encryption setting.

## Configuration

To use TDE, the Ozone Manager (OM) must be configured to connect to your KMS. This is typically done in `ozone-site.xml` by specifying the KeyProvider path:

```xml
<property>
  <name>hadoop.security.key.provider.path</name>
  <!-- Example for Hadoop KMS -->
  <value>kms://http@kms-host:16000/kms</value>
  <!-- Example for Ranger KMS -->
  <!-- <value>rangerkms://http@ranger-kms-host:9292/kms</value> -->
  <description>
    The KeyProvider path used by Ozone Manager to connect to the KMS
    for retrieving Bucket Encryption Keys (BEKs).
  </description>
</property>

<!-- Additional KMS client configurations might be needed depending on the provider -->
```

Ensure the Ozone Manager process has the necessary permissions and configuration to communicate with the specified KMS.

## Enabling Encryption on a Bucket

Bucket encryption is enabled at the time of bucket creation by specifying the name of the Bucket Encryption Key (BEK) that exists in the configured KMS.

Using the Ozone shell:

```bash
ozone sh bucket create --encryption-key <bek_name> /volumeName/bucketName
```

Replace `<bek_name>` with the actual name of the key provisioned in your KMS (e.g., `ozone-bek`).

**Example:**

```bash
# Assuming a key named 'ozoneBucketKey1' exists in the configured KMS
ozone sh bucket create --encryption-key ozoneBucketKey1 /vol1/encrypted-bucket
```

Once the bucket is created with an encryption key, all objects subsequently written to `/vol1/encrypted-bucket` will be automatically encrypted by Ozone using the envelope encryption strategy described above. Reads will be transparently decrypted.

**Note:**
*   You cannot enable encryption on an existing bucket after creation.
*   You cannot disable encryption on a bucket once it's enabled.
*   The BEK must exist in the KMS *before* you create the bucket referencing it.