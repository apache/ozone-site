# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# See https://pnpm.io/docker

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base
# Creates store at /pnpm/store by default.
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies to /ozone-site/node_modules as part of the image.
WORKDIR /ozone-site
COPY package.json .
COPY pnpm-lock.yaml .
# Lockfile should not be changed when installing dependencies, hence freezing it.
RUN pnpm install --frozen-lockfile
