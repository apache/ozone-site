# Downloads

Apache Ozone releases are available for download from the Apache Software Foundation's distribution system. The current and archived releases are available at the locations listed below.

## Supported Releases

| Version | Release Date | Source Download | Binary Download | Release Notes |
|-|-|-|-|-|
| 1.4.1 | 2023 Jun 15 | [Source](https://www.apache.org/dyn/closer.cgi/ozone/1.4.1/ozone-1.4.1-src.tar.gz)<br/>[Checksum](https://downloads.apache.org/ozone/1.4.1/ozone-1.4.1-src.tar.gz.sha512)<br/>[Signature](https://downloads.apache.org/ozone/1.4.1/ozone-1.4.1-src.tar.gz.asc) | [Binary](https://www.apache.org/dyn/closer.cgi/ozone/1.4.1/ozone-1.4.1.tar.gz)<br/>[Checksum](https://downloads.apache.org/ozone/1.4.1/ozone-1.4.1.tar.gz.sha512)<br/>[Signature](https://downloads.apache.org/ozone/1.4.1/ozone-1.4.1.tar.gz.asc) | [Release Notes](/release-notes/1.4.1) |

## Archived Releases

Older releases are available in the Apache archives. Please note that these versions are no longer supported:

- **Version 1.3.0**: [Release Notes](/release-notes/1.3.0) | [Archive Link](https://archive.apache.org/dist/ozone/1.3.0/)
- **Version 1.2.1**: [Release Notes](/release-notes/1.2.1) | [Archive Link](https://archive.apache.org/dist/ozone/1.2.1/)
- **Version 1.1.0**: [Release Notes](/release-notes/1.1.0) | [Archive Link](https://archive.apache.org/dist/ozone/1.1.0/)

All releases starting with 1.1.0, when Apache Ozone became a top-level project, are available in the [Ozone archives](https://archive.apache.org/dist/ozone/).

Releases before 1.1.0 can be found in the [Apache Hadoop archives](https://archive.apache.org/dist/hadoop/ozone/).

## Download

1. Download the release `ozone-${OZONE_VERSION}-src.tar.gz` from a [mirror site](https://www.apache.org/dyn/closer.cgi/ozone).
2. Download signature or checksum from [Apache](https://downloads.apache.org/ozone/).

## Verify

### GnuPG Signature

Download Ozone developers' public [KEYS](https://downloads.apache.org/ozone/KEYS).

```bash
gpg --import KEYS
gpg --verify ozone-${OZONE_VERSION}-src.tar.gz.asc ozone-${OZONE_VERSION}-src.tar.gz
```

### SHA-512 Checksum

```bash
sha512sum -c ozone-${OZONE_VERSION}-src.tar.gz.sha512
```

## License

*The software is licensed under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)*
