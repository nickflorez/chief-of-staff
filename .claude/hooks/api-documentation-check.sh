#!/bin/bash
# Hook: Remind to check API documentation before implementing integrations
#
# This hook checks if the current task involves API integration work
# and outputs a reminder to verify the API documentation first.

# Get the tool input from stdin
INPUT=$(cat)

# Check if the edit/write involves API-related files
if echo "$INPUT" | grep -qiE "(api|client|integration|endpoint|graphql|fetch|axios)"; then
  # Output reminder as JSON that Claude will see
  echo "⚠️ API INTEGRATION REMINDER: Before implementing or modifying API code:"
  echo "1. Fetch and read the official API documentation"
  echo "2. Verify the exact response schema/types (don't assume array vs string, etc.)"
  echo "3. Check for nullable fields and edge cases"
  echo "4. Test with a real API call before finalizing code"
fi

# Always exit 0 to allow the operation to proceed
exit 0
