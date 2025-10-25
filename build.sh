#!/bin/bash
# Build script for Domain Details Chrome Extension
# Creates a production-ready ZIP file for distribution

set -e  # Exit on error

# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')

# Define output filename
OUTPUT_FILE="domain-details-extension-v${VERSION}.zip"

echo "Building Domain Details Chrome Extension v${VERSION}..."

# Remove old build if it exists
if [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
    echo "Removed old build: $OUTPUT_FILE"
fi

# Create ZIP with production files only
zip -r "$OUTPUT_FILE" \
    manifest.json \
    popup.html \
    popup.css \
    popup.js \
    icons/ \
    -x "*.DS_Store" \
    -x "__MACOSX/*" \
    -x "*.git*"

echo "✓ Build complete: $OUTPUT_FILE"
echo "✓ Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo ""
echo "Next steps:"
echo "1. Test the extension by loading $OUTPUT_FILE in Chrome"
echo "2. Create git tag: git tag -a v${VERSION} -m 'Release v${VERSION}'"
echo "3. Push tag: git push origin v${VERSION}"
echo "4. Upload $OUTPUT_FILE to GitHub Release"
