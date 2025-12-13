# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
# CGO_ENABLED=1 is needed for sqlite if used, but we use postgres. 
# However, wazero is pure Go. 
# If we plan to run python/js wasm, we might need specific things? 
# Wazero is embedded.
# Build as static binary if possible, but standard is fine.
RUN go build -o main ./cmd/server/main.go

# Run stage
FROM alpine:latest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

# Environment variables will be overridden by docker-compose
ENV PORT=8080

# Run the app
CMD ["./main"]
