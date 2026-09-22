#!/usr/bin/env bash
# Builds the unified Doorstep deploy. Vercel's outputDirectory is dist/.
#
# provider/ and customer/ are real Vite apps and get built. admin/ is vanilla
# (no build step) and is copied through as-is. chat/ is NO LONGER a build
# target (Phase 6): Product C became the customer app's Ask tab, so /chat is
# served as a redirect. chat/api/chat.js stays where it is — the root
# api/chat.js re-export points at it, and Vercel only routes functions found
# at the project root. mock-data/ is copied into dist/ so the
# runtime-fetching products (admin/) resolve their relative ../mock-data path
# once deployed. shared/ (tokens, switcher) is copied the same way —
# admin/, provider/, and customer/ all reference it by the absolute path
# /shared/, which only resolves once it sits at the site root alongside them.
set -euo pipefail

rm -rf dist
mkdir -p dist

echo "== chat/ -> /chat redirect (Phase 6: now the customer app's Ask tab) =="
mkdir -p dist/chat
cp chat/redirect.html dist/chat/index.html

echo "== provider/ =="
npm --prefix provider install
npm --prefix provider run build
mkdir -p dist/provider
cp -R provider/dist/. dist/provider/

echo "== admin/ (static, no build) =="
mkdir -p dist/admin
cp -R admin/. dist/admin/
rm -f dist/admin/.gitignore dist/admin/test.mjs

echo "== customer/ =="
npm --prefix customer install
npm --prefix customer run build
mkdir -p dist/customer
cp -R customer/dist/. dist/customer/

echo "== shared/ =="
cp -R shared dist/shared

echo "== mock-data/ =="
cp -R mock-data dist/mock-data

echo "== landing page =="
cp index.html dist/index.html

echo "build.sh done"
