# 1) GPU-enabled base image (CUDA 12.1 runtime)
FROM pytorch/pytorch:2.4.0-cuda12.1-cudnn9-runtime

# 2) Install uv (pin the version once it works for you; "latest" is ok while iterating)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 3) System deps
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app/src

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      git \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 4) Install dependencies deterministically
# Make sure .python-version is in the build context (not ignored)
COPY .python-version pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# 5) Sanity check: prove what torch wheel is inside the image
# (This is the torch that your training will actually use.)
RUN /app/.venv/bin/python -c "import sys, torch; \
print('python:', sys.version.split()[0]); \
print('torch:', torch.__version__); \
print('torch.version.cuda:', torch.version.cuda); \
print('cuda built:', torch.backends.cuda.is_built())"

# 6) Copy code + configs
COPY src/ ./src/
COPY configs/ ./configs/
COPY tasks.py .

ENV PATH="/app/.venv/bin:$PATH"

# 7) Default command (easy to override on Vertex)
CMD ["python", "src/lucky_ai/train.py"]
