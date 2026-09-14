FROM python:3.12-slim
WORKDIR /app
COPY . .
ENV PYTHONPATH=/app
RUN pip install --no-cache-dir .
EXPOSE 8000
CMD ["./start.sh"]
