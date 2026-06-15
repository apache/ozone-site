# HDDS-5447: HttpFS

Ozone HttpFS is a WebHDFS compatible interface implementation, as a separate role it provides an easy integration with Ozone.

HttpFS support in Ozone epic Jira: [HDDS-5447](https://issues.apache.org/jira/browse/HDDS-5447)  

## 1. builds/intermittent test failures

no additional flaky tests have been introduced by the feature branch.

## 2. documentation

the documentation for HttpFS was added by [HDDS-5966](https://issues.apache.org/jira/browse/HDDS-5966) , it can be found at *[Hadoop-HDDs/docs/content/interface/HttpFS.md](https://github.com/apache/ozone/blob/HDDS-5447-httpfs/hadoop-hdds/docs/content/interface/HttpFS.md)*

## 3. design, attached the docs

- [design document](https://issues.apache.org/jira/secure/attachment/13031822/HTTPFS%20interface%20for%20Ozone.pdf) (can be found under the epic Jira)
- attached docs can be found at *[Hadoop-HDDs/docs/content/interface/HttpFS.md](https://github.com/apache/ozone/blob/HDDS-5447-httpfs/hadoop-hdds/docs/content/interface/HttpFS.md)*

## 4. S3 compatibility

the HttpFS gateway doesn't break anything related S3.

## 5. Docker-compose / acceptance tests

acceptance tests were added in the following tasks:

- [HDDS-5615](https://issues.apache.org/jira/browse/HDDS-5615)
- [HDDS-5698](https://issues.apache.org/jira/browse/HDDS-5698)
- [HDDS-7719](https://issues.apache.org/jira/browse/HDDS-7719)

it can be found at [/Hadoop-ozone/dist/src/main/smoketest/HttpFS](https://github.com/apache/ozone/tree/HDDS-5447-httpfs/hadoop-ozone/dist/src/main/smoketest/httpfs).

## 6. support of containers / Kubernetes

no addition yet.

## 7. coverage/code quality

[current](https://sonarcloud.io/summary/overall?id=hadoop-ozone&branch=master) and [HDDS-5447-HttpFS](https://sonarcloud.io/summary/new_code?id=hadoop-ozone&branch=HDDS-5447-httpfs)

## 8. build time

no significant change

- current master: **[1h 41m 17s](https://github.com/apache/ozone/actions/runs/4103741189)**
- last merged commit on branch: [**1h 33m 58s**](https://github.com/apache/ozone/actions/runs/4005079797) (will update with a green build-branch from the HDDS-5447-HttpFS branch)

## 9. possible incompatible changes/used feature flag

there should not be any incompatible changes introduced with this feature.

## 10. third party dependencies/licence changes

these dependencies were added:

- curator-client

- curator-framework

- JSON-simple

- zookeeper

the Zookeeper and Curator dependencies are added because the delegation tokens and token details are stored in Zookeeper, this can be relevant if there is a load balancer and more than one HttpFS gateways are serving the requests.
JSON-simple is used in the module, with objects like JSONObject, JSONArray, JSONParser, etc.

## 11. performance

this feature won't affect the performance of Ozone.

## 12. security considerations

there is no security implications because of this feature.
