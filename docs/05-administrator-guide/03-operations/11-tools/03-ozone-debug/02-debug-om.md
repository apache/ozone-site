# Debug OM

Debug commands related to OM.  
It has the following subcommands:

## generate-compaction-dag

Creates a DAG image of the current compaction log of an OM.db instance. It is downloaded to the specified location.

```bash
Usage: ozone debug om generate-compaction-dag [-hV] [--verbose] --db=<dbPath>
       -o=<imageLocation>
Create an image of the current compaction log DAG. This command is an offline
command. i.e., it can run on any instance of om.db and does not require OM to
be up.
      --db=<dbPath>   Path to OM RocksDB
  -h, --help          Show this help message and exit.
  -o, --output-file=<imageLocation>
                      Path to location at which image will be downloaded.
                        Should include the image file name with ".png"
                        extension.
  -V, --version       Print version information and exit.
      --verbose       More verbose output. Show the stack trace of the errors.
```

## prefix

Parses the contents of a prefix.

```bash
Usage: ozone debug om prefix [--verbose] --bucket=<bucket> --db=<dbPath>
                             --path=<filePath> --volume=<volume>
Parse prefix contents
      --bucket=<bucket>   bucket name
      --db=<dbPath>       Path to OM RocksDB
      --path=<filePath>   prefixFile Path
      --verbose           More verbose output. Show the stack trace of the
                            errors.
      --volume=<volume>   volume name
```

[Next >>](./debug-datanode)
