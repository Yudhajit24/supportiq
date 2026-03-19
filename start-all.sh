#!/bin/bash
set -e

echo "🧹 Killing all existing services..."
for port in 8080 8081 8082 8083 8001 5173; do
  lsof -ti:$port | xargs kill -9 2>/dev/null || true
done
sleep 2

echo "🐳 Starting Docker infrastructure..."
cd /Users/yudhajit/Desktop/New
docker-compose up -d 2>/dev/null

echo "⏳ Waiting for Postgres..."
for i in $(seq 1 30); do
  docker-compose exec -T postgres pg_isready -U supportiq_user -d supportiq &>/dev/null && break
  sleep 2
done
echo "✅ Postgres ready"

echo "🚀 Starting API Gateway (8080)..."
cd /Users/yudhajit/Desktop/New/api-gateway
nohup mvn spring-boot:run -q > /tmp/api-gateway.log 2>&1 &

echo "🚀 Starting Ticket Service (8081)..."
cd /Users/yudhajit/Desktop/New/ticket-service
nohup mvn spring-boot:run -q > /tmp/ticket-service.log 2>&1 &

echo "🚀 Starting Analytics Service (8082)..."
cd /Users/yudhajit/Desktop/New/analytics-service
nohup mvn spring-boot:run -q > /tmp/analytics-service.log 2>&1 &

echo "🚀 Starting Integration Service (8083)..."
cd /Users/yudhajit/Desktop/New/integration-service
nohup mvn spring-boot:run -q > /tmp/integration-service.log 2>&1 &

echo "🤖 Starting AI Service (8001)..."
cd /Users/yudhajit/Desktop/New/ai-service
source venv/bin/activate
nohup python main.py > /tmp/ai-service.log 2>&1 &

echo "🌐 Starting Frontend (5173)..."
cd /Users/yudhajit/Desktop/New/frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &

echo ""
echo "⏳ Waiting 20s for all services to start..."
sleep 20

echo ""
echo "========== SERVICE STATUS =========="
FAIL=0
for port in 8080 8081 8082 8083 8001 5173; do
  if lsof -i :$port -s TCP:LISTEN 2>/dev/null | grep -q LISTEN; then
    echo "✅ Port $port: UP"
  else
    echo "❌ Port $port: DOWN"
    FAIL=1
  fi
done

if [ $FAIL -eq 1 ]; then
  echo ""
  echo "⚠️  Some services failed. Checking logs..."
  for svc in api-gateway ticket-service analytics-service integration-service ai-service frontend; do
    if [ -f /tmp/$svc.log ]; then
      ERRORS=$(grep -i "error\|exception\|failed" /tmp/$svc.log | tail -3)
      if [ -n "$ERRORS" ]; then
        echo ""
        echo "--- $svc errors ---"
        echo "$ERRORS"
      fi
    fi
  done
else
  echo ""
  echo "🎉 ALL SERVICES UP! Open http://localhost:5173"
fi
