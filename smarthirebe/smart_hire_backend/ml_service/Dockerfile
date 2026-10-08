FROM python:3.11-slim

WORKDIR /app

# -------------------------------
# Install dependencies
# -------------------------------
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# -------------------------------
# Copy ALL ml_service files properly
# -------------------------------
COPY . /app/

# -------------------------------
# Run FastAPI server
# -------------------------------
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
