#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "Sirviendo en http://localhost:8080"
echo "También prueba: http://127.0.0.1:8080"
python3 -m http.server 8080 --bind 0.0.0.0
