FROM python:3.9.19-bookworm
WORKDIR /app
EXPOSE 8000/tcp

# Build
COPY requirements.txt ./
RUN pip --no-cache-dir install -r ./requirements.txt

# Mount
COPY . ./

# Run
ENV OPENAI_API_BASE=https://api.openai.com
ENV OPENAI_API_KEY=
ENV OPENAI_API_MODEL=gpt-4-turbo-preview
ENV USE_CACHE=False
ENV FAST_DESIGN_MODE=True
ENV GROQ_API_KEY=
CMD ["python", "server.py", "--port", "8000"]
