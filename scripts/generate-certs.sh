#!/bin/bash
# Generate self-signed SSL certificates for HTTP/2 testing

CERT_DIR="certs"
mkdir -p "$CERT_DIR"

# Generate private key
openssl genrsa -out "$CERT_DIR/key.pem" 2048

# Generate certificate signing request
openssl req -new -key "$CERT_DIR/key.pem" -out "$CERT_DIR/csr.pem" -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate valid for 365 days
openssl x509 -req -days 365 -in "$CERT_DIR/csr.pem" -signkey "$CERT_DIR/key.pem" -out "$CERT_DIR/cert.pem" -extensions v3_req -extfile <(
cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
)

# Clean up CSR file
rm "$CERT_DIR/csr.pem"

echo "✅ SSL certificates generated in $CERT_DIR/"
echo "   - cert.pem (certificate)"
echo "   - key.pem (private key)"

