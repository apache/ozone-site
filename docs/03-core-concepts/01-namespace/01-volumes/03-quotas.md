---
sidebar_label: Quotas
---

# Volume Quotas


## Quota Management

Quotas provide a mechanism to control resource utilization at the volume level:

- **Space Quotas**: Limit the total amount of storage (in bytes) a volume can use
- **Namespace Quotas**: Limit the total number of objects that can be stored within a volume
- **Hierarchical Enforcement**: Volume quotas apply to the aggregate of all contained buckets
- **Visibility**: Quota usage and limits can be monitored through the CLI and management interfaces
- **Enforcement**: When a quota is reached, write operations fail with a descriptive error message

### Quota Commands

```bash
# Set both space (1TB) and namespace (1 million objects) quotas simultaneously
ozone sh volume setquota --space=1TB --count=1000000 /marketing

# Check current quota settings and usage
ozone sh volume info /marketing

# Clear the space quota (set space limit to unlimited)
ozone sh volume clrquota --space /marketing

# Clear the namespace quota (set object count limit to unlimited)
ozone sh volume clrquota --count /marketing
```