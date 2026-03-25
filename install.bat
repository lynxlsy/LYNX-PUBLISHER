@echo off
chcp 65001 >nul
echo ========================================
echo   LYNX PUBLISHER - INSTALAÇÃO
echo ========================================
echo.

:: Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js primeiro:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js instalado
node --version
echo.

:: Verificar Git
echo [2/4] Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git não encontrado!
    echo.
    echo Por favor, instale o Git primeiro:
    echo https://git-scm.com/downloads
    echo.
    pause
    exit /b 1
)
echo ✓ Git instalado
git --version
echo.

:: Verificar GitHub CLI
echo [3/4] Verificando GitHub CLI...
gh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  GitHub CLI não encontrado!
    echo.
    echo O GitHub CLI é necessário para autenticação.
    echo Por favor, instale em: https://cli.github.com/
    echo.
    echo Deseja continuar mesmo assim? (S/N)
    set /p continue=
    if /i not "%continue%"=="S" exit /b 1
) else (
    echo ✓ GitHub CLI instalado
    gh --version
)
echo.

:: Instalar dependências
echo [4/4] Instalando dependências do projeto...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao instalar dependências!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ INSTALAÇÃO CONCLUÍDA!
echo ========================================
echo.
echo Para iniciar o projeto, execute: start.bat
echo.
pause
