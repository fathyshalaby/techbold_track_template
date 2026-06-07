FROM nvidia/cuda:12.4.1-cudnn-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv git build-essential curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace/model
COPY pyproject.toml README.md ./
COPY src ./src
RUN python3 -m pip install --upgrade pip && \
    python3 -m pip install --index-url https://download.pytorch.org/whl/cu124 torch && \
    python3 -m pip install -e ".[train,serve]"

COPY . .
CMD ["make", "train-smoke"]
