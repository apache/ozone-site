import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';

const iconMapping = {
  'GitHub Discussions': '/img/icon-github.svg',
  'Jira Issues': '/img/icon-jira.svg',
  'Slack': '/img/icon-slack.svg',
  'Mailing List': '/img/icon-mail.svg',
  'YouTube': '/img/icon-youtube.svg',
  'Twitter': '/img/icon-twitter-x.svg'
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
        {label}
        {iconPath && <img src={iconPath} alt={`${label} Icon`} style={{fill: 'white', width: '16px', height: '16px', marginLeft: '5px', verticalAlign: 'middle' }} />}
        {href && !isInternalUrl(href) && <IconExternalLink />}
      </Link>
  );
}