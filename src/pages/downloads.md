# Downloads

| Version | Release Date | Source Download                                                                                                                                                                                                                                                | Binary Download                                                                                                                                                                                                                                    | Release Notes                         |
| ------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 2.1.0   | 2025 Dec 31  | [Source](https://www.apache.org/dyn/closer.cgi/ozone/2.1.0/ozone-2.1.0-src.tar.gz)<br/>[Checksum](https://downloads.apache.org/ozone/2.1.0/ozone-2.1.0-src.tar.gz.sha512)<br/>[Signature](https://downloads.apache.org/ozone/2.1.0/ozone-2.1.0-src.tar.gz.asc) | [Binary](https://www.apache.org/dyn/closer.cgi/ozone/2.1.0/ozone-2.1.0.tar.gz)<br/>[Checksum](https://downloads.apache.org/ozone/2.1.0/ozone-2.1.0.tar.gz.sha512)<br/>[Signature](https://downloads.apache.org/ozone/2.1.0/ozone-2.1.0.tar.gz.asc) | [Release Notes](/release/2.1.0) |
| 2.0.0   | 2025 Apr 30  | [Source](https://www.apache.org/dyn/closer.cgi/ozone/2.0.0/ozone-2.0.0-src.tar.gz)<br/>[Checksum](https://downloads.apache.org/ozone/2.0.0/ozone-2.0.0-src.tar.gz.sha512)<br/>[Signature](https://downloads.apache.org/ozone/2.0.0/ozone-2.0.0-src.tar.gz.asc) | [Binary](https://www.apache.org/dyn/closer.cgi/ozone/2.0.0/ozone-2.0.0.tar.gz)<br/>[Checksum](https://downloads.apache.org/ozone/2.0.0/ozone-2.0.0.tar.gz.sha512)<br/>[Signature](https://downloads.apache.org/ozone/2.0.0/ozone-2.0.0.tar.gz.asc) | [Release Notes](/release/2.0.0) |
| 1.4.1   | 2024 Nov 24  | [Source](https://www.apache.org/dyn/closer.cgi/ozone/1.4.1/ozone-1.4.1-src.tar.gz)<br/>[Checksum](https://downloads.apache.org/ozone/1.4.1/ozone-1.4.1-src.tar.gz.sha512)<br/>[Signature](https://downloads.apache.org/ozone/1.4.1/ozone-1.4.1-src.tar.gz.asc) | [Binary](https://www.apache.org/dyn/closer.cgi/ozone/1.4.1/ozone-1.4.1.tar.gz)<br/>[Checksum](https://downloads.apache.org/ozone/1.4.1/ozone-1.4.1.tar.gz.sha512)<br/>[Signature](https://downloads.apache.org/ozone/1.4.1/ozone-1.4.1.tar.gz.asc) | [Release Notes](/release/1.4.1) |

## Archives

Older releases are available from the [Apache Ozone archive](https://archive.apache.org/dist/ozone/).

## Verify

To verify the integrity of the downloaded files, it is important to check the PGP signatures and SHA512 checksums.

### PGP Signatures

PGP signatures can be verified using GPG or PGP. First, download the `KEYS` file from the Apache Ozone website.

```bash
curl https://downloads.apache.org/ozone/KEYS > KEYS
```

Then, import the keys into your GPG keyring.

```bash
gpg --import KEYS
```

Finally, verify the signature of the release file.

```bash
gpg --verify <file>.asc <file>
```

For example, to verify the signature of `ozone-2.1.0-src.tar.gz`:

```bash
gpg --verify ozone-2.1.0-src.tar.gz.asc ozone-2.1.0-src.tar.gz
```

### SHA512 Checksums

To verify the SHA512 checksum, you can use the `sha512sum` command.

```bash
sha512sum -c <file>.sha512
```

For example, to verify the checksum of `ozone-2.1.0-src.tar.gz`:

```bash
sha512sum -c ozone-2.1.0-src.tar.gz.sha512
```

## License

The Apache Ozone software is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0). See the `LICENSE.txt` file in the root of the distribution for the full license text.
