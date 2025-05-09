FROM golang:1.21.5

WORKDIR /app

# Copy only the go.mod and go.sum files first to leverage Docker cache
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY main.go ./

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o /plugs-client-shelly

# Copy the entrypoint.sh script into the container
COPY entrypoint.sh /entrypoint.sh

# Set execute permissions on the entrypoint script
RUN chmod +x /entrypoint.sh

# Define the entrypoint script as the command to run when the container starts
ENTRYPOINT ["/entrypoint.sh"]