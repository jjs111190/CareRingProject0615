#!/bin/bash

echo "🚀 Starting Vite Frontend with LocalTunnel..."

# 1. 프론트엔드 dev 서버 백그라운드 실행
echo "🔧 Starting Vite dev server on port 5177..."
npm run dev &

# 2. localtunnel 노출 대기 (2초 지연, 서버가 켜질 시간)
sleep 2

# 3. LocalTunnel 실행
echo "🌐 Starting LocalTunnel at https://mycarering.loca.lt..."
npx localtunnel --port 5177 --subdomain care