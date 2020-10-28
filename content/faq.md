---
title: Frequently Asked Questions
---

### What is Ozone? 
Ozone is an object store designed for big data applications. Big data workloads tend to be very different from standard workloads and Ozone is born out of lessons learned from running Hadoop in thousands of clusters.

### Why an Object Store?
Object stores are more straightforward to build and use than standard file systems. It is also easier to scale an object store.  The fact that most big data applications and frameworks like Apache Spark, YARN and Hive can run both on cloud and on-prem, makes having an object store on-prem very attractive.

### Can I use Ozone in the cloud?
While the technical answer is Yes, there is always a question of why you are not happy with the file system provided by the cloud vendor. It is often cheaper to run against the cloud vendor's base object store.

### Is there a cloud where I can use Ozone as the object store?
Not that we know.  Ozone is an Apache-licensed open source product; Nothing prevents someone from offering Ozone as a product in the cloud.

### I have an Apache Spark Application. How do I use it with Ozone?
You have a Spark based application and you want it to work with Ozone. If your current storage system is HDFS, then you are passing the location of data to your application by using an URL that begins with hdfs://. If you replace hdfs:// with 03fs:// Spark application will start using data from an Ozone bucket.

### I have an application that is reading and writing to S3 buckets. How do I use it with Ozone?
Ozone supports S3 protocol as a first-class interface. So you can take an existing S3 based application and change the S3 server address. That is it.

### You said I could change the S3 server address, but I need to put the access key id and secret access key into my .aws file; where do I find it?
If you have a secure Ozone cluster, please login by running "kinit" and please ask for ozone aws credentials by running "ozone s3 getsecret".  This command will present your Kerberos credentials to Ozone manager, and Ozone manager will return both access key id and secret access key that you can put into your .aws file. If the security is not turned on, you can put anything in these fields as  security will not be enforced on the server side.

### You said Kerberos, but that is not how S3 security works. So?
Thank you for pointing that out. Your S3 credentials are created using your Kerberos identity. From the administrator's point of view, this allows us to have a centralized identity and policy management for Ozone. Ozone supports the AWS Signature Version 4 protocol, so from the user's point of view it just works.

### Okay, I am convinced I would like to try out Ozone. How do I get started?
Please take a look at the getting started document. For the impatient, we have docker containers, which allows you to start a fully functional cluster on your machine to explore and see if Ozone works for you.

There are instructions on how to start Ozone on conventional machines or VMs if you would like to go that way.

You can [download](/ozone/downloads/) it and [try it out.](/ozone/docs/0.3.0-alpha/runningviadocker.html)

### You said K8s in the first page, How do I deploy Ozone on K8s?
Please look at the getting started with K8s page. Ozone fully supports deployments to a K8s cluster.

### I have an existing Apache Hadoop cluster, and I run things like HDFS and YARN. How do I use Ozone?
Ozone is designed to run concurrently with HDFS and YARN in a normal Hadoop Cluster. So you can upgrade to the latest Hadoop, untar Ozone bits in the same cluster and have Ozone working concurrently. Please see the getting started with HDFS to get more information.

### How does Ozone scale and how it is different from HDFS?
Ozone has done some things differently from HDFS. First and foremost, Ozone took an ancient idea that was floating around in the HDFS community and created separate services to do different operations. So Ozone has a namespace server, block management server and a management console. Pretty much all of these are ideas borrowed from HDFS.


### Does it mean a new Hadoop server component?
Both Ozone and HDDS requires one additional master component - Ozone Manager and Storage Container Manager, respectively. 
The worker parts of Ozone/HDDS can be started as an HDFS Datanode plugin or as standalone.

### This sounds very interesting. How can I contribute? I have never contributed to Open source/I am a novice/I don't know how to contribute/I am intimidated, what can I do?

As Lao Tzu said, "The journey of a thousand miles begins with one step." You might have never worked on Distributed systems, but you will always be able to help out on Ozone. If you speak a foreign language like Chinese, you can help us out by translating documentation to Chinese. If you are a high school student and starting to learn Java, you are most welcome to come and pick up work items that fit your skill and schedule. If you know HTML, please feel free to work our websites and Ozone UI. If you are graphics artist and feel that Ozone can be improved, please let us know.
 
Ask us, please don't feel shy. We are an open and welcoming community. Feel free to open a JIRA under HDDS if you know how. The easiest thing is to send us an email in any discussion channel. Someone will always be there to help you out.

You are also welcome to join our weekly community call, and just talk to us. There are several ways to start contributing to Ozone.

The contribution process is the same as for any other Hadoop subproject. The Ozone Contribution Guidelines is available from the [wiki][2].


[1]: https://cwiki.apache.org/confluence/display/HADOOP/Ozone+Road+Map
[2]: https://cwiki.apache.org/confluence/display/HADOOP/Ozone+Contributor+Guide