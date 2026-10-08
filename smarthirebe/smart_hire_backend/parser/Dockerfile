# parser/Dockerfile
FROM python:3.11-slim

# avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# install system build deps (for wheels) and cleanup to keep image small
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libxml2-dev \
      libxslt1-dev \
      zlib1g-dev \
      && rm -rf /var/lib/apt/lists/*

# copy requirements and upgrade pip first (helps resolver)
COPY requirements.txt .

# upgrade pip to latest stable and install python deps
RUN python -m pip install --upgrade pip wheel setuptools && \
    pip install --no-cache-dir -r requirements.txt

# copy app code
COPY app.py .
COPY skills.txt .

# create upload dir
RUN mkdir -p parser_uploads

EXPOSE 7000
CMD ["python", "app.py"]
