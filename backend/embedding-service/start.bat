@echo off
echo Installing Python dependencies for embedding service...
pip install -r requirements.txt
echo.
echo Dependencies installed successfully!
echo.
echo Starting embedding service...
python app.py
