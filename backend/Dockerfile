FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Update pip and set timeout
RUN pip install --upgrade pip

# Copy requirements first for better caching
COPY requirements.txt .

# Install requirements with increased timeout and retries
RUN pip install --no-cache-dir -r requirements.txt \
    --timeout 60 \
    --retries 5 \
    --default-timeout=60

# Copy the rest of the application
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]