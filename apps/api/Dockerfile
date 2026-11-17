FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /workspace

COPY packages/contracts/python /workspace/packages/contracts/python
COPY apps/api/requirements.txt /workspace/apps/api/requirements.txt
RUN pip install /workspace/packages/contracts/python \
    && pip install -r /workspace/apps/api/requirements.txt

COPY apps/api/app /workspace/apps/api/app
WORKDIR /workspace/apps/api

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
