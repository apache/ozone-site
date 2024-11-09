---
title: "Apache Ozone Releases"
layout: downloads
type: custompage
---
<!---
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. See accompanying LICENSE file.
-->

## Download

1.  Download the release `ozone-${OZONE_VERSION}-src.tar.gz` from a [mirror
    site](https://www.apache.org/dyn/closer.cgi/ozone).
2.  Download signature or checksum from
    [Apache](https://downloads.apache.org/ozone/).

## Verify

### GnuPG signature

Download Ozone developers' public [KEYS](https://downloads.apache.org/ozone/KEYS).

```
gpg --import KEYS
gpg --verify ozone-${OZONE_VERSION}-src.tar.gz.asc ozone-${OZONE_VERSION}-src.tar.gz
```

## SHA-512 checksum

```
sha512sum -c ozone-${OZONE_VERSION}-src.tar.gz
```

## Archives

Releases starting with 1.1.0, when Apache Ozone became a top-level project, are available in the [Ozone archives](https://archive.apache.org/dist/ozone/).

Releases before that can be found in [Apache Hadoop archives](https://archive.apache.org/dist/hadoop/ozone/).

## License

_The software licensed under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)_
