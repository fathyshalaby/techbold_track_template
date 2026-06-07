#!/bin/bash

# debug.sh - Start both backend and frontend for debugging sessions

# Exit on error
set -e

# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 Starting techbold Hackathon Debug Session..."

# 1. Start Backend (Python)
echo "📦 Starting Backend (FastAPI)..."
cd "$DIR/backend-py"
if [ ! -d ".venv" ]; then
    echo "⚠️  Virtual environment not found in backend-py/.venv. Please create it first."
    exit 1
fi

source .venv/bin/activate
# Run uvicorn in background
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "✅ Backend started on http://localhost:8000 (PID: $BACKEND_PID)"

# 2. Start Frontend (React + Bun)
echo "🎨 Starting Frontend (Vite + Bun)..."
cd "$DIR/frontend"
# Run bun dev in background
bun run dev &
FRONTEND_PID=$!
echo "✅ Frontend started on http://localhost:5173 (PID: $FRONTEND_PID)"

# Function to kill background processes on exit
cleanup() {
    echo -e "\n🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "-------------------------------------------------------"
echo "Both servers are running. Press Ctrl+C to stop both."
echo "-------------------------------------------------------"

# Keep the script running
wait
