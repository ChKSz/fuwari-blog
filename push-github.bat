@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\git-push.ps1" %*
