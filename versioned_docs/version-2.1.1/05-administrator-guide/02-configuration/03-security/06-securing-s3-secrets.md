---
sidebar_label: Securing S3 Secrets
---

# External S3 Secret Storage with HashiCorp Vault

By default, S3 secrets are stored in the Ozone Manager’s RocksDB. For enhanced security, Ozone can be configured to use HashiCorp Vault as an external secret storage backend.

## Configuration

To enable Vault integration, you need to configure the following properties in `ozone-site.xml`:

| Property                                                  | Description                                                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `ozone.secret.s3.store.provider`                          | The S3 secret storage provider to use. Set this to `org.apache.hadoop.ozone.s3.remote.vault.VaultS3SecretStorageProvider` to enable Vault. |
| `ozone.secret.s3.store.remote.vault.address`              | The address of the Vault server (e.g., `http://vault:8200`).                                                                               |
| `ozone.secret.s3.store.remote.vault.namespace`            | The Vault namespace to use.                                                                                                                |
| `ozone.secret.s3.store.remote.vault.enginever`            | The version of the Vault secrets engine (e.g., `2`).                                                                                       |
| `ozone.secret.s3.store.remote.vault.secretpath`           | The path where the secrets are stored in Vault.                                                                                            |
| `ozone.secret.s3.store.remote.vault.auth`                 | The authentication method to use with Vault. Supported values are `TOKEN` and `APPROLE`.                                                   |
| `ozone.secret.s3.store.remote.vault.auth.token`           | The Vault authentication token. Required if `ozone.secret.s3.store.remote.vault.auth` is set to `TOKEN`.                                   |
| `ozone.secret.s3.store.remote.vault.auth.approle.id`      | The AppRole RoleID. Required if `ozone.secret.s3.store.remote.vault.auth` is set to `APPROLE`.                                             |
| `ozone.secret.s3.store.remote.vault.auth.approle.secret`  | The AppRole SecretID. Required if `ozone.secret.s3.store.remote.vault.auth` is set to `APPROLE`.                                           |
| `ozone.secret.s3.store.remote.vault.auth.approle.path`    | The AppRole path. Required if `ozone.secret.s3.store.remote.vault.auth` is set to `APPROLE`.                                               |
| `ozone.secret.s3.store.remote.vault.trust.store.type`     | The type of the trust store (e.g., `JKS`).                                                                                                 |
| `ozone.secret.s3.store.remote.vault.trust.store.path`     | The path to the trust store file.                                                                                                          |
| `ozone.secret.s3.store.remote.vault.trust.store.password` | The password for the trust store.                                                                                                          |
| `ozone.secret.s3.store.remote.vault.key.store.type`       | The type of the key store (e.g., `JKS`).                                                                                                   |
| `ozone.secret.s3.store.remote.vault.key.store.path`       | The path to the key store file.                                                                                                            |
| `ozone.secret.s3.store.remote.vault.key.store.password`   | The password for the key store.                                                                                                            |

## Example

Here is an example of how to configure Ozone to use Vault for S3 secret storage with token authentication:

```xml
<property>
  <name>ozone.secret.s3.store.provider</name>
  <value>org.apache.hadoop.ozone.s3.remote.vault.VaultS3SecretStorageProvider</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.address</name>
  <value>http://localhost:8200</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.enginever</name>
  <value>2</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.secretpath</name>
  <value>secret</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.auth</name>
  <value>TOKEN</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.auth.token</name>
  <value>your-vault-token</value>
</property>
```

## Example with SSL

Here is an example of how to configure Ozone to use Vault for S3 secret storage with SSL:

```xml
<property>
  <name>ozone.secret.s3.store.provider</name>
  <value>org.apache.hadoop.ozone.s3.remote.vault.VaultS3SecretStorageProvider</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.address</name>
  <value>https://localhost:8200</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.enginever</name>
  <value>2</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.secretpath</name>
  <value>secret</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.auth</name>
  <value>TOKEN</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.auth.token</name>
  <value>your-vault-token</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.trust.store.path</name>
  <value>/path/to/truststore.jks</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.trust.store.password</name>
  <value>truststore-password</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.key.store.path</name>
  <value>/path/to/keystore.jks</value>
</property>
<property>
  <name>ozone.secret.s3.store.remote.vault.key.store.password</name>
  <value>keystore-password</value>
</property>
```

## References

- [HashiCorp Vault Documentation](https://developer.hashicorp.com/vault/docs)
