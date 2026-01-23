# Ozone Admin

`ozone admin` command is a collection of tools intended to be used only by admins.

A quick overview of the available functionalities:

- `ozone admin safemode`  
  Check the safe mode status and force entering or leaving safe mode.  
  The `--verbose` option prints the validation status of all rules that evaluate safe mode status.

- `ozone admin container`  
  Containers are the unit of replication.  
  Subcommands help debug the current container state (list / get / create / …).

- `ozone admin pipeline`  
  Helps check available pipelines (Datanodes sets).

- `ozone admin datanode`  
  Provides information about Datanodes.

- `ozone admin printTopology`  
  Displays rack-awareness related information.

- `ozone admin replicationmanager`  
  Checks replication status and can start or stop replication in emergencies.

- `ozone admin om`  
  Ozone Manager HA related tools to retrieve cluster information.

For more detailed usage, see the output of `--help`.

```bash
$ ozone admin --help

Usage: ozone admin [-hV] [--verbose] [-conf=<configurationPath>]
                   [-D=<String=String>]... [COMMAND]

Developer tools for Ozone Admin operations

Options:
  -conf=<configurationPath>
  -D, --set=<String=String>
  -h, --help      Show this help message and exit.
  -V, --version   Print version information and exit.
      --verbose   More verbose output. Show the stack trace of the errors.

Commands:
  containerbalancer   ContainerBalancer specific operations
  replicationmanager  ReplicationManager specific operations
  safemode            Safe mode specific operations
  printTopology       Print a tree of the network topology as reported by SCM
  cert                Certificate related operations
  container           Container specific operations
  datanode            Datanode specific operations
  pipeline            Pipeline specific operations
  namespace           Namespace Summary specific admin operations
  om                  Ozone Manager specific admin operations
  reconfig            Dynamically reconfigure server without restarting it
  scm                 Ozone Storage Container Manager specific admin operations
```
