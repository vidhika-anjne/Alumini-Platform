# Profile Viewing API Documentation

## 📋 Overview
This API provides a unified way to view user profiles for both Alumni and Students. It automatically detects the user type and returns a consistent response format.

## 🎯 Features
- **Unified Profile API**: Single endpoint to get any user's profile
- **Type-Specific Endpoints**: Dedicated endpoints for alumni and students
- **Consistent Response Format**: Same structure for both user types
- **Connection Status Integration**: Works seamlessly with connection system
- **User Existence Check**: Verify if a user exists before operations

---

## 🔌 Backend API Endpoints

### Base URL
```
http://localhost:8080/api/v1/profiles
```

### 1. Get Profile (Universal)
Get any user's profile by enrollment number. Automatically searches both Alumni and Student tables.

**Endpoint**: `GET /api/v1/profiles/{enrollmentNumber}`

**Request**:
```bash
GET http://localhost:8080/api/v1/profiles/0901CS211050
Authorization: Bearer YOUR_TOKEN
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "profile": {
    "id": 1,
    "enrollmentNumber": "0901CS211050",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "department": "Computer Science",
    "bio": "Machine learning enthusiast...",
    "githubUrl": "https://github.com/rajesh",
    "linkedinUrl": "https://linkedin.com/in/rajesh",
    "avatarUrl": "https://example.com/avatar.jpg",
    "userType": "ALUMNI",
    "passingYear": "2023",
    "employmentStatus": "EMPLOYED",
    "experiences": [
      {
        "id": 1,
        "company": "Tech Corp",
        "jobTitle": "Software Engineer",
        "duration": "2 years"
      }
    ]
  }
}
```

**Error Response (404 Not Found)**:
```json
{
  "success": false,
  "message": "Profile not found for enrollment number: 0901CS211050",
  "profile": null
}
```

---

### 2. Get Alumni Profile
Get alumni profile specifically.

**Endpoint**: `GET /api/v1/profiles/alumni/{enrollmentNumber}`

**Request**:
```bash
GET http://localhost:8080/api/v1/profiles/alumni/0901CS211050
Authorization: Bearer YOUR_TOKEN
```

**Response**: Same format as universal endpoint, but only searches Alumni table.

---

### 3. Get Student Profile
Get student profile specifically.

**Endpoint**: `GET /api/v1/profiles/student/{enrollmentNumber}`

**Request**:
```bash
GET http://localhost:8080/api/v1/profiles/student/0901CS221099
Authorization: Bearer YOUR_TOKEN
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "profile": {
    "id": 5,
    "enrollmentNumber": "0901CS221099",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "department": "Computer Science",
    "bio": "Passionate about web development...",
    "githubUrl": "https://github.com/priya",
    "linkedinUrl": "https://linkedin.com/in/priya",
    "avatarUrl": "https://example.com/priya.jpg",
    "userType": "STUDENT",
    "expectedPassingYear": 2025,
    "skills": ["React", "Node.js", "MongoDB"],
    "status": "APPROVED"
  }
}
```

---

### 4. Check User Exists
Verify if a user exists and get their type.

**Endpoint**: `GET /api/v1/profiles/check/{enrollmentNumber}`

**Request**:
```bash
GET http://localhost:8080/api/v1/profiles/check/0901CS211050
Authorization: Bearer YOUR_TOKEN
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "User exists as ALUMNI",
  "profile": null
}
```

**Error Response (404 Not Found)**:
```json
{
  "success": false,
  "message": "User not found",
  "profile": null
}
```

---

## 📊 Profile DTO Structure

### Common Fields (All Users)
| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Database ID |
| `enrollmentNumber` | String | Unique enrollment number |
| `name` | String | Full name |
| `email` | String | Email address |
| `department` | String | Department/Branch |
| `bio` | String | Biography/About |
| `githubUrl` | String | GitHub profile URL |
| `linkedinUrl` | String | LinkedIn profile URL |
| `avatarUrl` | String | Profile picture URL |
| `userType` | String | "ALUMNI" or "STUDENT" |

### Alumni-Specific Fields
| Field | Type | Description |
|-------|------|-------------|
| `passingYear` | String | Year of passing |
| `employmentStatus` | Enum | EMPLOYED, SEEKING_OPPORTUNITIES, STUDENT, ENTREPRENEUR |
| `experiences` | Array | Work experience list |

### Student-Specific Fields
| Field | Type | Description |
|-------|------|-------------|
| `expectedPassingYear` | Integer | Expected graduation year |
| `skills` | Array<String> | List of skills |
| `status` | String | PENDING, APPROVED, REJECTED |

---

## 💻 Frontend Integration

### Installation
The profile API helper is already included:
```javascript
import { getProfile, getAlumniProfile, getStudentProfile, checkUserExists } from '../api/profile'
```

### Usage Examples

#### 1. Get Any User's Profile
```javascript
import { getProfile } from '../api/profile'

const fetchProfile = async (enrollmentNumber) => {
  try {
    const response = await getProfile(enrollmentNumber)
    if (response.success) {
      console.log('Profile:', response.profile)
      console.log('User Type:', response.profile.userType)
    } else {
      console.error('Error:', response.message)
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  }
}
```

#### 2. Get Alumni Profile Only
```javascript
import { getAlumniProfile } from '../api/profile'

const fetchAlumni = async (enrollmentNumber) => {
  try {
    const response = await getAlumniProfile(enrollmentNumber)
    if (response.success) {
      console.log('Alumni:', response.profile)
      console.log('Experiences:', response.profile.experiences)
    }
  } catch (error) {
    console.error('Not an alumni or error:', error)
  }
}
```

#### 3. Get Student Profile Only
```javascript
import { getStudentProfile } from '../api/profile'

const fetchStudent = async (enrollmentNumber) => {
  try {
    const response = await getStudentProfile(enrollmentNumber)
    if (response.success) {
      console.log('Student:', response.profile)
      console.log('Skills:', response.profile.skills)
    }
  } catch (error) {
    console.error('Not a student or error:', error)
  }
}
```

#### 4. Check User Existence
```javascript
import { checkUserExists } from '../api/profile'

const verifyUser = async (enrollmentNumber) => {
  try {
    const response = await checkUserExists(enrollmentNumber)
    if (response.success) {
      console.log('User exists!')
      // response.message will be like "User exists as ALUMNI"
    }
  } catch (error) {
    console.error('User not found:', error)
  }
}
```

#### 5. Complete Profile View Component
```javascript
import { useState, useEffect } from 'react'
import { getProfile, getConnectionStatus, sendConnectionRequest } from '../api/profile'

function ProfileView({ enrollmentNumber }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('NOT_CONNECTED')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile(enrollmentNumber)
        if (response.success) {
          setProfile(response.profile)
          
          // Check connection status
          const status = await getConnectionStatus(enrollmentNumber)
          if (status.connected) setConnectionStatus('CONNECTED')
          else if (status.pending) setConnectionStatus('PENDING')
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [enrollmentNumber])

  const handleConnect = async () => {
    try {
      await sendConnectionRequest(enrollmentNumber)
      setConnectionStatus('PENDING')
      alert('Connection request sent!')
    } catch (error) {
      alert('Failed to send request')
    }
  }

  if (loading) return <div>Loading...</div>
  if (!profile) return <div>Profile not found</div>

  return (
    <div className="profile-card">
      <h1>{profile.name}</h1>
      <p>{profile.department} | {profile.userType}</p>
      <p>{profile.bio}</p>
      
      {profile.userType === 'ALUMNI' && (
        <div>
          <p>Class of {profile.passingYear}</p>
          <p>Status: {profile.employmentStatus}</p>
          {profile.experiences?.map((exp, i) => (
            <div key={i}>
              <strong>{exp.jobTitle}</strong> at {exp.company}
            </div>
          ))}
        </div>
      )}
      
      {profile.userType === 'STUDENT' && (
        <div>
          <p>Expected: {profile.expectedPassingYear}</p>
          <div>
            {profile.skills?.map((skill, i) => (
              <span key={i} className="skill-badge">{skill}</span>
            ))}
          </div>
        </div>
      )}
      
      {connectionStatus === 'NOT_CONNECTED' && (
        <button onClick={handleConnect}>Connect</button>
      )}
      {connectionStatus === 'PENDING' && (
        <button disabled>Request Pending</button>
      )}
      {connectionStatus === 'CONNECTED' && (
        <button disabled>Connected ✓</button>
      )}
    </div>
  )
}
```

---

## 🔐 Authentication
All profile endpoints require authentication via Bearer token:
```javascript
// Token is automatically added by the API client
// Configuration in src/api/client.js
const token = localStorage.getItem('token')
headers: { Authorization: `Bearer ${token}` }
```

---

## 🚨 Error Handling

### Common Errors

#### 404 Not Found
```json
{
  "success": false,
  "message": "Profile not found for enrollment number: XXX",
  "profile": null
}
```

**Possible Causes**:
- User doesn't exist in database
- Enrollment number is incorrect
- User was deleted

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve profile: [error details]",
  "profile": null
}
```

**Possible Causes**:
- Database connection issue
- Server error
- Invalid data format

#### 401 Unauthorized
**Cause**: Missing or invalid authentication token

**Solution**:
```javascript
// Ensure user is logged in
if (!token) {
  navigate('/login')
}
```

---

## 🔄 Integration with Other Features

### Connection System
```javascript
import { getProfile, getConnectionStatus, sendConnectionRequest } from '../api/profile'

// Get profile and connection status together
const loadUserData = async (enrollmentNumber) => {
  const [profileRes, connectionStatus] = await Promise.all([
    getProfile(enrollmentNumber),
    getConnectionStatus(enrollmentNumber)
  ])
  
  return {
    profile: profileRes.profile,
    isConnected: connectionStatus.connected,
    isPending: connectionStatus.pending
  }
}
```

### AI Search Integration
```javascript
// In AISearch.jsx
const handleViewProfile = (alumni) => {
  // Navigate to profile page
  navigate(`/profile/alumni/${alumni.enrollmentNumber}`)
}

// PublicProfile.jsx will use the new unified API automatically
```

---

## 📝 Backend Code Structure

### Files Created
1. **ProfileDTO.java** - Unified profile data transfer object
2. **ProfileResponse.java** - API response wrapper
3. **ProfileService.java** - Business logic for profile operations
4. **ProfileController.java** - REST API endpoints

### Service Methods
```java
// ProfileService.java
public ProfileDTO getProfileByEnrollmentNumber(String enrollmentNumber)
public ProfileDTO getAlumniProfile(String enrollmentNumber)
public ProfileDTO getStudentProfile(String enrollmentNumber)
public boolean userExists(String enrollmentNumber)
public String getUserType(String enrollmentNumber)
```

---

## 🧪 Testing

### Manual Testing with Curl

**Test 1: Get Alumni Profile**
```bash
curl -X GET http://localhost:8080/api/v1/profiles/0901CS211050 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Test 2: Get Student Profile**
```bash
curl -X GET http://localhost:8080/api/v1/profiles/0901CS221099 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Test 3: Check User Exists**
```bash
curl -X GET http://localhost:8080/api/v1/profiles/check/0901CS211050 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Test 4: Non-existent User**
```bash
curl -X GET http://localhost:8080/api/v1/profiles/INVALID123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected: 404 Not Found

---

## 🎨 Frontend Components Using Profile API

### Current Implementations
1. **PublicProfile.jsx** - Main profile viewing page
   - Uses `getProfile()` to load any user's profile
   - Integrates connection status
   - Displays appropriate fields based on userType

2. **AISearch.jsx** - AI-powered alumni search
   - Navigates to PublicProfile on card click
   - Profile API loads the selected user's details

### Recommended Usage
```javascript
// Always use the unified getProfile() unless you specifically need
// to restrict to alumni or students only

import { getProfile } from '../api/profile'

// ✅ Good - works for both
const response = await getProfile(enrollmentNumber)

// ⚠️ Only use if you need type-specific validation
const response = await getAlumniProfile(enrollmentNumber) // Will fail for students
```

---

## 🔧 Configuration

### CORS Settings
The ProfileController allows requests from:
- `http://localhost:3000` (Create React App default)
- `http://127.0.0.1:3000`
- `http://localhost:5173` (Vite default)
- `http://127.0.0.1:5173`

### API Base URL
Default: `http://localhost:8080`

Can be changed in `frontend/src/api/client.js`:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080'
})
```

---

## 📈 Performance Considerations

### Optimizations
1. **Single Query**: Unified API reduces redundant database queries
2. **Lazy Loading**: Fetch profile only when needed
3. **Caching**: Consider implementing client-side cache for frequently viewed profiles
4. **Parallel Requests**: Load profile and connection status simultaneously

### Example: Parallel Loading
```javascript
const [profileData, connectionData] = await Promise.all([
  getProfile(enrollmentNumber),
  getConnectionStatus(enrollmentNumber)
])
```

---

## 🐛 Troubleshooting

### Profile Not Loading
1. Check if backend is running on port 8080
2. Verify enrollment number is correct
3. Check browser console for errors
4. Verify authentication token exists

### Connection Status Not Working
1. Ensure user is authenticated
2. Check if connection service is running
3. Verify enrollment numbers match

### CORS Errors
1. Ensure backend CORS configuration includes your frontend URL
2. Check if port number matches (3000 or 5173)
3. Clear browser cache

---

## 📚 Related Documentation
- [AI Search Frontend Guide](AI_SEARCH_FRONTEND_GUIDE.md)
- [Connection System Documentation](CONNECTION_SYSTEM.md)
- [Authentication Guide](AUTH_GUIDE.md)

---

## 🎯 Next Steps
1. Test the unified profile API with different enrollment numbers
2. Verify both alumni and student profiles load correctly
3. Test connection status integration
4. Implement profile caching if needed
5. Add error boundaries for better error handling

---

**Need Help?** Check the backend logs or browser console for detailed error messages.
