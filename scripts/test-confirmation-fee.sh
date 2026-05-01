#!/bin/bash

# Test script for confirmation fee verification edge function
# This script demonstrates how to test the verify-confirmation-fee function

echo "=== Confirmation Fee Verification Test ==="
echo ""

# Set your Supabase project details
SUPABASE_URL="${SUPABASE_URL:-http://localhost:54321}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-your-anon-key}"

# Test transaction ID and BTC hash (replace with real values for actual testing)
TRANSACTION_ID="${1:-00000000-0000-0000-0000-000000000000}"
BTC_TX_HASH="${2:-sample-btc-transaction-hash}"

echo "Testing with:"
echo "  Supabase URL: $SUPABASE_URL"
echo "  Transaction ID: $TRANSACTION_ID"
echo "  BTC TX Hash: $BTC_TX_HASH"
echo ""

# Make the API call
echo "Making request to verify-confirmation-fee edge function..."
echo ""

curl -X POST "$SUPABASE_URL/functions/v1/verify-confirmation-fee" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"transaction_id\": \"$TRANSACTION_ID\",
    \"confirmation_fee_tx_hash\": \"$BTC_TX_HASH\"
  }" \
  
  | jq '.'

echo ""
echo "=== Test Complete ==="
echo ""
echo "Usage:"
echo "  ./test-confirmation-fee.sh <transaction_id> <btc_tx_hash>"
echo ""
echo "Example:"
echo "  export SUPABASE_URL=https://your-project.supabase.co"
echo "  export SUPABASE_ANON_KEY=your-anon-key"
echo "  ./test-confirmation-fee.sh a1b2c3d4-... abc123def456..."
