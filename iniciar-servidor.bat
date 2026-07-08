@echo off
echo Iniciando servidor en http://localhost:8080
echo Presiona Ctrl+C para detenerlo.
echo.
wsl -d Ubuntu bash -lc "cd /home/pietro/proyects/freelance/cumple-daira && python3 -m http.server 8080 --bind 0.0.0.0"
