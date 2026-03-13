@echo off
echo ========================================
echo 贪吃蛇游戏 - HTTP服务器启动脚本
echo ========================================
echo.
echo 正在启动服务器...
echo.
echo 服务器将在以下地址运行：
echo 本地访问: http://localhost:8000
echo.
echo 局域网内其他设备可以通过以下地址访问：
echo 请使用你的电脑IP地址替换下面的IP
echo 例如: http://192.168.1.100:8000
echo.
echo 按Ctrl+C可以停止服务器
echo ========================================
echo.

"D:\workspace\python\hello-agents\.venv\Scripts\python.exe" -m http.server 8000

pause
