# Apache Oozie Integration

[Apache Oozie](https://oozie.apache.org/) is a workflow scheduler system designed to manage Apache Hadoop jobs. Oozie workflows are defined as Directed Acyclical Graphs (DAGs) of actions. Although the Apache Oozie project has been retired and moved to the Apache Attic, it remains in use in some environments.

Ozone can be used as a storage backend for Oozie workflows, allowing you to leverage Ozone's scalable object storage capabilities for your job inputs, outputs, and dependencies. This integration primarily relies on Ozone's Hadoop-compatible filesystem interfaces (`ofs://`or`o3fs://`).

## Prerequisites

Before running Oozie workflows that interact with Ozone, ensure the following prerequisites are met:

1. **Ozone Cluster:** A running Ozone cluster accessible from the Oozie server and Hadoop cluster nodes.
2. **Ozone Client Jars:** The necessary Ozone filesystem client JARs must be available in the classpath for Oozie and the Hadoop services it interacts with (like YARN NodeManagers, MapReduce tasks, Spark executors, etc.).
3. **Ozone Bucket & Volume:** Create the necessary Ozone volumes and buckets where Oozie workflow data and the ShareLib will reside.

    ```bash
    ozone sh volume create /vol1
    ozone sh bucket create /vol1/bucket1
    ```

4. **Permissions:** Ensure the user running the Oozie jobs has the required read/write permissions on the Ozone volumes and buckets being accessed. Configure Ozone ACLs or use Ranger for centralized authorization.
5. **Oozie ShareLib on Ozone:** The Oozie ShareLib, which contains common action dependencies, needs to be uploaded to Ozone if Ozone is the default filesystem or if you want to isolate dependencies. You might need to configure the `oozie.service.WorkflowAppService.system.libpath`property in`oozie-site.xml`to point to the ShareLib location on Ozone (e.g.,`ofs://om/vol1/share/lib`).

## Configuring Workflows

To configure your Oozie workflows to use Ozone storage:

1. **Specify Ozone Paths:** In your `workflow.xml` file, use Ozone paths (`ofs://<om-host>:<port>/<volume>/<bucket>/path`or`o3fs://<bucket>.<volume>.<om-host>:<port>/path`) wherever HDFS paths are typically used. This applies to input/output directories for various actions (MapReduce, Spark, Hive, etc.) and filesystem operations within the workflow.
2. **Job Properties:** In your `job.properties` file, reference Ozone paths as needed. For example, the application path itself can reside on Ozone:

    ```properties
    nameNode=ofs://om-host:9862
    jobTracker=yarn-rm-host:8050
    queueName=default
    oozie.wf.application.path=${nameNode}/vol1/apps/my-oozie-app
    ```

## Example: Filesystem Action

Here's a snippet of an Oozie workflow `workflow.xml` demonstrating a filesystem action (`fs`) moving a file within Ozone:

```xml
<workflow-app xmlns="uri:oozie:workflow:0.5" name="ozone-fs-example">
    <start to="move-data"/>

    <action name="move-data">
        <fs>
            <move source='ofs://om:9862/input-vol/data-bucket/input.txt' target='ofs://om:9862/output-vol/processed-bucket/output.txt'/>
        </fs>
        <ok to="end"/>
        <error to="fail"/>
    </action>

    <kill name="fail">
        <message>Fs action failed, error message[${wf:errorMessage(wf:lastErrorNode())}]</message>
    </kill>
    <end name="end"/>
</workflow-app>
```

In this example, the `<move>`operation works directly on paths within Ozone volumes and buckets specified using the`ofs://` scheme. Similar principles apply when configuring other actions like Hive, Spark, or MapReduce to read inputs from or write outputs to Ozone. Refer to the specific action documentation within Oozie for details on path configuration.
