# Hadoop DistCp

The Hadoop DistCP is a command line MapReduce-based tool for bulk data copying.

The `hadoop distcp` command can be used to copy data to/from Ozone and any Hadoop compatible file systems. For example, HDFS or S3A.

## Basic usage

To copy files from a source Ozone cluster directory to a destination Ozone cluster directory:

```bash
  hadoop distcp ofs://ozone1/vol1/bucket/dir1 ofs://ozone2/vol2/bucket2/dir2
```

> You must have both `ozone1` and `ozone2` cluster service ID defined in `ozone-site.xml` configuration file.

## Copy between Ozone and HDFS

DistCp performs file checksum check to ensure file integrity. Because the default checksum type of HDFS (CRC32C) and Ozone (CRC32) are different, file checksum check will fail the distcp job. To prevent job failures, specify checksum options in the distcp command to force Ozone use the same checksum type as HDFS. For example:

```bash
hadoop distcp \
  -Ddfs.checksum.combine.mode=COMPOSITE_CRC \
  -Dozone.client.checksum.type=CRC32C \
  hdfs://ns1/tmp ofs://ozone1/vol1/bucket1/dst
```

> The parameter `-Ddfs.checksum.combine.mode=COMPOSITE_CRC` is not required if the HDFS cluster is on Hadoop 3.1.1 or above.

Alternatively, skip file checksum check:

```bash
hadoop distcp \
  -skipcrccheck \
  hdfs://ns1/tmp ofs://ozone1/vol1/bucket1/dst
```

## Encrypted data

When data is in HDFS encryption zone or Ozone encrypted buckets, the file checksum will not match since the underlying block data is different because a new EDEK will be used to encrypt at destination. In this case, specify the -skipcrccheck parameter to avoid job failures.

For more information using Hadoop DistCP, consult [DistCp Guide](https://hadoop.apache.org/docs/current/hadoop-distcp/DistCp.html).
