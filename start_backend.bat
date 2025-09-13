@echo off
set PYTHONPATH=%cd%
set SMARTRENTALS_API_KEY=test123
set DATABASE_URL=sqlite:///./smartrentals.db

.venv\Scripts\python.exe -m uvicorn smartrentals_mvp.app.main:app --reload --port 8000 --log-level debug
