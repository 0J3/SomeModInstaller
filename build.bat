@echo off
del dist /s /f /q
rmdir dist
mkdir dist
pkg . -t node14-win-x64 --out-path ./dist/