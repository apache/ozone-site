---
sidebar_label: Ranger Integration
---

# Ranger Integration for Authorization

Apache Ozone can integrate with **Apache Ranger** to provide centralized authorization policy management and auditing. When Ranger integration is enabled, it replaces Ozone's [Native ACLs](./01-native-acls.md) as the primary mechanism for controlling access to volumes, buckets, and keys.

## Overview

Integrating Ozone with Ranger offers several advantages:

*   **Centralized Policy Management:** Define and manage all access policies for Ozone resources (and potentially other Hadoop components) through the unified Ranger Admin UI.
*   **Rich Policy Features:** Leverage Ranger's advanced policy features, including resource-based and tag-based policies, attribute-based access control, security zones, and deny conditions.
*   **Auditing:** Centralized auditing of access requests (allowed and denied) within Ranger's audit framework.
*   **Consistency:** Ensures consistent policy enforcement across different services integrated with Ranger.

## How it Works

1.  **Ranger Plugin:** The Ozone Manager (OM) loads the Ozone Ranger plugin.
2.  **Configuration:** Ozone is configured to use Ranger as its authorizer (`ozone.acl.authorizer.class=org.apache.hadoop.ozone.security.acl.OzoneAuthorizerRanger`). OM is also configured with the Ranger Admin server address (`ozone.om.ranger.https-address`) and the name of the Ozone service defined in Ranger (`ozone.om.ranger.service`).
3.  **Authentication to Ranger:** The OM needs credentials (Kerberos or username/password) to authenticate with the Ranger Admin server to download policies.
4.  **Policy Download:** The Ozone Ranger plugin periodically polls the Ranger Admin server and downloads the relevant policies defined for the Ozone service. These policies are cached locally within the OM.
5.  **Authorization Check:** When a client requests an operation on an Ozone resource, the OM consults the Ranger plugin. The plugin evaluates the request against the cached policies based on the user's identity (e.g., Kerberos principal) and the target resource.
6.  **Decision:** The Ranger plugin returns an allow or deny decision to the OM, which then enforces it.

## Enabling Ranger Integration

1.  **Install Ranger:** Ensure Apache Ranger is installed and running.
2.  **Install Ozone Plugin:** Install the Ozone service definition and plugin into Ranger.
3.  **Configure Ozone Service in Ranger:** Create an Ozone service instance within the Ranger Admin UI (e.g., `cm_ozone`).
4.  **Configure Ozone (`ozone-site.xml`):**
    ```xml
    <property>
      <name>ozone.acl.enabled</name>
      <value>true</value>
      <description>Enable ACL checks.</description>
    </property>

    <property>
      <name>ozone.acl.authorizer.class</name>
      <value>org.apache.hadoop.ozone.security.acl.OzoneAuthorizerRanger</value>
      <description>Use Ranger for authorization.</description>
    </property>

    <property>
      <name>ozone.om.ranger.https-address</name>
      <value>https://your-ranger-admin-host:6182</value>
      <description>URL of the Ranger Admin server.</description>
    </property>

    <property>
      <name>ozone.om.ranger.service</name>
      <value>cm_ozone</value> <!-- Or your Ranger service name for Ozone -->
      <description>Name of the Ozone service defined in Ranger.</description>
    </property>

    <!-- Configure OM authentication to Ranger (Kerberos recommended) -->
    <property>
      <name>ozone.om.kerberos.principal</name>
      <value>om/_HOST@YOUR-REALM.COM</value>
      <description>OM's Kerberos principal, used to authenticate to Ranger.</description>
    </property>
    <property>
      <name>ozone.om.kerberos.keytab.file</name>
      <value>/etc/security/keytabs/om.keytab</value>
      <description>Path to OM's keytab file.</description>
    </property>

    <!-- OR Username/Password (Less Secure) -->
    <!--
    <property>
      <name>ozone.om.ranger.https.admin.api.user</name>
      <value>ranger_admin_user</value>
    </property>
    <property>
      <name>ozone.om.ranger.https.admin.api.passwd</name>
      <value>ranger_admin_password</value>
    </property>
    -->
    ```
5.  **Restart Ozone Manager:** Apply the configuration changes.

## Defining Policies in Ranger

Once integrated, use the Ranger Admin UI to create policies for the Ozone service. Policies typically specify:

*   **Resources:** Volumes, Buckets, Keys (using wildcards if needed).
*   **Permissions:** Ozone-specific permissions like `read`, `write`, `delete`, `list`, `create`, `read_acl`, `write_acl`.
*   **Users/Groups/Roles:** Who the policy applies to.
*   **Conditions:** Allow or Deny rules.

Refer to the Apache Ranger documentation for details on creating policies.

Ranger integration provides a powerful, centralized approach to managing authorization for Ozone clusters, especially in complex environments with multiple services.
