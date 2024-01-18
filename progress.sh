#!/usr/bin/env sh

# Run this script to see how many pages are filled in and how many are left. This is an approximation based on the TODO
# messages in existing stubbed out pages. Pass -v or --verbose to get a specific list of pages.
# This script can be deleted once the new website is complete.

verbose='false'
if [ "$1" = '-v' -o "$1" = '--verbose' ]; then
    verbose='true'
fi

repo_dir="$(git rev-parse --show-toplevel)"
page_count="$(find "$repo_dir/docs" "$repo_dir/src" -type f -name '*.md' | wc -l)"
incomplete_pages="$(grep -rl 'TODO' --include '*.md' "$repo_dir/docs" "$repo_dir/src")"
complete_pages="$(grep -rL 'TODO' --include '*.md' "$repo_dir/docs" "$repo_dir/src")"

echo "Total pages: $page_count"

echo "------------"
echo "Complete pages: $(echo "$complete_pages" | grep -vc '^$')"
if [ "$verbose" = 'true' ]; then
    echo "------------"
    echo "$complete_pages"
fi

echo "------------"
echo "Incomplete pages: $(echo "$incomplete_pages" | grep -vc '^$')"
if [ "$verbose" = 'true' ]; then
    echo "------------"
    echo "$incomplete_pages"
fi
