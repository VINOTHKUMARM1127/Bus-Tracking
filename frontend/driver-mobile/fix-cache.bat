@echo off
echo Clearing caches and reinstalling dependencies...
echo.

echo Step 1: Clearing npm cache...
call npm cache clean --force

echo Step 2: Removing node_modules and cache...
if exist node_modules rmdir /s /q node_modules
if exist .expo rmdir /s /q .expo
if exist package-lock.json del /q package-lock.json

echo Step 3: Reinstalling dependencies...
call npm install

echo.
echo Done! Now run: npx expo start --clear
echo.
pause

