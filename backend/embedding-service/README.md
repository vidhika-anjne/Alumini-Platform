# Embedding Service

This Python Flask service provides text embedding generation using sentence-transformers.

## Setup

### Install Dependencies

```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install flask sentence-transformers numpy
```

### Run the Service

```bash
python app.py
```

The service will start on `http://localhost:5001`

## Endpoints

### POST /embed
Generate embedding for text.

Request:
```json
{
  "text": "Your text here"
}
```

Response:
```json
{
  "embedding": [0.123, -0.456, 0.789, ...]
}
```

### GET /health
Check service health.

Response:
```json
{
  "status": "ok"
}
```

## Model

- **Model**: `all-MiniLM-L6-v2`
- **Embedding Dimension**: 384
- **First Run**: Downloads ~380MB model (one-time)
- **Performance**: ~1000 sentences/second on CPU

## Usage Example

```bash
curl -X POST http://localhost:5001/embed \
  -H "Content-Type: application/json" \
  -d '{"text": "Software engineer with Python experience"}'
```
