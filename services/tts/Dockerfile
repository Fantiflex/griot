FROM python:3.12-slim
WORKDIR /srv
ENV VOICES_DIR=/voices PIP_NO_CACHE_DIR=1
RUN apt-get update && apt-get install -y --no-install-recommends espeak-ng && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
VOLUME ["/voices"]
EXPOSE 5002
HEALTHCHECK --interval=30s --timeout=5s CMD python -c "import urllib.request;urllib.request.urlopen('http://localhost:5002/health')" || exit 1
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5002"]
