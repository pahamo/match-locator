#!/bin/bash

# Archive legacy source code files

set -e

ARCHIVE_DIR="src/archive-legacy-$(date +%Y%m%d)"
mkdir -p "$ARCHIVE_DIR"

echo "=== Archiving Legacy Source Code ==="
echo ""

# Move TestSoccersAPIPage
if [ -f "src/pages/TestSoccersAPIPage.tsx" ]; then
  echo "📦 Archiving TestSoccersAPIPage.tsx..."
  mv src/pages/TestSoccersAPIPage.tsx "$ARCHIVE_DIR/"
  echo "   ✅ Archived"
fi

# Move SoccersApiService
if [ -f "src/services/SoccersApiService.ts" ]; then
  echo "📦 Archiving SoccersApiService.ts..."
  mv src/services/SoccersApiService.ts "$ARCHIVE_DIR/"
  echo "   ✅ Archived"
fi

# Move SoccersApiStatus component
if [ -f "src/components/admin/SoccersApiStatus.tsx" ]; then
  echo "📦 Archiving SoccersApiStatus.tsx..."
  mv src/components/admin/SoccersApiStatus.tsx "$ARCHIVE_DIR/"
  echo "   ✅ Archived"
fi

# Move netlify functions for soccersapi
if [ -f "netlify/functions/test-soccersapi.js" ]; then
  echo "📦 Archiving netlify soccersapi functions..."
  mkdir -p "$ARCHIVE_DIR/netlify-functions"
  mv netlify/functions/test-soccersapi.js "$ARCHIVE_DIR/netlify-functions/"
  mv netlify/functions/sync-broadcasts.js "$ARCHIVE_DIR/netlify-functions/" 2>/dev/null || true
  echo "   ✅ Archived"
fi

echo ""
echo "✅ Legacy source code archived to: $ARCHIVE_DIR"
echo ""
echo "⚠️  NOTE: You will need to:"
echo "  1. Remove TestSoccersAPIPage route from App.tsx"
echo "  2. Remove SoccersApiStatus import from admin pages"
echo "  3. Update FeatureFlagControls to remove soccersapi flags"
echo ""
