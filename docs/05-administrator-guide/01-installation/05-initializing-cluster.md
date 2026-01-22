---
title: Initializing Cluster
---

After installing the binaries, the next step is to initialize the cluster. This section provides instructions on how to initialize a new Ozone cluster.

## Initialize configurations

Ozone relies on a configuration file called `ozone-site.xml`. To generate a template that you can replace with proper values, please run the following command. This will generate a template called `ozone-site.xml` at the specified path (directory).

```bash
export OZONE_HOME=/path/to/ozone
export PATH=$PATH:$OZONE_HOME/bin
export OZONE_CONF_DIR=$OZONE_HOME/etc/ozone

ozone genconf <path>
```

Let us look at the settings inside the generated file (`ozone-site.xml`) and how they control Ozone. Once the right values are defined, this file needs to be copied to `$OZONE_CONF_DIR`.

- **ozone.metadata.dirs** Allows Administrators to specify where the metadata must reside. Usually you pick your fastest disk (SSD if you have them on your nodes). OzoneManager, SCM and Datanode will write the metadata to this path. This is a required setting, if this is missing Ozone will fail to come up.

    Here is an example,

    ```xml
       <property>
          <name>ozone.metadata.dirs</name>
          <value>/data/disk1/meta</value>
       </property>
    ```

- **ozone.scm.names**  Storage Container Manager (SCM) is a distributed block service which is used by Ozone. This property allows Datanodes to discover SCM's address. Datanodes send heartbeat to SCM. Until HA feature is complete, we configure `ozone.scm.names` to be a single machine.

    Here is an example,

    ```xml
        <property>
          <name>ozone.scm.names</name>
          <value>scm.ozone.apache.org</value>
        </property>
    ```

- **ozone.scm.datanode.id.dir** Datanodes generate a Unique ID called Datanode ID. This identity is written to the file `datanode.id` in a directory specified by this path. *Datanodes will create this path if it doesn't exist already.*

    Here is an  example,

    ```xml
       <property>
          <name>ozone.scm.datanode.id.dir</name>
          <value>/data/disk1/meta/node</value>
       </property>
    ```

- **ozone.om.address** OM server address. This is used by OzoneClient and Ozone File System.

    Here is an  example,

    ```xml
        <property>
           <name>ozone.om.address</name>
           <value>ozonemanager.ozone.apache.org</value>
        </property>
    ```

## Ozone Settings Summary

| Setting                        | Value                        | Comment                                                          |
| ------------------------------ | ---------------------------- | ---------------------------------------------------------------- |
| `ozone.metadata.dirs`            | file path                    | The metadata will be stored here.                                |
| `ozone.scm.names`                | SCM server name              | Hostname:port or IP:port address of SCM.                         |
| `ozone.scm.block.client.address` | SCM server name and port     | Used by services like OM                                         |
| `ozone.scm.client.address`       | SCM server name and port     | Used by client-side                                              |
| `ozone.scm.datanode.address`     | SCM server name and port     | Used by Datanode to talk to SCM                                  |
| `ozone.om.address`               | OM server name               | Used by Ozone handler and Ozone file system.                     |
| `hdds.datanode.dir`              | file path                    | HDDS Datanodes store data in this directory.                     |

## Initialize the cluster

:::info
For simplicity, here we show the steps for non-HA cluster (1 OM, 1 SCM). To configure OM HA or to convert from non-HA to HA, see the [OM HA documentation](/docs/administrator-guide/configuration/high-availability/om-ha). To configure SCM HA or to convert from non-HA to HA, see the [SCM HA documentation](/docs/administrator-guide/configuration/high-availability/scm-ha).
:::

Before we boot up the Ozone cluster, we need to initialize both SCM and Ozone Manager.

```bash
ozone scm --init
```

This allows SCM to create the cluster Identity and initialize its state. The `init` command initializes the metadata directory specified in `$ozone.metadata.dirs`. Init command is executed only once, that allows SCM to create all the required on-disk structures to work correctly.

```bash
ozone --daemon start scm
```

Once we know SCM is up and running, we can create an Object Store for our use. This is done by running the following command.

```bash
ozone om --init
```

Once Ozone Manager is initialized, we are ready to run the name service.

```bash
ozone --daemon start om
```

At this point Ozone's name services, the Ozone Manager, and the block service SCM are both running.

:::info
SCM start will fail if on-disk data structures are missing; If SCM is not running, `om --init` command will fail. So please make sure you have done both `scm --init` and `om --init` commands.
:::

Now we need to start the Datanodes. Please run the following command on each Datanode.

```bash
ozone --daemon start datanode
```

At this point SCM, Ozone Manager and Datanodes are up and running.

***Congratulations!, You have set up a functional Ozone cluster.***
