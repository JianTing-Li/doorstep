#!/usr/bin/env bash
# Builds the unified Doorstep deploy. Vercel's outputDirectory is dist/.
#
# chat/ and provider/ are real Vite apps and get built. admin/ and customer/
# are vanilla (no build step) and are copied through as-is. mock-data/ is
# copied into dist/ so the runtime-fetching products (admin/, customer/)
# resolve their relative ../mock-data path once deployed.
set -euo pipefail

rm -rf dist
mkdir -p dist

echo "== chat/ =="
npm --prefix chat install
npm --prefix chat run build
mkdir -p dist/chat
cp -R chat/dist/. dist/chat/

echo "== provider/ =="
npm --prefix provider install
npm --prefix provider run build
mkdir -p dist/provider
cp -R provider/dist/. dist/provider/

echo "== admin/ (static, no build) =="
mkdir -p dist/admin
cp -R admin/. dist/admin/
rm -f dist/admin/.gitignore dist/admin/test.mjs

echo "== customer/ (static, no build) =="
mkdir -p dist/customer
cp -R customer/. dist/customer/
rm -f dist/customer/.gitignore

echo "== mock-data/ =="
cp -R mock-data dist/mock-data

echo "== landing page =="
cp index.html dist/index.html

echo "build.sh done"
