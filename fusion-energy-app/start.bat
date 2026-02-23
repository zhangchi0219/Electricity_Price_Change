@echo off
chcp 65001 >nul
title 便宜电力与核聚变 — 启动中

echo ========================================
echo   便宜电力与核聚变：交互式教学网页
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 启动后端服务器 (http://localhost:3001)
start "后端 Server :3001" cmd /k "cd /d "%~dp0server" && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] 启动前端开发服务器 (http://localhost:5173)
start "前端 Client :5173" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ========================================
echo   服务已启动，请稍候...
echo   前端：http://localhost:5173
echo   后端：http://localhost:3001
echo ========================================
echo.
echo 关闭此窗口不会停止服务，请手动关闭上方两个命令窗口。
echo.
pause
