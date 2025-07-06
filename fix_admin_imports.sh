#!/bin/bash

# The directory containing all admin routes
ADMIN_API_DIR="./src/app/api/admin"

# The correct import statement
CORRECT_IMPORT="import { authOptions } from '@/lib/auth';"

# A pattern to find any variation of the incorrect import
PATTERN_TO_FIND="import { authOptions } from"

echo "--- Searching for admin API files to update ---"

# Find all .js files in the admin API directory
find "$ADMIN_API_DIR" -type f -name "*.js" | while read -r file
do
  # Check if the file contains the incorrect import pattern
  if grep -q "$PATTERN_TO_FIND" "$file"; then
    echo "Updating file: $file"
    # Use awk to find and replace the entire incorrect line
    awk -i inplace -v new_line="$CORRECT_IMPORT" '/import { authOptions } from/ {$0 = new_line} {print}' "$file"
  fi
done

echo "--- Admin import fix complete. ---"
