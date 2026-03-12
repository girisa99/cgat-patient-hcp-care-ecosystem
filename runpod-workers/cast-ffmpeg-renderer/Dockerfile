FROM nvidia/cuda:12.2.2-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install FFmpeg (with NVENC via CUDA runtime) + Python 3.11 + fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-noto \
    fonts-noto-cjk \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Inter font family (commercial-grade sans-serif)
RUN mkdir -p /usr/share/fonts/truetype/inter && \
    wget -q "https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip" -O /tmp/inter.zip && \
    unzip -q /tmp/inter.zip -d /tmp/inter && \
    find /tmp/inter -name "*.ttf" -exec cp {} /usr/share/fonts/truetype/inter/ \; && \
    rm -rf /tmp/inter /tmp/inter.zip && \
    fc-cache -f -v

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY *.py .

CMD ["python3", "-u", "handler.py"]
