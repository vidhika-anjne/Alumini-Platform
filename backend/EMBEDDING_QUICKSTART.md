# Embedding Service - Quick Start

## What Was Created

### Python Service (Flask)
- **Location**: `backend/embedding-service/app.py`
- **Port**: 5001
- **Purpose**: Convert text to embeddings using sentence-transformers

### Java Components

#### 1. DTOs
- `EmbeddingRequest.java` - Request for embedding generation
- `EmbeddingResponse.java` - Response with embedding vector
- `AlumniSearchRequest.java` - Request for semantic search
- `AlumniSearchResult.java` - Search result with alumni and similarity score

#### 2. Service
- `EmbeddingService.java` - Core service for:
  - Generating embeddings from text
  - Creating alumni profile descriptions
  - Semantic search across alumni
  - Storing/retrieving embeddings from database

#### 3. Controller
- `EmbeddingController.java` - REST endpoints:
  - `/api/v1/embedding/generate` - Generate embedding
  - `/api/v1/embedding/search` - Search alumni semantically
  - `/api/v1/embedding/alumni/{id}` - Get alumni embedding
  - `/api/v1/embedding/batch-generate` - Pre-compute all
  - `/api/v1/embedding/health` - Check service status

#### 4. Model Update
- Added `embeddingVector` field to `Alumni.java` to cache embeddings

#### 5. Configuration
- `RestTemplateConfig.java` - HTTP client for calling Python service

## Quick Start

### 1. Start Python Service
```bash
cd backend/embedding-service
pip install -r requirements.txt
python app.py
```

### 2. Start Spring Boot
```bash
cd backend
mvn spring-boot:run
```

### 3. Test It
```bash
# Check health
curl http://localhost:8080/api/v1/embedding/health

# Search alumni
curl -X POST http://localhost:8080/api/v1/embedding/search \
  -H "Content-Type: application/json" \
  -d '{"query": "machine learning engineer", "topK": 5}'
```

## Key Features

1. **Semantic Search**: Find alumni by meaning, not just keywords
   - "Python developer" matches "Software Engineer with Python experience"
   
2. **Smart Descriptions**: Automatically combines:
   - Name, department, passing year
   - Bio
   - All work experience

3. **Performance Optimization**:
   - Embeddings cached in database
   - Use batch-generate for initial setup
   - Refresh embeddings after profile updates

4. **Easy Integration**: RESTful API ready for frontend

## API Examples

### Search Similar Alumni
```javascript
POST /api/v1/embedding/search
{
  "query": "I need a mentor in web development",
  "topK": 10
}
```

### Get Alumni Embedding
```javascript
GET /api/v1/embedding/alumni/AL-2019-001
```

### Batch Pre-compute
```javascript
POST /api/v1/embedding/batch-generate
```

## Documentation

- **Full Documentation**: `EMBEDDING_SERVICE_README.md`
- **Testing Guide**: `EMBEDDING_TESTING_GUIDE.md`
- **Python Service**: `embedding-service/README.md`

## Database Migration

The Alumni table now includes:
```sql
ALTER TABLE alumni ADD COLUMN embedding_vector TEXT;
```

This is automatically handled by JPA, but you may need to run this manually if auto-DDL is disabled.

## Next Steps

1. Start both services
2. Run batch-generate to pre-compute embeddings
3. Test search with different queries
4. Integrate into your frontend

## Troubleshooting

- **Service not available**: Make sure Python service is running on port 5001
- **Slow first request**: Model downloads on first use (~380MB, one-time)
- **Empty results**: Ensure alumni have bio/experience data populated

## Technologies Used

- **Python**: Flask, sentence-transformers, numpy
- **Model**: all-MiniLM-L6-v2 (384-dimensional embeddings)
- **Java**: Spring Boot, RestTemplate, Jackson
- **Algorithm**: Cosine similarity for matching
