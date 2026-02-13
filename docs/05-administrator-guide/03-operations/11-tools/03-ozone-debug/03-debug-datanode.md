# Debug Datanode

Debug commands related to Datanode. Currently, only container replica related commands are available.  
Following is the usage and the subcommands available under the `ozone debug datanode container` command:

```bash
Usage: ozone debug datanode container [-hV] [--verbose] [COMMAND]
Container replica specific operations to be executed on datanodes only
  -h, --help      Show this help message and exit.
  -V, --version   Print version information and exit.
      --verbose   More verbose output. Show the stack trace of the errors.
Commands:
  list     Show container info of all container replicas on datanode
  info     Show container info of a container replica on datanode
  export   Export one container to a tarball
  inspect  Check the metadata of all container replicas on this datanode.
```

[Next >>](./debug-replicas)
