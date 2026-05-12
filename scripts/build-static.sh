#!/usr/bin/env bash
set -euo pipefail

publish_dir="dist"

rm -rf "$publish_dir"
mkdir -p "$publish_dir"

cp ./*.html "$publish_dir"/
cp -R css js "$publish_dir"/

echo "Static frontend ready in $publish_dir"
