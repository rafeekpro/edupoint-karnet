# Multi-stage Dockerfile for Python/FastAPI Backend
# Supports multiple Python frameworks: FastAPI, Django, Flask

# ===========================================
# Stage 1: Builder
# ===========================================
FROM python:3.11-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY requirements*.txt ./

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# If you have additional requirements files (dev, test, etc.)
# RUN if [ -f requirements-prod.txt ]; then pip install --no-cache-dir -r requirements-prod.txt; fi

# ===========================================
# Stage 2: Runtime
# ===========================================
FROM python:3.11-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY --chown=appuser:appuser . .

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PORT=8000

# Build arguments for versioning
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

# Labels for image metadata
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.title="Backend API" \
      org.opencontainers.image.description="Python Backend API Service"

# Create directory for static files (Django)
RUN mkdir -p /app/staticfiles && chown -R appuser:appuser /app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Switch to non-root user
USER appuser

# Expose port
EXPOSE ${PORT}

# ===========================================
# Entrypoint Scripts for Different Frameworks
# ===========================================

# FastAPI with Uvicorn (Default)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# Django with Gunicorn
# CMD ["gunicorn", "myproject.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "sync", "--worker-connections", "1000"]

# Flask with Gunicorn
# CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "sync"]

# Django with Daphne (for WebSocket support)
# CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "myproject.asgi:application"]

# Custom startup script (uncomment and create start.sh)
# COPY --chown=appuser:appuser start.sh .
# RUN chmod +x start.sh
# CMD ["./start.sh"]