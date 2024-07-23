/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';

const iconMapping = {
  'GitHub Discussions': '/img/social/github.svg',
  'Jira Issues': '/img/social/jira.svg',
  'Slack': '/img/social/slack.svg',
  'Mailing List': '/img/social/mail.svg',
  'YouTube': '/img/social/youtube.svg',
  'Twitter': '/img/social/twitter-x.svg'
};
export default function FooterLinkItem({item}) {
  const {to, href, label, prependBaseUrlToHref, ...props} = item;
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, {forcePrependBaseUrl: true});
  const iconPath = iconMapping[label];  // Get icon path from mapping

  return (
      <Link
          className="footer__link-item"
          {...(href
              ? {
                href: prependBaseUrlToHref ? normalizedHref : href,
              }
              : {
                to: toUrl,
              })}
          {...props}>

        {iconPath && <img src={iconPath} alt={`${label} Icon`} style={{width: '1em', height: '1em', marginRight: '0.5em', verticalAlign: 'middle'}} />}

        {label}
        {href && !isInternalUrl(href) && <IconExternalLink />}
      </Link>
  );
}