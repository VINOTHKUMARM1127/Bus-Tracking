#!/bin/bash

echo "Clearing caches and reinstalling dependencies..."
echo ""

echo "Step 1: Clearing npm cache..."
npm cache clean --force

echo "Step 2: Removing node_modules and cache..."
rm -rf node_modules
rm -rf .expo
rm -f package-lock.json

echo "Step 3: Reinstalling dependencies..."
npm install

echo ""
echo "Done! Now run: npx expo start --clear"

