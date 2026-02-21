# AI Search Frontend - Usage Guide

## 🎯 Overview
The AI-Powered Alumni Search feature allows users to search for alumni using natural language queries. The system uses semantic understanding to match queries with alumni profiles based on their skills, experience, and expertise.

## ✨ Features

### 🔍 Natural Language Search
- Search using conversational queries like:
  - "I need a mentor in machine learning and AI"
  - "Looking for full-stack developers with React experience"
  - "Blockchain and cryptocurrency experts"
  - "Data scientists skilled in Python"

### 📊 Smart Matching
- **Similarity Scores**: Each result shows a match percentage (0-100%)
- **Match Quality Labels**:
  - 🟢 Excellent Match (70%+)
  - 🔵 Good Match (50-69%)
  - 🟡 Fair Match (30-49%)
  - ⚫ Low Match (<30%)

### 👤 Profile Integration
- **View Profile**: Click to view full alumni profile
- **Connect Button**: Send connection requests directly from search results
- **Connection Status**: Shows current status (Connected/Pending/None)

### 💡 Example Queries
The interface provides 8 example queries to inspire users:
1. I need a mentor in machine learning and AI
2. Looking for full-stack developers with React experience
3. Blockchain and cryptocurrency experts
4. Data scientists skilled in Python
5. Cybersecurity and ethical hacking specialists
6. Mobile app developers with Flutter
7. Cloud architects with AWS experience
8. IoT and embedded systems engineers

## 🚀 Getting Started

### Prerequisites
1. **Backend Service**: Spring Boot application running on port 8080
2. **Embedding Service**: Python Flask service running on port 5001
   ```bash
   cd backend/embedding-service
   python app.py
   ```
3. **Frontend**: React app with dependencies installed
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### First Time Setup

1. **Generate Alumni Embeddings**:
   Before using AI Search, you need to generate embeddings for all alumni:
   
   ```bash
   # Option 1: Using curl
   curl -X POST http://localhost:8080/api/v1/embedding/batch-generate \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Option 2: Using Postman
   POST http://localhost:8080/api/v1/embedding/batch-generate
   Headers: Authorization: Bearer YOUR_TOKEN
   ```

2. **Verify Embeddings**:
   Check if embeddings were generated successfully:
   ```bash
   curl http://localhost:8080/api/v1/embedding/health \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## 📋 How to Use

### Step 1: Navigate to AI Search
- Click on **"🤖 AI Search"** in the navigation bar
- The page will check if the embedding service is available

### Step 2: Enter Your Query
- Type your search query in the search box
- Or click on one of the example queries

### Step 3: View Results
- Results are displayed as cards with:
  - Alumni name, department, and graduation year
  - Bio snippet (first 150 characters)
  - Employment status badge
  - Match percentage and quality label
  - Profile picture or initial avatar

### Step 4: Take Action
- **View Profile**: Click to see full profile details
- **Connect**: Send a connection request (if not already connected)
- Results are sorted by similarity (highest first)

## 🎨 User Interface Components

### Search Bar
- Large input field for natural language queries
- Search button with loading state
- Disabled when service is unavailable

### Example Chips
- Clickable chips with pre-made queries
- Helps users understand what kind of queries work well
- Only shown when no search has been performed

### Results Grid
- Responsive grid layout (2-3 cards per row on desktop)
- Each card shows:
  - Avatar or initial
  - Name and education details
  - Bio snippet
  - Current status
  - Match score visualization
  - Action buttons

### Match Score Circle
- Circular progress indicator
- Color-coded border based on match quality
- Percentage displayed inside

### Connection Status
- **Connect Button**: Green, available for new connections
- **Pending Button**: Yellow, connection request sent
- **Connected Badge**: Green, already connected

## 🔧 Technical Details

### API Integration

**Endpoint**: `POST /api/v1/embedding/search`

**Request**:
```json
{
  "query": "machine learning expert with Python",
  "topK": 10
}
```

**Response**:
```json
{
  "results": [
    {
      "alumni": {
        "enrollmentNumber": "0901CS211050",
        "name": "Rajesh Kumar",
        "department": "Computer Science",
        "passingYear": 2023,
        "bio": "Passionate about Deep Learning...",
        "employmentStatus": "EMPLOYED"
      },
      "similarity": 0.8456
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

### Connection Status Integration
- Fetches connection status for each result
- Uses endpoint: `GET /api/v1/connections/status/{enrollmentNumber}`
- Automatically hides Connect button for current user's own profile

### Service Health Check
- Checks embedding service availability on page load
- Shows warning if service is down
- Disables search functionality when unavailable

## 🎯 Best Practices

### Writing Good Queries

✅ **Good Queries**:
- "Machine learning engineer with TensorFlow experience"
- "Full-stack developer skilled in React and Node.js"
- "Data scientist with expertise in statistical analysis"
- "iOS developer proficient in Swift"

❌ **Poor Queries**:
- "programmer" (too vague)
- "someone who codes" (lacks specificity)
- "2023" (just year, no context)

### Tips for Better Results
1. **Be Specific**: Include specific skills, technologies, or domains
2. **Use Natural Language**: Write as you would speak
3. **Combine Keywords**: Mix technologies, roles, and expertise areas
4. **Check Match Scores**: Focus on results with 50%+ match for best relevance

## 🐛 Troubleshooting

### "AI Search service is currently unavailable"
**Cause**: Python embedding service (Flask) is not running

**Solution**:
```bash
cd backend/embedding-service
pip install -r requirements.txt
python app.py
```

### "No matching alumni found"
**Causes**:
1. No embeddings generated for alumni
2. Query too specific or uses uncommon terms

**Solutions**:
1. Run batch-generate endpoint
2. Try broader or alternative queries
3. Use example queries as reference

### Connection button not working
**Causes**:
1. Not authenticated
2. Already connected
3. Backend connection service issue

**Solutions**:
1. Log in again
2. Check connection status on profile page
3. Check backend logs

### Results show 0% similarity
**Cause**: Embeddings not properly generated

**Solution**:
```bash
# Clear and regenerate all embeddings
curl -X POST http://localhost:8080/api/v1/embedding/regenerate-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📱 Responsive Design

### Desktop (>768px)
- Results in 2-3 column grid
- Horizontal search bar and button
- Side-by-side profile info and match score

### Mobile (<768px)
- Single column layout
- Stacked search input and button
- Vertical card layout

## 🔐 Authentication

- All AI Search features require authentication
- Token automatically added to requests via Axios interceptor
- Redirects to login if token expires
- Connection features only available to authenticated users

## 🎨 Color Coding

### Match Quality
- 🟢 Green (#10b981): Excellent Match (70%+)
- 🔵 Blue (#3b82f6): Good Match (50-69%)
- 🟡 Orange (#f59e0b): Fair Match (30-49%)
- ⚫ Gray (#6b7280): Low Match (<30%)

### Employment Status
- 🟢 Green: Employed
- 🔵 Blue: Seeking Opportunities
- 🟡 Yellow: Student
- 🟣 Purple: Entrepreneur

## 📈 Performance

- **Search Time**: 200-500ms (with cached embeddings)
- **First Load**: 1-2 seconds (embedding service initialization)
- **Results**: Up to 10 alumni per search
- **Connection Check**: Parallel requests for better performance

## 🔄 Updates and Maintenance

### When to Regenerate Embeddings
- After adding new alumni to the database
- After significant bio updates for multiple alumni
- If search results seem inaccurate

### How to Regenerate
```bash
# Clear and regenerate all
POST /api/v1/embedding/regenerate-all

# Generate for specific alumni
POST /api/v1/embedding/alumni/{enrollmentNumber}/refresh
```

## 🎓 Next Steps

1. **Test the Feature**: Try various search queries
2. **Explore Results**: Check match scores and relevance
3. **Connect with Alumni**: Use the connect button
4. **Provide Feedback**: Report any issues or suggestions
5. **Generate Embeddings**: Ensure all alumni have embeddings for best results

## 📚 Related Documentation
- `EMBEDDING_SERVICE_README.md` - Backend embedding service details
- `EMBEDDING_TESTING_GUIDE.md` - Testing and validation
- `EMBEDDING_QUICKSTART.md` - Quick setup guide
- `REGENERATE_EMBEDDINGS_GUIDE.md` - Embedding management

---

**Need Help?** Check the health endpoint or backend logs for more details:
```bash
curl http://localhost:8080/api/v1/embedding/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```
