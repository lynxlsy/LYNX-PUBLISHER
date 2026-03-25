@echo off
chcp 65001 >nul
echo ========================================
echo   LYNX PUBLISHER
echo ========================================
echo.
echo Iniciando aplicação...
echo.

:: Verificar se node_modules existe
if not exist "node_modules" (
    echo ⚠️  Dependências não instaladas!
    echo.
    echo Execute install.bat primeiro para instalar as dependências.
    echo.
    pause
    exit /b 1
)

:: Iniciar aplicação
npm start
