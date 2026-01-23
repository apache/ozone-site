# Ratis Log Parser

The Ratis log parser tool takes a segment file as input and gives a human-readable output.
It can be used to parse Ratis logs from different components by specifying the corresponding role.

```bash
Usage: ozone debug ratis parse [-hV] [--verbose] [--role=<role>] -s=<segmentFile>
Shell for printing Ratis Log in understandable text
  -h, --help          Show this help message and exit.
      --role=<role>   Component role for parsing. Values: om, scm, datanode
                        Default: generic
  -s, --segmentPath, --segment-path=<segmentFile>
                      Path of the segment file
  -V, --version       Print version information and exit.
      --verbose       More verbose output. Show the stack trace of the errors.
```

[Next >>](/docs/administrator-guide/operations/Tools/ozone-debug/audit-parser-exact)
