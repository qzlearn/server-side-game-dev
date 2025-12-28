#!/bin/bash
# Game Server Network Testing Script

set -e

SERVER_URL=${1:-"ws://localhost:8080"}
NUM_CLIENTS=${2:-10}

echo "Testing game server: $SERVER_URL"
echo "Simulating $NUM_CLIENTS concurrent clients..."

# Install wscat if needed
if ! command -v wscat &> /dev/null; then
    echo "Installing wscat..."
    npm install -g wscat
fi

# Function to simulate client
simulate_client() {
    local client_id=$1
    echo "Client $client_id connecting..."

    # Connect and send test messages
    echo '{"type":"join_room","roomId":"test-room"}' | \
        timeout 5 wscat -c "$SERVER_URL" -x 2>/dev/null && \
        echo "Client $client_id: Connected and joined room" || \
        echo "Client $client_id: Connection failed"
}

# Run clients in parallel
for i in $(seq 1 $NUM_CLIENTS); do
    simulate_client $i &
done

# Wait for all clients
wait

echo ""
echo "Network test complete!"
echo "Check server logs for connection details."
