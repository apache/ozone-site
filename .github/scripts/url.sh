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

# Checks that all URLs contained in the sitemap.xml file from the build contain only allowed characters.
# All URLs on the Ozone site should use kebab-case with lowercase letters.

sitemap="$1"

if [ -z "$sitemap" ]; then
    echo "Requires path to sitemap.xml file as the first argument." 1>&2
    exit 1
fi

# Update this to 'https://ozone\.apache\.org/' when the website is published.
base_url_regex='https://ozone-site-v2\.staged\.apache\.org/'
valid_url_regex="$base_url_regex[a-z0-9][a-z0-9\./-]*[a-z0-9/]"

rc=0

for url in $(yq --output-format=props '.urlset.url[].loc' "$sitemap"); do
    if echo "$url" | grep -vx "$base_url_regex" | grep -Exvq "$valid_url_regex"; then
        echo "Disallowed URL format: $url" 1>&2
        rc=1
    fi
done

if [ "$rc" != 0 ]; then
    echo "Found URLs in the build that do match the allowed URL regex: $valid_url_regex" 1>&2
    echo "All URLs should use kebab case and lowercase letters." 1>&2
fi

exit "$rc"
