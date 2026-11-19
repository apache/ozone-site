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

# Triggers an Algolia Crawler reindex via the Crawler REST API.
# Requires: ALGOLIA_CRAWLER_ID, ALGOLIA_CRAWLER_USER_ID, ALGOLIA_CRAWLER_API_KEY

set -eu

for var in ALGOLIA_CRAWLER_ID ALGOLIA_CRAWLER_USER_ID ALGOLIA_CRAWLER_API_KEY; do
  eval "val=\${$var:-}"
  if [ -z "$val" ]; then
    echo "Missing required environment variable: $var" >&2
    exit 1
  fi
done

api_url="https://crawler.algolia.com/api/1/crawlers/${ALGOLIA_CRAWLER_ID}/reindex"
response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

http_code="$(
  curl -sS -o "$response_file" -w '%{http_code}' \
    -X POST \
    -u "${ALGOLIA_CRAWLER_USER_ID}:${ALGOLIA_CRAWLER_API_KEY}" \
    "$api_url"
)"

body="$(cat "$response_file")"
echo "Algolia Crawler reindex response (HTTP ${http_code}):"
echo "$body"

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo '## Algolia Crawler reindex'
    echo ''
    echo "**HTTP status:** ${http_code}"
    echo ''
    echo '```json'
    echo "$body"
    echo '```'
  } >> "$GITHUB_STEP_SUMMARY"
fi

case "$http_code" in
  2??) exit 0 ;;
  *) exit 1 ;;
esac
