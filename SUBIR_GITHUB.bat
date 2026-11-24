@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================================
echo   ENVIANDO SAM MUSICAL CCB PARA O GITHUB (gem-rui-barbosa)
echo ========================================================
echo.
echo Se abrir uma janela do GitHub, clique em "Sign in with your browser" (Entrar com o navegador) para autorizar!
echo.
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/andresalvador25/gem-rui-barbosa.git
git push -u origin main
echo.
echo ========================================================
echo   CONCLUIDO! Agora voce ja pode importar na Vercel!
echo ========================================================
pause
