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

# Validates docusaurus README.mdx files used to configure sections in the docs sidebar.
# Each docs subdirectory should have a README.mdx file, and the file should contain a generated index of pages or
# subsections using the `<DocCardList/>` tag as its last line.

rc=0
missing_index=0

root="$(git rev-parse --show-toplevel)"
index_name='README.mdx'

# Make sure all docs directories have an index file that contains an index of subsections.
for child in $(find "$root"/docs/* -type d); do
    index_file="$child/$index_name"
    if [ ! -f "$index_file" ]; then
        echo "A $index_name index file is required in the docs subdirectory $child" 1>&2
        rc=1
    elif [ "$(tail -n1 "$index_file")" != '<DocCardList/>' ]; then
        echo "$index_file is missing an index of sidebar items." 1>&2
        rc=1
    fi
done

if [ "$rc" != 0 ]; then
    printf '\n%s\n' 'For help with documentation sidebar configuration see https://github.com/apache/ozone-site/blob/master/CONTRIBUTING.md#documentation-sidebar' 1>&2
fi

exit "$rc"
