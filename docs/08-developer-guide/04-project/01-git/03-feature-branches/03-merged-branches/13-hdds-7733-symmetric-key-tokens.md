# HDDS-7733: Symmetric Key Tokens

In secure mode, Ozone issues tokens to authorize each block (and container) access. Each token is signed by Ozone (OM or SCM) using its RSA private keys and verified by Datanodes using a public key and certificate. With the RSA private key size of 2048, the sign operation is very costly and contributes more than 80% to the latency of read/write operations in Ozone Manager.

This feature branch contains the implementation to replace RSA token signing with symmetric keys and thus greatly boosts OM performance.

Epic Jira:  [HDDS-7733](https://issues.apache.org/jira/browse/HDDS-7733)

## 1. builds/intermittent test failures

The feature branch has introduced no additional flaky tests.

## 2. documentation

The documentation for this change is added by  [HDDS-8631](https://issues.apache.org/jira/browse/HDDS-8631) .

## 3. design, attached the docs

Design document can be found [here](https://issues.apache.org/jira/secure/attachment/13055974/Symmetric%20Key%20For%20Ozone%20Token%20Signatures-1.pdf) (can be found in the epic Jira).

## 4. S3 compatibility

This feature branch doesn't break any S3 feature.

## 5. Docker-compose / acceptance tests

Block/container tokens are already tested well by the existing acceptance tests.

## 6. support of containers / Kubernetes

No addition yet.

## 7. coverage/code quality

**[Master](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=master) and [HDDS-7733-Symmetric-Tokens](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=HDDS-7733-Symmetric-Tokens)**

## 8. build time

No significant change

- current master: **[1h 43m 9s](https://github.com/apache/ozone/actions/runs/4996624349)**
- last merged commit on branch: **[1h 40m 17s](https://github.com/apache/ozone/actions/runs/4963516058)**

## 9. possible incompatible changes/used feature flag

There is no incompatible change introduced with this feature.

## 10. third party dependencies/licence changes

No new dependency is added.

## 11. performance

Performance improvements are documented by  [HDDS-8574](https://issues.apache.org/jira/browse/HDDS-8574)

## 12. security considerations

- This feature branch adds a couple of new APIs to allow OM and Datanode to access secret keys in OM. Those APIs are protected over Hadoop RPC secure line, with Privacy enabled. Also, the APIs are authorized to only allow Datanode and OM to access, ref: [HDDS-8164](https://issues.apache.org/jira/browse/HDDS-8164) .
