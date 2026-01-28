---
sidebar_label: Ranger authorization policies
---

# Ranger authorization policies comparison table

The Ranger permissions corresponding to the Ozone operations are as follows:

| `Operation & Permission` | `Volume permission` | `Bucket permission` | `Key permission` |
|--------------------------|---------------------|---------------------|------------------|
| `Create volume` | `CREATE` | | |
| `List volume` | `LIST` | | |
| `Get volume info` | `READ` | | |
| `Delete volume` | `DELETE` | | |
| `Create bucket` | `READ` | `CREATE` | |
| `List bucket` | `LIST, READ` | | |
| `Get bucket info` | `READ` | `READ` | |
| `Delete bucket` | `READ` | `DELETE` | |
| `List key` | `READ` | `LIST, READ` | |
| `Write key` | `READ` | `READ` | `CREATE, WRITE` |
| `Read key` | `READ` | `READ` | `READ` |
