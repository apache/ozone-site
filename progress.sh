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


# Run this script to see how many pages are filled in and how many are left. This is an approximation based on the TODO
# messages in existing stubbed out pages. Pass -v or --verbose to get a specific list of pages.
# This script can be deleted once the new website is complete.

verbose='false'
if [ "$1" = '-v' -o "$1" = '--verbose' ]; then
    verbose='true'
fi

repo_dir="$(git rev-parse --show-toplevel)"
page_count="$(find "$repo_dir/docs" "$repo_dir/src" -type f -name '*.md' | wc -l)"
incomplete_pages="$(grep -rl 'TODO' --include '*.md' "$repo_dir/docs" "$repo_dir/src")"
complete_pages="$(grep -rL 'TODO' --include '*.md' "$repo_dir/docs" "$repo_dir/src")"

echo "Total pages: $page_count"

echo "------------"
echo "Complete pages: $(echo "$complete_pages" | grep -vc '^$')"
if [ "$verbose" = 'true' ]; then
    echo "------------"
    echo "$complete_pages"
fi

echo "------------"
echo "Incomplete pages: $(echo "$incomplete_pages" | grep -vc '^$')"
if [ "$verbose" = 'true' ]; then
    echo "------------"
    echo "$incomplete_pages"
fi
