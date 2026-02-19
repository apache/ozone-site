---
title: Kerberos Authentication
sidebar_label: Kerberos
---

## Kerberos Authentication in Apache Ozone

This document explains the fundamentals of Kerberos authentication and its application within Apache Ozone to secure communication between clients and services, as well as between Ozone services internally.

## What is Kerberos Authentication Protocol?

Kerberos is a network authentication protocol that works on the basis of tickets to allow nodes communicating over a non-secure network to prove their identity to one another in a secure manner. It uses strong cryptography so that a client can prove its identity to a server (and vice-versa) across an insecure network connection.

Key components of Kerberos include:

- **Clients:** Users or services requesting access.
- **Servers:** Services providing resources.
- **Key Distribution Center (KDC):** A trusted third party responsible for issuing tickets and managing user credentials. The KDC typically consists of an Authentication Server (AS) and a Ticket-Granting Server (TGS).
- **Principals:** Unique identities (users or services) within the Kerberos realm.

## How Ozone uses Kerberos

In a secure, Kerberized Ozone cluster, all communication is authenticated to prevent unauthorized access and ensure integrity. Ozone leverages Kerberos for two primary authentication patterns:

### Client-to-Service Authentication

Clients (e.g., `ozone sh`, Spark jobs) authenticate with Ozone services (e.g., Ozone Manager, SCM) by acquiring a Kerberos ticket-granting ticket (TGT) from the KDC. This TGT is then used to obtain service tickets for various Ozone services, proving the client's identity to each service.

### Service-to-Service Authentication

Ozone's internal services (e.g., Ozone Manager to SCM, SCM to Datanodes, Datanodes to other Datanodes for replication) also authenticate with each other using Kerberos. Each service runs as a distinct Kerberos principal, and they use service tickets to establish trusted communication channels. For details on configuring Kerberos for Ozone services, refer to the [Configuring Kerberos page](../../../administrator-guide/configuration/security/kerberos).

### Kerberos over HTTP using SPNEGO

For web-based interfaces and REST APIs (e.g., Recon UI, S3 Gateway), Kerberos authentication is often performed using SPNEGO (Simple and Protected GSSAPI Negotiation Mechanism). SPNEGO allows web clients (like browsers) to use their existing Kerberos credentials to authenticate with web servers without requiring explicit username/password input. For configuration details, see [Configuring HTTP authentication using Kerberos SPNEGO](../../../administrator-guide/configuration/security/https).
