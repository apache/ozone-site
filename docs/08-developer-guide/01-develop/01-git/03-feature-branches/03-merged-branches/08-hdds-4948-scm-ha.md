# HDDS-4948: SCM HA

## 1. stable builds/intermittent test failures

There are no intermittent failures specific to the HDDS-2823 branch as of now. During the development , it was ensured all the CI checks are clean prior to every commit merge .The plan is to run repeated CI checks on the merge commit to master.

## 2. documentation

Initial doc has been added by HDDS-4948.

## 3. design, attached the docs

All the design docs are linked from the documentation as part of HDDS-4948.

## 4. S3 compatibility

There are no incompatibilities with respect to S3. S3 is not changed at all (except that the OmUtils rename affected it)

## 5. support of containers / kubernetes

Tested in Kubernetes and everything worked well.

Example files are committed with HDDS-4950.

## 6. coverage/code quality

[Sonar master branch](https://sonarcloud.io/dashboard?branch=master&id=hadoop-ozone).
[Sonar SCM-HA branch](https://sonarcloud.io/dashboard?branch=HDDS-2823&id=hadoop-ozone)
SCM-HA has  20 more issues but 2.3 better code coverage.

## 7. build time

Recent master builder:

Recent SCM-HA build:

SCM-HA branch didn't introduce any significant slowness (2-3 minutes plus to the existing integrations test and acceptance tests which are already close to 1h runtime).
There is no significant difference between local build time. In a linux with the below configuration,

```text
hadoop@9 ~/glengeng$ lscpu
Architecture: x86_64
CPU op-mode(s): 32-bit, 64-bit
Byte Order: Little Endian
CPU(s): 16
On-line CPU(s) list: 0-15
Thread(s) per core: 1
Core(s) per socket: 16
Socket(s): 1
NUMA node(s): 1
Vendor ID: GenuineIntel
CPU family: 6
Model: 94
Model name: Intel(R) Xeon(R) Gold 61xx CPU
Stepping: 3
CPU MHz: 2494.138
BogoMIPS: 4988.27
Hypervisor vendor: KVM
Virtualization type: full
L1d cache: 32K
L1i cache: 32K
L2 cache: 4096K
NUMA node0 CPU(s): 0-15
Flags: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx pdpe1gb rdtscp lm constant_tsc rep_good nopl eagerfpu pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm 3dnowprefetch fsgsbase bmi1 hle avx2 smep bmi2 erms invpcid rtm mpx rdseed adx smap xsaveopt xsavec xgetbv1 arat
hadoop@9 ~/glengeng$ free -g
total used free shared buff/cache available
Mem: 125 4 98 0 22 120
Swap: 0 0 0

#data for master
INFO BUILD SUCCESS
INFO ---------------------------------------------
INFO Total time: 08:10 min
INFO Finished at: 2021-03-10T16:54:42+08:00
INFO ---------------------------------------------

#data for HDDS-2823
INFO BUILD SUCCESS
INFO --------------------------------------------
INFO Total time: 07:09 min
INFO Finished at: 2021-03-10T17:06:42+08:00
```

## 8. possible incompatible changes/used feature flag

For using the SCM HA feature, "ozone.SCM.ratis.enable" config needs to be set to be true in `ozone-site.xml`.

## 9. third party dependencies/licence changes

Checking the content of the two branches (`find -type f | sort > ...`  + diff) the only jar differences are due to a latest version bump:

```text
 ./share/ozone/lib/jackson-annotations-2.12.1.jar
> ./share/ozone/lib/jackson-core-2.12.1.jar
> ./share/ozone/lib/jackson-databind-2.12.1.jar
> ./share/ozone/lib/jackson-dataformat-cbor-2.12.1.jar
> ./share/ozone/lib/jackson-dataformat-xml-2.12.1.jar
> ./share/ozone/lib/jackson-datatype-jsr310-2.12.1.jar
> ./share/ozone/lib/jackson-module-jaxb-annotations-2.12.1.jar
```

No new dependencies are added.

## a10. performance

Performance between master and SCM-HA branch (without turning on Ratis) is shared [here](https://docs.google.com/document/d/1XYgwM3zOKeZUWsrkxaWO_12zpokTFOSoA4X7Eu-Ed50/edit)

> We use the default configuration for master and 2823.
>
> The write throughput seems to be constrained by hardware, e.g. DC network, which we haven’t dug further.
>
> According to the slight differences between 2823 and master, the performance of the SCM HA bypass Ratis is close to that of pure in-mem SCM

## 11. security considerations

Security is not ready on the branch yet, therefor this feature is not production-ready. SCM-HA is disabled for secure clusters to avoid any security issues. (See HDDS-4978.)
