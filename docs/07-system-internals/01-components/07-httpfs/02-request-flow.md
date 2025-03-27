# HttpFS Request Flow

This document describes the journey of a client request through the HttpFS service, detailing how WebHDFS API calls are transformed into Ozone operations.

## Request Processing Sequence

A typical request flow through HttpFS follows these steps:

1. **Client Request Initiation**
   - Client sends an HTTP request to the HttpFS endpoint
   - Request includes an operation type, path, and optional parameters

2. **HTTP Server Processing**
   - The embedded HTTP server (Jetty) receives the request
   - The request is routed to the appropriate servlet based on the path

3. **Authentication**
   - Authentication filter intercepts the request
   - Authenticates using one of:
     - Kerberos (SPNEGO)
     - Delegation token
     - Simple authentication (if security is disabled)

4. **Request Validation**
   - Validates request parameters
   - Checks that required parameters are present
   - Verifies parameter format and values

5. **User Resolution**
   - Resolves the authenticated user's identity
   - Sets up the user context for authorization

6. **Path Resolution**
   - Parses the WebHDFS path into Ozone volume, bucket, and key components
   - Transforms relative paths to absolute paths if necessary

7. **Operation Translation**
   - Maps WebHDFS operations to corresponding Ozone operations:
     - `CREATE` → Ozone key create
     - `OPEN` → Ozone key read
     - `MKDIRS` → Ozone directory creation
     - `RENAME` → Ozone key rename
     - And other similar mappings

8. **Authorization Check**
   - Checks if the user has permission to perform the operation
   - Verifies access according to Ozone's permission model

9. **Ozone Client Interaction**
   - Creates the appropriate Ozone client call
   - Executes the operation through Ozone client libraries

10. **Data Transfer (for read/write operations)**
    - For read operations: streams data from Ozone to the HTTP response
    - For write operations: streams data from the HTTP request to Ozone

11. **Response Generation**
    - Creates an HTTP response with the appropriate status code
    - Formats the response body according to WebHDFS specification
    - Includes error details if the operation failed

12. **Response Transmission**
    - Sends the response back to the client
    - Closes the connection if no more data will be exchanged

## Specific Operation Flows

### File Read Operation

1. Client issues `GET /webhdfs/v1/volume/bucket/path/to/file?op=OPEN`
2. HttpFS authenticates the request
3. Translates WebHDFS path to Ozone path: `ozone://om-host/volume/bucket/path/to/file`
4. Opens input stream from Ozone client
5. Streams data through HTTP response

### File Write Operation

1. Client issues `PUT /webhdfs/v1/volume/bucket/path/to/file?op=CREATE`
2. HttpFS authenticates the request
3. Translates WebHDFS path to Ozone path: `ozone://om-host/volume/bucket/path/to/file`
4. Creates output stream through Ozone client
5. Reads from HTTP request body and writes to the output stream
6. Closes stream and confirms completion

### Directory Creation

1. Client issues `PUT /webhdfs/v1/volume/bucket/path/to/dir?op=MKDIRS`
2. HttpFS authenticates the request
3. Translates to Ozone path: `ozone://om-host/volume/bucket/path/to/dir`
4. Creates directory through Ozone client
5. Returns success status

### Listing Directory Contents

1. Client issues `GET /webhdfs/v1/volume/bucket/path/to/dir?op=LISTSTATUS`
2. HttpFS authenticates the request
3. Translates to Ozone path: `ozone://om-host/volume/bucket/path/to/dir`
4. Lists contents through Ozone client
5. Formats result as JSON according to WebHDFS specification
6. Returns formatted listing

## Error Handling

When errors occur during processing:

1. HttpFS catches exceptions from the Ozone client
2. Maps Ozone-specific exceptions to appropriate HTTP status codes:
   - `FileNotFoundException` → 404 Not Found
   - `AccessControlException` → 403 Forbidden
   - `InvalidPathException` → 400 Bad Request
3. Generates a JSON response with error details
4. Logs the error with appropriate severity

## Security Context Flow

For secure clusters, the security context flows as follows:

1. Client authenticates using Kerberos or delegation token
2. HttpFS validates credentials and creates a user proxy
3. All Ozone operations are executed as the authenticated user
4. Authorization checks are performed against the user's identity and groups
5. Audit logs record the original user's actions