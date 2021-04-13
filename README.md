<!--
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

# Apache Ozone web page

This is the source code of the website of Apache Ozone.

To render it you need hugo static site generator (https://gohugo.io/getting-started/installing) which is available for the most popular platforms as a single binary.

To check the rendered website use the following command (and check the temporary, rendered version at `./public`):

```
hugo
```

To develop the site use

```
hugo serve
```

which starts an internal server where you can always check the final rendered version.

## Update ozone.apache.org

For modify the content the [Ozone site](https://ozone.apache.org) the rendered version should be committed to the [asf-site](https://github.com/apache/ozone-site/tree/asf-site) branch.

This is handled by a [Github Action](https://github.com/apache/ozone-site/blob/master/.github/workflows/regenerate.yml) which refresh the rendered branch and commit the changes: *It's enough to modify the source files on this branch, no other action is required.* Updating the Hugo source files on this branch will automatically update the site itself.

Publishing the `asf-site` branch as the https://ozone.apache.org is configured by the [.asf.yaml descriptor](https://github.com/apache/ozone-site/blob/asf-site/.asf.yaml).

