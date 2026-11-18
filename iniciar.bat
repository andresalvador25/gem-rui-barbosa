@echo off
title SAM Musical CCB - Localhost
cd /d "%~dp0"
echo ============================================================
echo   SISTEMA DE ADMINISTRACAO MUSICAL - CCB (Vila Rui Barbosa)
echo ============================================================
echo Verificando status do servidor na porta 3000...

netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
  echo [OK] Servidor ativo e operando na porta 3000!
  echo Abrindo no navegador...
  start http://localhost:3000
) else (
  echo Iniciando servidor em http://localhost:3000 ...
  start http://localhost:3000
  node server.js
)

echo.
echo ============================================================
echo  Aplicativo em execucao!
echo  Link direto: http://localhost:3000 (ou http://127.0.0.1:3000)
echo ============================================================
echo.
pause
