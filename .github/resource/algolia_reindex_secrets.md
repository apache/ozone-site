# Algolia crawler reindex — GitHub Actions secrets

The [`algolia-reindex` workflow](../workflows/algolia-reindex.yml) needs three repository secrets before it can call the Algolia Crawler API. Add them under **Settings → Secrets and variables → Actions** on `apache/ozone-site` (ASF repo admins).

| Secret | Where to find it in Algolia |
| --- | --- |
| `ALGOLIA_CRAWLER_USER_ID` | Crawler → **Settings** tab → Crawler User Id |
| `ALGOLIA_CRAWLER_API_KEY` | Crawler → **Settings** tab → Crawler API Key |
| `ALGOLIA_CRAWLER_ID` | Your crawler → Configuration → **Settings** → Crawler ID |

Do not commit these values to the repository. The search-only API key in `docusaurus.config.js` cannot trigger crawls.

After secrets are configured, run **Actions → algolia-reindex → Run workflow** with **force** enabled to verify the crawl starts in the Algolia Crawler dashboard.
