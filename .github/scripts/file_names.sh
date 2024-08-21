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

# Checks all page files and their parent directories to ensure that they use docusaurus number prefixes and are named
# all lower case with kebab-case.

root="$(git rev-parse --show-toplevel)"
rc=0

dir_regex='[a-z0-9][a-z0-9./-]*[a-z0-9]'
file_regex="$dir_regex\.mdx?"
# Pages used for docs should have a two digit number prefix to indicate their position in the sidebar.
# Docusaurus automatically strips this prefix from the links generated from file names.
doc_dir_regex="[0-9][0-9]-$dir_regex"
doc_file_regex="[0-9][0-9]-$file_regex"

check_regex() {
    file="$1"
    regex="$2"
    if ! basename "$file" | grep -Exq "$regex"; then
        echo "$file does not match regex '$regex'" 1>&2
        rc=1
    fi
}

is_markdown() {
    file="$1"
    # .md is a plain markdown file. .mdx is markdown with embedded Javascript.
    echo "$(basename "$file")" | grep -Exq '.+\.mdx?'
}

# Check docs pages. These must use number prefixes.
for file in $(find "$root"/docs/*); do
    if [ -d "$file" ]; then
        # Check docs directories.
        check_regex "$file" "$doc_dir_regex"
    elif is_markdown "$file" && [ "$(basename "$file")" != README.mdx ]; then
        # Check docs files.
        check_regex "$file" "$doc_file_regex"
    fi
done

# Check regular pages. These do not have number prefixes.
for file in $(find "$root"/src/pages/*); do
    # Check directories.
    if [ -d "$file" ]; then
        check_regex "$file" "$dir_regex"
    # Check files.
    elif is_markdown "$file"; then
        check_regex "$file" "$file_regex"
    fi
done

if [ "$rc" != 0 ]; then
    echo '\nFile and directory names of website pages must be all lower case and kebab-case. A two digit number prefix' \
        'must be used to order docs pages in the sidebar.' 1>&2
fi

exit "$rc"
