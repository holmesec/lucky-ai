# Use a high-performance Python image
FROM python:3.12-slim

# Install 'uv' for fast package management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install system dependencies (essential for BERT/Transformers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONPATH="/app/src"

# Copy environment files first (for better caching)
COPY pyproject.toml uv.lock ./

# Install dependencies using the lockfile
# This will install 'pytorch-cpu' as defined in your project
RUN uv sync --frozen --no-dev --no-install-project

# Copy the actual code and configs (Session 3: Configuration)
COPY src/ ./src/
COPY configs/ ./configs/
COPY tasks.py .

# Add the virtual environment to the PATH
ENV PATH="/app/.venv/bin:$PATH"

# ENTRYPOINT allows us to pass Hydra arguments to the container
ENTRYPOINT ["python", "src/lucky_ai/train.py"]