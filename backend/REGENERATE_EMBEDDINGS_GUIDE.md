# Regenerate Embeddings Guide

## Steps to Regenerate All Embeddings with New Bio Data

### Step 1: Update Database with Bio Data

**Option A - If you have existing alumni data:**
```bash
# Connect to MySQL and run the update script
mysql -u root -p alumini_db < backend/src/main/resources/sql/update_alumni_bio.sql
```

**Option B - If you're starting fresh:**
```bash
# Delete old data and insert new data with bio
mysql -u root -p alumini_db < backend/src/main/resources/sql/alumni_data.sql
```

### Step 2: Make Sure Both Services Are Running

**Terminal 1 - Python Embedding Service:**
```bash
cd backend/embedding-service
python app.py
```

**Terminal 2 - Spring Boot Backend:**
```bash
cd backend
mvn spring-boot:run
```

### Step 3: Regenerate All Embeddings

**Option A - Using the new endpoint (Recommended):**
```bash
curl -X POST http://localhost:8080/api/v1/embedding/regenerate-all
```

This will:
1. Clear all old embeddings
2. Generate new embeddings with bio data
3. Store them in the database

**Option B - Just clear embeddings:**
```bash
curl -X DELETE http://localhost:8080/api/v1/embedding/clear-all
```

**Option C - Just generate embeddings (without clearing):**
```bash
curl -X POST http://localhost:8080/api/v1/embedding/batch-generate
```

### Step 4: Verify New Embeddings

**Check if embeddings were generated:**
```bash
# Get embedding for a specific alumni
curl http://localhost:8080/api/v1/embedding/alumni/AL-2019-001

# Check their description
curl http://localhost:8080/api/v1/embedding/alumni/AL-2019-001/description
```

**Test semantic search with new bio data:**
```bash
curl -X POST http://localhost:8080/api/v1/embedding/search \
  -H "Content-Type: application/json" \
  -d '{"query": "machine learning expert", "topK": 5}'
```

Expected result: Should find Rohit Mehta (AL-2019-001) at the top since his bio mentions ML and AI.

```bash
curl -X POST http://localhost:8080/api/v1/embedding/search \
  -H "Content-Type: application/json" \
  -d '{"query": "web developer frontend React", "topK": 5}'
```

Expected results:
- Neha Gupta (full-stack with React)
- Mehul Arora (web dev and frontend)

```bash
curl -X POST http://localhost:8080/api/v1/embedding/search \
  -H "Content-Type: application/json" \
  -d '{"query": "blockchain cryptocurrency", "topK": 3}'
```

Expected result: Should find Simran Kaur (blockchain developer).

### Step 5: Verify in Database

```sql
-- Check how many alumni have embeddings
SELECT COUNT(*) as total_alumni,
       SUM(CASE WHEN embedding_vector IS NOT NULL THEN 1 ELSE 0 END) as with_embeddings,
       SUM(CASE WHEN bio IS NOT NULL THEN 1 ELSE 0 END) as with_bio
FROM alumni;

-- Check specific alumni
SELECT enrollment_number, name, 
       LENGTH(bio) as bio_length,
       LENGTH(embedding_vector) as embedding_length
FROM alumni
WHERE enrollment_number IN ('AL-2019-001', 'AL-2020-002', 'AL-2018-016');
```

## New API Endpoints

### 1. Clear All Embeddings
```http
DELETE /api/v1/embedding/clear-all
```

Response:
```json
{
  "message": "All embeddings cleared successfully",
  "clearedCount": 20
}
```

### 2. Regenerate All Embeddings
```http
POST /api/v1/embedding/regenerate-all
```

Response:
```json
{
  "message": "All embeddings cleared and regenerated successfully",
  "clearedCount": 20,
  "generatedCount": 20,
  "status": "success"
}
```

## Performance Notes

- Regenerating 20 alumni embeddings takes approximately 20-40 seconds
- Each embedding generation takes ~1-2 seconds (network + model inference)
- Embeddings are stored as JSON in the database (~12KB per embedding)
- Future searches will use cached embeddings (fast ~50-100ms)

## Troubleshooting

**Problem: "Embedding service is not available"**
- Make sure Python service is running on port 5001
- Test: `curl http://localhost:5001/health`

**Problem: Empty or null embeddings**
- Check if alumni have bio data: `SELECT * FROM alumni WHERE bio IS NULL;`
- Make sure Python service is responding correctly

**Problem: Slow regeneration**
- This is normal - embedding generation requires network calls
- Consider running in background for large datasets
- For 100+ alumni, may take 2-5 minutes

**Problem: Low similarity scores after regeneration**
- This is expected if bio data is diverse
- Scores above 0.5 are good matches
- Try more specific queries that match the bio keywords

## Testing Different Queries

Try these searches to test the new bio data:

```bash
# Find AI/ML experts
curl -X POST http://localhost:8080/api/v1/embedding/search \
  -H "Content-Type: application/json" \
  -d '{"query": "artificial intelligence machine learning", "topK": 3}'

# Find web developers
curl -X POST http://localhost:8080/api/v1/embedding/search \
  -H "Content-Type: application/json" \
  -d '{"query": "web development React Node.js", "topK": 3}'

# Find data scientists
curl -X POST http://localhost:8080/api/v1/embedding/search \
  -H "Content-Type: application/json" \
  -d '{"query": "data science Python analytics", "topK": 3}'

# Find embedded systems engineers
curl -X POST http://localhost:8080/api/v1/embedding/search \
  -H "Content-Type: application/json" \
  -d '{"query": "IoT embedded systems Arduino", "topK": 3}'

# Find cybersecurity experts
curl -X POST http://localhost:8080/api/v1/embedding/search \
  -H "Content-Type: application/json" \
  -d '{"query": "cybersecurity ethical hacking", "topK": 3}'
```
