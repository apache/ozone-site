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

## To verify Apache Ozone releases using GPG:

1.  Download the release ozone-X.Y.Z-src.tar.gz from a [mirror
    site](https://dlcdn.apache.org/ozone).
2.  Download the signature file ozone-X.Y.Z-src.tar.gz.asc from
    [Apache](https://downloads.apache.org/ozone/).
3.  Download the Ozone [KEYS](https://downloads.apache.org/ozone/KEYS)
    file.
4.  `gpg --import KEYS`
5.  `gpg --verify ozone-X.Y.Z-src.tar.gz.asc ozone-X.Y.Z-src.tar.gz`

## To perform a quick check using SHA-512:

1.  Download the release ozone-X.Y.Z-src.tar.gz from a [mirror
    site](https://dlcdn.apache.org/ozone).
2.  Download the checksum ozone-X.Y.Z-src.tar.gz.sha512 from
    [Apache](https://downloads.apache.org/ozone/).
3.  `sha512sum -c ozone-X.Y.Z-src.tar.gz`

Note: Before 1.1.0 release Ozone was part of the Apache Hadoop project. Older release artifacts can be found [there](https://archive.apache.org/dist/hadoop/ozone/).

## License

_The software licensed under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)_
