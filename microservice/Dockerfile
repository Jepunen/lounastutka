FROM python:3.11-slim

# Install uv
RUN pip install uv

WORKDIR /app

COPY pyproject.toml .
RUN uv pip install --system .

COPY . .

CMD ["uvicorn", "scraper:app", "--host", "0.0.0.0", "--port", "8100"]
