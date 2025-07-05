#!/bin/bash
# The directory where your API routes are located
API_DIR="./src/app/api"
# The correct import statement you want to use
CORRECT_IMPORT="import { authOptions } from '@/lib/auth';"
# A regular expression to find all variations of the incorrect import
# It looks for lines that start with "import", contain "authOptions", "from", and "lib/auth"
PATTERN_TO_FIND="import.*authOptions.*from.*lib/auth.*"
echo "--- Starting Advanced Import Fix ---"
# Use 'find' to locate all .js files and loop through them
find "$API_DIR" -type f -name "*.js" | while read -r file
do
  # Check if the file contains the pattern
  if grep -qE "$PATTERN_TO_FIND" "$file"; then
    echo "Updating file: $file"
    # Use 'sed' to replace the line in-place, creating a .bak file as a backup
    sed -i.bak "s#$PATTERN_TO_FIND#$CORRECT_IMPORT#" "$file"
  fi
done
echo "--- Update Complete ---"
