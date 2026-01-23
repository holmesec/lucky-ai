FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      git \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY .python-version pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY src/lucky_ai/__init__.py ./lucky_ai/
COPY src/lucky_ai/api.py ./lucky_ai/
COPY src/lucky_ai/model.py ./lucky_ai/
COPY src/lucky_ai/download_model.py ./lucky_ai/

ENV PATH="/app/.venv/bin:$PATH"

ARG WANDB_ARTIFACT="lucky_ai/lucky-ai/lucky_bert:latest"
ENV WANDB_ARTIFACT=${WANDB_ARTIFACT}


RUN --mount=type=secret,id=WANDB_API_KEY,env=WANDB_API_KEY \
    --mount=type=secret,id=WANDB_ENTITY,env=WANDB_ENTITY \
    --mount=type=secret,id=WANDB_PROJECT,env=WANDB_PROJECT \
    python ./lucky_ai/download_model.py


EXPOSE 8080

# Use the shell form to ensure $PORT is handled correctly by Cloud Run
CMD uvicorn lucky_ai.api:app --host 0.0.0.0 --port $PORT
