# S3 Chunked Uploads

S3 Gateway accepts `aws-chunked` request bodies for `PutObject` and multipart `UploadPart`, including datastream writes.
Verifying chunk signatures authenticates the payload. A checksum trailer lets S3 Gateway compare the payload with the client's checksum.

Chunks frame a single request body. They are separate from the parts of a multipart upload.

## Payload modes

The following `x-amz-content-sha256` values specify the signatures and trailers carried by the request:

| Value | Chunk signatures | Trailer |
|---|---|---|
| `STREAMING-AWS4-HMAC-SHA256-PAYLOAD` | HMAC-SHA256 | None |
| `STREAMING-AWS4-HMAC-SHA256-PAYLOAD-TRAILER` | HMAC-SHA256 | Checksum and HMAC-SHA256 signature |
| `STREAMING-UNSIGNED-PAYLOAD-TRAILER` | None | Checksum |

For ECDSA markers, see [ECDSA and SigV4a](#ecdsa-and-sigv4a).
`UNSIGNED-PAYLOAD` describes a raw body, not an `aws-chunked` body.

For object and part uploads, set `x-amz-decoded-content-length` to the payload size without chunk framing.
If `Content-Encoding` is supplied, its comma-separated values must include `aws-chunked`; omission is accepted for SDK compatibility.
The [FSO directory path](#fso-directories) has different verification behavior.

## When signatures are verified

For either HMAC payload mode above, authentication through an `Authorization` header with `AWS4-HMAC-SHA256` selects chunk-signature verification.
S3 Gateway requests a derived SigV4 signing key from OM when it opens the object or part. If a key is returned, S3 Gateway enables signature verification before reading the payload.

OM returns the key only when OM security is enabled. In the table, secure mode means `ozone.security.enabled=true` on S3 Gateway.

| Authentication | Signing key from OM | Chunk and signed-trailer signatures |
|---|---|---|
| `Authorization` header | Returned | Verified |
| `Authorization` header, secure mode | Missing | Request fails with `InternalError` |
| `Authorization` header, non-secure mode | Missing | Not verified |
| Presigned URL | Not requested | Not verified |

For `STREAMING-AWS4-HMAC-SHA256-PAYLOAD-TRAILER` and `STREAMING-UNSIGNED-PAYLOAD-TRAILER`, the payload checksum is verified regardless of whether signatures are verified.

## Verification and commit

1. S3 Gateway removes chunk framing while reading the payload. When HMAC verification is enabled, it hashes each chunk and verifies its signature, chained from the request signature through the preceding chunks.
2. For the two supported trailer modes, it also computes the selected checksum over the whole decoded request payload as the bytes are read. Neither calculation buffers the whole payload.
3. Before committing the upload, S3 Gateway completes the required checks on the final zero-byte chunk and any declared trailer. When signature verification is enabled, it verifies the trailer signature over the checksum header text before comparing the checksum with the payload bytes.
4. A transfer or verification failure prevents the object or part from being committed. Data can already have been streamed to Datanodes, but the failed upload does not become a committed key or part.

Streams with HMAC verification enabled or a supported checksum trailer require a final zero-byte chunk and valid CRLF delimiters after chunk data.
Other signed streams, including those with ECDSA markers, skip these checks.
For these streams, S3 Gateway stops reading at `x-amz-decoded-content-length`: a shorter payload is rejected, and excess data is neither stored nor reported as an error.
`Content-MD5`, when supplied, is still checked against the payload that is written.

## Checksum trailers

The two supported trailer modes require exactly one supported name in `x-amz-trailer`:

| Header name | Decoded checksum size |
|---|---|
| `x-amz-checksum-crc32` | 4 bytes |
| `x-amz-checksum-crc32c` | 4 bytes |
| `x-amz-checksum-crc64nvme` | 8 bytes |
| `x-amz-checksum-sha1` | 20 bytes |
| `x-amz-checksum-sha256` | 32 bytes |

The matching trailer value must be Base64-encoded with the decoded size above; CRC values use big-endian byte order.
Comma-separated trailer declarations are rejected.
Signed trailers require an `x-amz-trailer-signature` line after the checksum; signature fields must contain 64 hexadecimal characters.
When signature verification is disabled, signed streams still require the signature fields to have this format.
The trailer section must end with a blank line and the request body must end there.

## Errors

| Failure | S3 error | HTTP status |
|---|---|---|
| Missing decoded length or required `x-amz-trailer` declaration, or a supplied `Content-Encoding` without `aws-chunked` | `InvalidArgument` | 400 |
| Unsupported trailer name, malformed checksum, invalid chunk or trailer framing, or a missing required final chunk or trailer | `InvalidRequest` | 400 |
| Checksum does not match the decoded payload | `BadDigest` | 400 |
| Well-formed chunk or trailer signature fails an enabled HMAC check | `SignatureDoesNotMatch` | 403 |
| Derived key missing when HMAC verification is requested in secure mode | `InternalError` | 500 |
| `AWS4-ECDSA-P256-SHA256` used as the request authentication algorithm | `AuthorizationHeaderMalformed` | 400 |

## Limitations

### ECDSA and SigV4a

S3 Gateway does not verify ECDSA chunk or trailer signatures. It also rejects `AWS4-ECDSA-P256-SHA256` in the `Authorization` header or the presigned URL's `X-Amz-Algorithm` parameter, so a SigV4a request fails before the payload is read.

The payload marker is handled separately from the authentication algorithm.
An ECDSA `STREAMING-...` marker on an otherwise accepted request selects signed chunk decoding without signature verification.
The decoder still requires a 64-character hexadecimal signature on each chunk, as used by HMAC-SHA256.
The `STREAMING-AWS4-ECDSA-P256-SHA256-PAYLOAD-TRAILER` marker does not enable trailer parsing or checksum verification; its trailer is ignored.
The upload can succeed if the chunk format and other upload checks pass.

### FSO directories

With `ozone.s3g.fso.directory.creation` enabled, a zero-length upload to a key ending in `/` in an FSO bucket can create a directory without opening a key.
This path does not obtain a signing key or verify chunk and trailer HMAC.
The two supported trailer modes still check framing, signature format where present, and the empty-payload checksum.
The non-trailer mode does not consume or verify the chunk body on this path.

### Checksum storage

Trailer verification does not persist these checksums for retrieval or calculate an aggregate checksum across multipart parts.
For `UploadPart`, the checksum covers only that request's part.

## References

- [AWS SigV4 chunked uploads](https://docs.aws.amazon.com/AmazonS3/latest/developerguide/sigv4-streaming.html)
- [AWS signed trailing headers](https://docs.aws.amazon.com/AmazonS3/latest/developerguide/sigv4-streaming-trailers.html)
- [AWS trailing checksums](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity-upload.html#trailing-checksums)
