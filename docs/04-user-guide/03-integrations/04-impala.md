# Impala

Starting with version **4.2.0**, Apache Impala provides full support for querying data stored in **Apache Ozone**. To utilize this functionality, ensure that your Ozone version is **1.4.0** or later.

## Supported Access Protocols
Impala supports the following protocols for accessing Ozone data:

* ofs
* s3a

Note: The o3fs protocol is **NOT** supported by Impala.

## Supported Bucket Types
Impala is compatible with Ozone buckets configured with either:

* RATIS (Replication)
* Erasure Coding

## Querying Ozone Data with Impala
**If Ozone is configured as the default file system**, you can run Impala queries seamlessly without modifications, just as if the file system were HDFS. For example:


```
  CREATE TABLE t1 (x INT, s STRING);
```

**If Ozone is not the default file system**, you must specify the Ozone path explicitly using the LOCATION clause. For example:

```
  CREATE DATABASE d1 LOCATION 'ofs://ozone1/vol1/bucket1/d1.db';
```

For additional information, consult the Apache Impala User Documentation [Using Impala with Apache Ozone Storage](https://impala.apache.org/docs/build/html/topics/impala_ozone.html).
