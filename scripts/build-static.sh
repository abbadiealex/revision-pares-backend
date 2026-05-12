#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"
publish_dir="$project_root/dist"

cd "$project_root"
rm -rf "$publish_dir"
mkdir -p "$publish_dir"

html_files=(
  "index.html"
  "login.html"
  "dashboard-alumno.html"
  "dashboard-evaluador.html"
  "dashboard-profesor.html"
  "subir-tarea.html"
  "mis-entregas.html"
  "tareas-asignadas.html"
  "evaluar-tarea.html"
  "revision-profesor.html"
  "rubricas.html"
  "usuarios.html"
)

for file in "${html_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required frontend file: $file" >&2
    exit 1
  fi

  cp "$file" "$publish_dir/"
done

asset_dirs=("css" "js" "assets" "img" "images" "fonts" "media")

for dir in "${asset_dirs[@]}"; do
  if [[ -d "$dir" ]]; then
    cp -R "$dir" "$publish_dir/"
  fi
done

find . -maxdepth 1 -type f \( \
  -name "*.ico" -o \
  -name "*.png" -o \
  -name "*.jpg" -o \
  -name "*.jpeg" -o \
  -name "*.svg" -o \
  -name "*.webp" -o \
  -name "*.gif" -o \
  -name "*.avif" -o \
  -name "*.webmanifest" -o \
  -name "robots.txt" \
\) -exec cp {} "$publish_dir/" \;

echo "Static frontend ready in $publish_dir"
find "$publish_dir" -maxdepth 2 -type f | sort
