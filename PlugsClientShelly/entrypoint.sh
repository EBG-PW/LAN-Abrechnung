#!/bin/sh
# entrypoint.sh

# Fetch the environment variables for TOKEN and ADDR
TOKEN="$TOKEN"
ADDR="$ADDR"

# Run the Go executable with the fetched arguments
/plugs-client-shelly -token "$TOKEN" -addr "$ADDR"
