#!/usr/bin/env bash
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

set -euo pipefail

OM_HOST="${OM_HOST:-om}"
VOLUME="${DEMO_VOLUME:-huevol}"
BUCKET="${DEMO_BUCKET:-huebucket}"
OWNER="${DEMO_OWNER:-admin}"

exec_om() {
  docker compose exec -T "$OM_HOST" "$@"
}

wait_for_om() {
  exec_om ozone admin safemode wait
}

recreate_demo_paths() {
  exec_om ozone sh bucket delete "/${VOLUME}/${BUCKET}" 2>/dev/null || true
  exec_om ozone sh volume delete "/${VOLUME}" 2>/dev/null || true
  exec_om ozone sh volume create "/${VOLUME}" -u "${OWNER}"
  exec_om ozone sh bucket create "/${VOLUME}/${BUCKET}" --layout fso
}

wait_for_om
recreate_demo_paths
echo "Demo Ozone paths ready for Hue user '${OWNER}': /${VOLUME}/${BUCKET}"
