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

# Validates docusaurus _category_.yml files used to configure the docs sidebar.
# Each docs subdirectory should have a _category_.yml file, and it must follow the defined schema.

rc=0

root="$(git rev-parse --show-toplevel)"
schema="$root"/.github/resource/category.schema.json

check_dir() {
    dir="$1"
    category_file="$dir/_category_.yml"
    if [ ! -f "$category_file" ]; then
        echo "_category_.yml is required for docs subdirectory $dir" 1>&2
        rc=1
    elif ! pnpm ajv validate --errors=text -s "$schema" -d "$category_file" 1>/dev/null; then
        rc=1
    fi
}

for child in $(find "$root"/docs/*); do
    if [ -d "$child" ]; then
        check_dir "$child"
    fi
done

exit "$rc"
