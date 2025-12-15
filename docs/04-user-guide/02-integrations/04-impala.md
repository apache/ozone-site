# Impala

Apache Impala can query data stored in Apache Ozone, serving as a scalable alternative to HDFS. This integration allows users to leverage Impala's high-performance SQL query engine directly on data stored in Ozone.

## Version Compatibility

This integration requires:

- Apache Ozone 1.4.0 or later
- Apache Impala 4.2.0 or later

Always check release notes for both projects to ensure compatibility between specific versions.

## Configuration

To enable Impala to access data in Ozone, you need to configure Impala to recognize the Ozone filesystem.

1. **Configure `core-site.xml`for Impala:** Ensure the`core-site.xml` used by Impala includes the necessary Ozone filesystem configurations. Primarily, set the default filesystem (`fs.defaultFS`) to your Ozone cluster's `ofs` address if you want Ozone to be the primary storage.
    - **`ofs`(Ozone File System):** Recommended for all Impala operations. Example:`ofs://<ozone_manager_host>:9862`
    - **`s3a`(S3 Compatible):** For S3 compatible access. Example:`s3a://<bucket>.<aws-region>.amazonaws.com`

    ```xml
    <configuration>
      <property>
        <name>fs.defaultFS</name>
        <value>ofs://om-host.example.com:9862</value>
      </property>

      <!-- Add other Ozone client configurations as needed -->
      <property>
         <name>ozone.om.address</name>
         <value>om-host.example.com:9861</value>
      </property>
    </configuration>
    ```

    Make sure the Ozone client JARs are available in Impala's classpath.

2. **Security (Kerberos):** If your Ozone and Impala clusters are secured with Kerberos, ensure proper configuration for authentication. Impala daemons will need appropriate Kerberos principals and keytabs to access Ozone securely. Refer to Ozone and Impala security documentation for detailed setup.

## Usage

Once configured, you can create Impala tables that reside on Ozone.

- **Default Filesystem:** If `fs.defaultFS`is set to Ozone, you can create tables without specifying a`LOCATION`, and Impala will store the data in Ozone under the default warehouse directory.

    ```sql
    -- Creates table 't1' in the default Ozone location
    CREATE TABLE t1 (
        id INT,
        name STRING,
        event_date DATE
    )
    PARTITIONED BY (event_date)
    STORED AS PARQUET;

    -- Creates database 'mydatabase' in the default Ozone location
    CREATE DATABASE mydatabase;
    USE mydatabase;
    CREATE TABLE t2 (col1 INT, col2 STRING) STORED AS PARQUET;
    ```

- **Specific Location:** You can explicitly specify an Ozone path in the `LOCATION`clause using the`ofs://` prefix.

    ```sql
    -- Creates table 't3' in a specific Ozone bucket and volume
    CREATE EXTERNAL TABLE t3 (
        user_id BIGINT,
        url STRING
    )
    STORED AS PARQUET
    LOCATION 'ofs://om-host.example.com:9862/volume1/bucket1/path/to/table3';

    -- Creates database 'anotherdb' in a specific Ozone location
    CREATE DATABASE anotherdb
    LOCATION 'ofs://om-host.example.com:9862/volume1/bucket1/databases/anotherdb.db';
    ```

- **Querying Data:** Query data stored in Ozone using standard Impala SQL.

    ```sql
    SELECT name FROM t1 WHERE id > 100;
    INSERT INTO t2 VALUES (1, 'apple'), (2, 'banana');
    ```

## Advanced Features

### Storage Layout Support

Impala works with both Ozone storage layouts:

- **RATIS Replication**: The default replication mechanism
- **Erasure Coding**: Provides efficient storage with reduced overhead

Specify the desired storage layout at the bucket level when creating your Ozone buckets.

### Table Types

Both managed and external tables are fully supported:

- **Managed tables**: When dropped, Impala deletes the underlying data in Ozone
- **External tables**: When dropped, only the table metadata is removed while data remains intact in Ozone

## Performance Considerations

- **Block Size**: Ozone uses a global block size configuration. For optimal Impala query performance, consider setting appropriate block sizes in your Ozone configuration.
- **Data Locality**: Unlike HDFS, Ozone doesn't automatically provide data locality to Impala. Consider co-locating Impala daemons with Ozone Datanodes when possible.
- **Cache Settings**: For frequently accessed data, adjust Impala's memory settings to optimize query performance with Ozone storage.

## Limitations and Considerations

- **Protocol Support:** `ofs`is the recommended protocol for Impala with Ozone. The`o3fs` protocol is not fully supported for Impala operations.
- **`PARQUET_FILE_SIZE`:** The `PARQUET_FILE_SIZE` query option, used to control the size of Parquet files written by Impala, is ineffective when writing to Ozone.
- **Spill-to-Disk:** Impala's spill-to-disk mechanism (used when queries exceed memory limits) can be configured to use an Ozone path by specifying a full Ozone URI (e.g., `ofs://om-host.example.com:9862/volume1/bucket1/tmp/impala-spill`) in the Impala configuration for spill directories.

## Troubleshooting

### Common Issues

1. **Connectivity Problems**:
   - Verify network connectivity between Impala daemons and Ozone Manager
   - Check `core-site.xml` configuration for correct hostnames and ports

2. **Authentication Failures**:
   - Ensure Kerberos principals and keytabs are correctly configured
   - Verify that the security settings are consistent between Impala and Ozone

3. **Performance Issues**:
   - Monitor query execution times and compare with HDFS performance
   - Check Ozone metrics for potential bottlenecks in data access

4. **File Not Found Errors**:
   - Verify that the Ozone volumes and buckets exist and are accessible
   - Check permissions for the Impala service account on Ozone resources
