# Embedding Service Integration

This document describes the embedding service integration for semantic search of alumni profiles.

## Overview

The embedding service allows you to:
1. Convert text queries into embeddings (vector representations)
2. Generate embeddings for each alumni profile (combining bio, experience, etc.)
3. Search for similar alumni based on semantic similarity

## Architecture

- **Python Flask Service** (`backend/embedding-service/app.py`): Runs on port 5001, uses `sentence-transformers` to generate embeddings
- **Java Spring Service** (`EmbeddingService.java`): Calls the Flask service and manages embeddings
- **REST Controller** (`EmbeddingController.java`): Exposes endpoints for embedding operations

## Setup

### 1. Start the Python Embedding Service

```bash
cd backend/embedding-service

# Install dependencies (first time only)
pip install flask sentence-transformers

# Run the service
python app.py
```

The service will start on `http://localhost:5001`

### 2. Start the Spring Boot Backend

Make sure your Spring Boot application is running. It will automatically connect to the embedding service.

## API Endpoints

### 1. Check Embedding Service Health

```http
GET /api/v1/embedding/health
```

Response:
```json
{
  "embeddingServiceAvailable": true,
  "status": "OK"
}
```

### 2. Generate Embedding for Text

```http
POST /api/v1/embedding/generate
Content-Type: application/json

{
  "text": "Software engineer with experience in Java and Spring Boot"
}
```

Response:
```json
{
  "embedding": [0.123, -0.456, 0.789, ...]
}
```

### 3. Get Alumni Profile Embedding

```http
GET /api/v1/embedding/alumni/{enrollmentNumber}
```

Response:
```json
{
  "enrollmentNumber": "AL-2019-001",
  "name": "Rohit Mehta",
  "description": "Name: Rohit Mehta. Department: Computer Science. ...",
  "embedding": [0.123, -0.456, 0.789, ...]
}
```

### 4. Search for Similar Alumni

```http
POST /api/v1/embedding/search
Content-Type: application/json

{
  "query": "I need a mentor with experience in machine learning and Python",
  "topK": 10
}
```

Response:
```json
{
  "query": "I need a mentor with experience in machine learning and Python",
  "resultsCount": 10,
  "results": [
    {
      "alumni": {
        "enrollmentNumber": "AL-2019-001",
        "name": "Rohit Mehta",
        "department": "Computer Science",
        ...
      },
      "similarity": 0.856
    },
    ...
  ]
}
```

### 5. Batch Generate Embeddings for All Alumni

```http
POST /api/v1/embedding/batch-generate
```

This endpoint processes all alumni and stores their embeddings in the database for faster future searches.

Response:
```json
{
  "message": "Successfully generated embeddings for all alumni",
  "count": 20,
  "embeddings": {
    "AL-2019-001": [0.123, -0.456, ...],
    "AL-2020-002": [0.234, -0.567, ...],
    ...
  }
}
```

### 6. Refresh Alumni Embedding

```http
POST /api/v1/embedding/alumni/{enrollmentNumber}/refresh
```

Regenerates and updates the stored embedding for a specific alumni. Use this after profile updates.

### 7. Get Alumni Description

```http
GET /api/v1/embedding/alumni/{enrollmentNumber}/description
```

Gets the text description used for generating embeddings (useful for debugging).

## How It Works

### Alumni Profile Description

The system generates a description for each alumni by combining:
- Name
- Department
- Passing Year
- Employment Status
- Bio
- Experience details (job titles, companies, locations)

Example description:
```
Name: Rohit Mehta. Department: Computer Science. Passing Year: 2019. 
Employment Status: EMPLOYED. Bio: Passionate software engineer interested in AI. 
Experience: Senior Software Engineer at Google in Mountain View. 
Software Engineer at Microsoft in Seattle.
```

### Embedding Generation

1. The description is sent to the Python service
2. The `sentence-transformers` model converts it to a 384-dimensional vector
3. This vector captures the semantic meaning of the profile

### Similarity Search

1. Query text is converted to an embedding
2. Each alumni profile embedding is compared using cosine similarity
3. Results are ranked by similarity score (0 to 1, higher is more similar)
4. Top K most similar profiles are returned

### Performance Optimization

- Embeddings are stored in the `alumni` table as TEXT (JSON array)
- First search computes and stores embeddings
- Subsequent searches use stored embeddings (much faster)
- Use `/batch-generate` to pre-compute all embeddings
- Use `/refresh` endpoint after profile updates

## Configuration

Add to `application.properties`:

```properties
# Embedding service URL (default: http://localhost:5001)
embedding.service.url=http://localhost:5001
```

## Database Schema

The `alumni` table has been extended with:

```sql
ALTER TABLE alumni ADD COLUMN embedding_vector TEXT;
```

This column stores the embedding as a JSON array of doubles.

## Usage Examples

### Example 1: Find Alumni with Specific Skills

```javascript
// Frontend code
const searchAlumni = async (query) => {
  const response = await fetch('http://localhost:8080/api/v1/embedding/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query,
      topK: 10
    })
  });
  return await response.json();
};

// Search for alumni
const results = await searchAlumni("machine learning expert with Python experience");
```

### Example 2: Pre-compute All Embeddings

```bash
# Call the batch endpoint to pre-compute all embeddings
curl -X POST http://localhost:8080/api/v1/embedding/batch-generate
```

### Example 3: Update Profile and Refresh Embedding

```javascript
// After updating alumni profile
const updateAndRefresh = async (enrollmentNumber, updates) => {
  // Update profile
  await fetch(`http://localhost:8080/api/v1/alumni/${enrollmentNumber}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  // Refresh embedding
  await fetch(`http://localhost:8080/api/v1/embedding/alumni/${enrollmentNumber}/refresh`, {
    method: 'POST'
  });
};
```

## Troubleshooting

### Embedding Service Not Available

If you get "Embedding service is not available" error:

1. Check if Python service is running: `curl http://localhost:5001/health`
2. Make sure port 5001 is not blocked
3. Verify Flask and sentence-transformers are installed

### First Request is Slow

The first request downloads the embedding model (~380MB). This is a one-time operation. Subsequent requests are fast (~50ms per embedding).

### Out of Memory

If the Python service runs out of memory, try:
- Using a smaller model (current: `all-MiniLM-L6-v2`)
- Reducing batch size
- Increasing Python process memory limit

## Model Information

- **Model**: `all-MiniLM-L6-v2`
- **Embedding Size**: 384 dimensions
- **Speed**: ~1000 sentences/second on CPU
- **Quality**: Good for semantic search tasks
- **License**: Apache 2.0

## Future Enhancements

1. Add caching layer for frequently searched queries
2. Implement batch embedding generation for better performance
3. Add support for filtering (e.g., by department, passing year)
4. Implement approximate nearest neighbor search for larger datasets
5. Add embedding versioning to track when profiles were last embedded
6. Support for multi-modal embeddings (text + skills + experience)
