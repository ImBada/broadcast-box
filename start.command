#!/bin/bash

# 스크립트가 있는 디렉토리로 이동
cd "$(dirname "$0")"

echo "Current directory: $(pwd)"
echo "Starting development servers..."

# 디렉토리 구조 확인
if [ ! -d "web" ]; then
    echo "Error: web directory not found"
    exit 1
fi

if [ ! -f "go.mod" ]; then
    echo "Error: go.mod file not found"
    exit 1
fi

# web 폴더에서 npm을 백그라운드로 실행
echo "Starting npm server..."
(cd web && npm run dev) &

# 잠시 대기
sleep 2

# Go 애플리케이션 실행
echo "Starting Go application..."
go run .