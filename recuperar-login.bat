@echo off
echo ===== SCRIPT DE RECUPERACAO DO PLANKGYM =====
echo.
echo Este script vai tentar resolver o problema da tela de login em branco
echo.

echo 1. Navegando para o diretorio do frontend...
cd frontend || (
    echo ERRO: Nao foi possivel acessar o diretorio 'frontend'
    goto :error
)

echo.
echo 2. Limpando o cache do Vite...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Cache do Vite removido com sucesso
) else (
    echo O cache do Vite nao foi encontrado
)

echo.
echo 3. Removendo node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo node_modules removido com sucesso
) else (
    echo node_modules nao encontrado
)

echo.
echo 4. Reinstalando dependencias...
call npm install

echo.
echo 5. Verificando arquivos criticos...
if not exist "src\pages\LoginSimples.jsx" (
    echo ALERTA: O arquivo LoginSimples.jsx nao foi encontrado!
)

echo.
echo 6. Iniciando o servidor de desenvolvimento...
start cmd /k "npm run dev"

echo.
echo Processo concluido! Tente acessar:
echo - http://localhost:5173/login            (Pagina de login principal)
echo - http://localhost:5173/login-simples    (Pagina de login simplificada)
echo.

goto :end

:error
echo.
echo Ocorreu um erro durante a execucao do script. Por favor, verifique as mensagens acima.

:end
pause