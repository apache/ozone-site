# HttpFS Overview

HttpFS (HTTP FileSystem) is a gateway service that provides a REST interface to Apache Ozone, compatible with the WebHDFS API. It allows web applications and non-Java clients to interact with Ozone using standard HTTP methods, without requiring the full Hadoop client library stack.

## Role in Ozone Architecture

In the Ozone architecture, HttpFS serves as a specialized gateway:

- Provides HTTP/HTTPS access to Ozone storage
- Translates WebHDFS REST API calls to Ozone operations
- Acts as a proxy between web clients and Ozone components
- Offers cross-firewall access to Ozone data

## Key Characteristics

HttpFS provides several important capabilities:

- **REST API Compatibility**: Implements the WebHDFS REST API, making it compatible with existing tools and applications designed for HDFS
- **HTTP/HTTPS Support**: Enables secure access through HTTPS with proper certificate configuration
- **Cross-Platform Support**: Allows non-Java clients to interact with Ozone
- **Web Application Integration**: Simplifies integration with web-based tools and services
- **Firewall Traversal**: Provides a single entry point for accessing Ozone across network boundaries

## Internal Architecture

Internally, HttpFS consists of several key components:

1. **HTTP Server**: Receives and processes REST API requests
2. **Request Processors**: Handlers for different HTTP operations (GET, PUT, POST, DELETE)
3. **Authentication Filters**: SPNEGO/Kerberos and delegation token authentication
4. **Ozone Client**: A specialized Ozone client for executing operations
5. **Response Generators**: Formats responses according to WebHDFS specifications

## Request Flow

When HttpFS receives a request, it follows this general flow:

1. **Authentication**: Verifies the user's credentials or delegation token
2. **Request Parsing**: Extracts the operation and parameters from the HTTP request
3. **Permission Check**: Verifies that the user has permission to perform the operation
4. **Operation Execution**: Converts the REST request to the corresponding Ozone operation and executes it
5. **Response Generation**: Creates an HTTP response with the appropriate status code and response body

## Integration with Ozone

HttpFS integrates with other Ozone components:

- Communicates with the **Ozone Manager** for namespace operations
- Works with the **Storage Container Manager** for container-related operations
- Interacts directly with **Datanodes** for data transfer operations
- Supports the same **security mechanisms** as other Ozone components

## Use Cases

HttpFS is particularly valuable in scenarios such as:

- Web applications that need to access Ozone data
- Cross-platform applications written in languages other than Java
- Environments where firewall constraints limit direct access to Ozone components
- Integration with existing tools that support the WebHDFS API

## Security Considerations

HttpFS inherits Ozone's security model:

- **Authentication**: Supports Kerberos authentication
- **Authorization**: Respects Ozone's permission model
- **Encryption**: Supports SSL/TLS for secure communication
- **Delegation Tokens**: Allows authenticated operations without repeatedly using Kerberos credentials

## Configuration

HttpFS requires its own configuration, including:

- Server port and address
- Authentication settings
- Kerberos principal and keytab (when security is enabled)
- SSL/TLS certificate details (for HTTPS)
- Connection parameters to Ozone components