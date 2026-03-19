@echo off
setlocal
set PORT=8000
if not "%~1"=="" set PORT=%~1
python serve.py --host 0.0.0.0 --port %PORT%
endlocal
