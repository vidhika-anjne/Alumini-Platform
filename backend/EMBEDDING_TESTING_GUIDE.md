# Testing the Embedding Service

This guide walks through testing the embedding service integration.

## Prerequisites

1. MySQL database running with alumni data
2. Python 3.7+ installed
3. Java 11+ and Maven installed

## Step 1: Start the Python Embedding Service

### Option 1: Using the startup script (Windows)
```bash
cd backend/embedding-service
start.bat
```

### Option 2: Manual installation
```bash
cd backend/embedding-service

# Install dependencies
pip install -r requirements.txt

# Start service
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5001
```

### Verify Python Service

Test the health endpoint:
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{"status": "ok"}
```

Test embedding generation:
```bash
curl -X POST http://localhost:5001/embed \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"Software engineer\"}"
```

## Step 2: Start the Spring Boot Backend

```bash
cd backend
mvn spring-boot:run
```

Or if you're using an IDE, run the `AluminiPlatformApplication` class.

## Step 3: Test the Integration

### Test 1: Check Embedding Service Health

```bash
curl http://localhost:8080/api/v1/embedding/health
```

Expected:
```json
{
  "embeddingServiceAvailable": true,
  "status": "OK"
}
```

### Test 2: Generate Embedding for Text

```bash
curl -X POST http://localhost:8080/api/v1/embedding/generate \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"Looking for a Java developer\"}"
```

### Test 3: Get Alumni Description

Replace `AL-2019-001` with an actual enrollment number from your database:

```bash
curl http://localhost:8080/api/v1/embedding/alumni/AL-2019-001/description
```

Expected:
```json
{
  "enrollmentNumber": "AL-2019-001",
  "name": "Rohit Mehta",
  "description": "Name: Rohit Mehta. Department: Computer Science. ..."
}
```

### Test 4: Get Alumni Embedding

```bash
curl http://localhost:8080/api/v1/embedding/alumni/AL-2019-001
```

Expected:
```json
{
  "enrollmentNumber": "AL-2019-001",
  "name": "Rohit Mehta",
  "description": "...",
  "embedding": [0.123, -0.456, ...]
}
```

### Test 5: Search for Similar Alumni

```bash
curl -X POST http://localhost:8080/api/v1/embedding/search \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"software engineer with machine learning experience\", \"topK\": 5}"
```

Expected:
```json
{
  "query": "software engineer with machine learning experience",
  "resultsCount": 5,
  "results": [
    {
      "alumni": {
        "enrollmentNumber": "AL-2019-001",
        "name": "Rohit Mehta",
        ...
      },
      "similarity": 0.78
    },
    ...
  ]
}
```

### Test 6: Batch Generate Embeddings

This will generate and store embeddings for all alumni:

```bash
curl -X POST http://localhost:8080/api/v1/embedding/batch-generate
```

**Note**: This may take a few minutes depending on the number of alumni.

### Test 7: Refresh a Single Alumni Embedding

After updating an alumni profile, refresh their embedding:

```bash
curl -X POST http://localhost:8080/api/v1/embedding/alumni/AL-2019-001/refresh
```

## Testing with Postman

Import this collection to Postman:

### Collection: Alumni Embedding Service

#### 1. Health Check
- Method: GET
- URL: `http://localhost:8080/api/v1/embedding/health`

#### 2. Generate Text Embedding
- Method: POST
- URL: `http://localhost:8080/api/v1/embedding/generate`
- Body (JSON):
```json
{
  "text": "Experienced software developer with 5 years in Java and Spring Boot"
}
```

#### 3. Search Alumni
- Method: POST
- URL: `http://localhost:8080/api/v1/embedding/search`
- Body (JSON):
```json
{
  "query": "I need a mentor in data science and machine learning",
  "topK": 10
}
```

#### 4. Get Alumni Embedding
- Method: GET
- URL: `http://localhost:8080/api/v1/embedding/alumni/AL-2019-001`

#### 5. Batch Generate
- Method: POST
- URL: `http://localhost:8080/api/v1/embedding/batch-generate`

## Frontend Integration

### React/JavaScript Example

```javascript
// Search for alumni
const searchAlumni = async (query) => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/embedding/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        topK: 10
      })
    });
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};

// Usage
const results = await searchAlumni("I need a mentor in web development");
console.log(results);
```

### Search Component Example

```jsx
import React, { useState } from 'react';

function AlumniSemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/embedding/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 10 })
      });
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Find Alumni by Skills & Experience</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., machine learning expert with Python"
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      <div className="results">
        {results.map((result) => (
          <div key={result.alumni.enrollmentNumber} className="result-card">
            <h3>{result.alumni.name}</h3>
            <p>Department: {result.alumni.department}</p>
            <p>Match Score: {(result.similarity * 100).toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlumniSemanticSearch;
```

## Performance Tips

1. **Pre-compute embeddings**: Run batch-generate after importing alumni data
2. **Cache embeddings**: Embeddings are automatically cached in the database
3. **Incremental updates**: Use the refresh endpoint after profile updates
4. **Optimize queries**: More specific queries give better results

## Troubleshooting

### Problem: "Embedding service is not available"

**Solution**:
1. Check if Python service is running: `curl http://localhost:5001/health`
2. Check firewall settings for port 5001
3. Verify Python dependencies are installed

### Problem: First request is very slow

**Solution**: This is normal. The model (~380MB) is downloaded on first use. Subsequent requests are fast.

### Problem: Empty results

**Solution**:
1. Check if alumni have bio or experience data
2. Run batch-generate to ensure embeddings are computed
3. Try more specific or different queries

### Problem: Low similarity scores

**Solution**: This is normal. Scores above 0.5 indicate good matches. The model captures semantic meaning, not exact keyword matches.

## Performance Benchmarks

On a typical machine:

| Operation | Time |
|-----------|------|
| Single embedding generation | 20-50ms |
| Alumni profile embedding | 30-80ms |
| Search (10 alumni, computed) | 500-1000ms |
| Search (10 alumni, cached) | 50-100ms |
| Batch generate (100 alumni) | 2-5 minutes |

## Next Steps

1. Integrate semantic search into your frontend
2. Add filtering by department, passing year, etc.
3. Implement autocomplete for search queries
4. Add search analytics to track popular queries
5. Consider using vector database for larger datasets (e.g., Pinecone, Weaviate)
