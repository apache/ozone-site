#!/usr/bin/env sh
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

root="$(git rev-parse --show-toplevel)"

rc=0

printf '%s\n' 'Checking document content...'
pnpm cspell lint --root="$root" --no-progress --show-context '**/*.md' '**/*.mdx' || rc="$?"

printf '\n%s\n' 'Checking file names...'
find "$root"/docs "$root"/src/pages -exec basename {} \; | pnpm cspell --no-progress --show-context stdin://'File Name' || rc="$?"

if [ "$rc" != 0 ]; then
  # TODO Update this link to master when the new website's branch is merged.
  printf '\n%s\n%s\n' 'Spell check failed. See CONTRIBUTING.md for help fixing false positive spelling errors:' \
    'https://github.com/apache/ozone-site/blob/HDDS-9225-website-v2/CONTRIBUTING.md#spelling' 1>&2
fi

exit $rc
