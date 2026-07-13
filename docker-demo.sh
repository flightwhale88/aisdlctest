#!/bin/bash
# Docker Build & Run Commands for Snip Bundle

echo "=== Snip Bundle Docker Commands ==="
echo ""
echo "1. BUILD IMAGE"
echo "Command: docker build -t snip ."
echo "Location: bundle/"
echo ""
cat << 'EOF'
# Expected output:
[+] Building 45.2s (10/10) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 188B
 => [internal] load .dockerignore
 => => transferring context: 86B
 => [internal] load build context
 => => transferring context: 15.2MB
 => [1/3] FROM oven/bun:1-alpine
 => [2/3] WORKDIR /app
 => [3/3] COPY . .
 => exporting to image
 => => exporting layers
 => => writing image sha256:abcd1234...
 => => naming to docker.io/library/snip:latest

Successfully built snip:latest
EOF
echo ""
echo "2. RUN IMAGE"
echo "Command: docker run --rm -p 3000:3000 snip"
echo ""
cat << 'EOF'
# Expected output:
Snip listening on http://localhost:3000 (port 3000)
(stays running, serving web UI + API on port 3000)

# In another terminal:
curl http://localhost:3000/
# Returns: HTML page with Snip UI

curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/very/long/path"}'
# Returns: {"code":"abc123","shortUrl":"http://localhost:3000/abc123","hits":0}

curl http://localhost:3000/abc123
# Returns: 302 redirect to https://example.com/very/long/path
EOF
echo ""
echo "=== To Start Docker Daemon ==="
echo "1. Open Docker Desktop from Start Menu"
echo "2. Wait for 'Docker is running' status"
echo "3. Try again:"
echo ""
echo "   cd C:\Users\ddc2localadmin\aisdlctest\snip-demo\bundle"
echo "   & 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' build -t snip ."
echo "   & 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' run --rm -p 3000:3000 snip"
echo ""
echo "=== Dockerfile Verification ==="
docker -v 2>/dev/null && echo "✓ Docker CLI found" || echo "✗ Docker not in PATH"
if [ -f "Dockerfile" ]; then
  echo "✓ Dockerfile exists:"
  head -10 Dockerfile
else
  echo "✗ Dockerfile not found"
fi
