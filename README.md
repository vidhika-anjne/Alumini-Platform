# Alumni Platform

A comprehensive full-stack Alumni Platform built with Spring Boot backend and Flutter frontend, designed to connect alumni and current students.

## 🚀 Features

- **Student & Alumni Authentication**: Secure login system using enrollment numbers
- **Profile Management**: Comprehensive user profiles with personal and professional information
- **Alumni Directory**: Browse and connect with alumni across different batches and departments
- **Experience Tracking**: Alumni can share their career experiences and professional journey
- **Real-time Chat**: WebSocket-powered messaging system for seamless communication
- **Post Sharing**: Share updates, achievements, and opportunities with the community
- **Responsive Design**: Flutter web application with Material Design 3

## 🛠 Tech Stack

### Backend
- **Framework**: Spring Boot 2.6.15
- **Language**: Java 8
- **Database**: H2 (development), configurable for PostgreSQL/MySQL (production)
- **Authentication**: Custom enrollment-based authentication
- **Real-time**: WebSocket support for chat functionality
- **File Upload**: Cloudinary integration for media management

### Frontend
- **Framework**: Flutter Web
- **Language**: Dart
- **UI**: Material Design 3
- **State Management**: Provider pattern
- **HTTP Client**: Built-in HTTP package for API communication
- **Storage**: SharedPreferences and Secure Storage for session management

## 📁 Project Structure

```
Alumini-Platform/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/minor/alumini_platform/
│   │       ├── chat/          # Chat functionality
│   │       ├── config/        # Configuration classes
│   │       ├── controller/    # REST Controllers
│   │       ├── model/         # JPA Entities
│   │       ├── repository/    # Data Access Layer
│   │       └── service/       # Business Logic Layer
│   ├── src/main/resources/
│   │   └── application.properties  # Application configuration
│   └── pom.xml               # Maven dependencies
│
└── frontend/                  # Flutter Frontend
    ├── lib/
    │   ├── models/           # Data models
    │   ├── screens/          # UI screens
    │   │   ├── auth/        # Authentication screens
    │   │   ├── home/        # Dashboard screens
    │   │   ├── profile/     # Profile management
    │   │   └── alumni/      # Alumni directory
    │   └── services/        # API services
    ├── web/                 # Web-specific files
    └── pubspec.yaml        # Flutter dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Java 8 or higher**
- **Maven 3.6+**
- **Flutter SDK 3.0+**
- **Git**

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies and compile:
   ```bash
   mvn clean compile
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Enable Flutter web (if not already enabled):
   ```bash
   flutter config --enable-web
   ```

3. Get Flutter dependencies:
   ```bash
   flutter pub get
   ```

4. Run the application:
   ```bash
   flutter run -d web-server --web-port=3000
   ```

The frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Database Configuration

The application uses H2 in-memory database for development. For production, update `application.properties`:

```properties
# Production Database (example for PostgreSQL)
spring.datasource.url=jdbc:postgresql://localhost:5432/alumni_platform
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### Cloudinary Configuration

Update the Cloudinary settings in `application.properties`:

```properties
cloudinary.cloud_name=your_cloud_name
cloudinary.api_key=your_api_key
cloudinary.api_secret=your_api_secret
```

### Email Configuration

Configure SMTP settings for email functionality:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```

## 📱 Usage

1. **Registration**: Students and alumni can register using their enrollment numbers
2. **Authentication**: Login with enrollment number and password
3. **Profile Setup**: Complete your profile with personal and professional information
4. **Browse Alumni**: Explore the alumni directory to find and connect with former students
5. **Chat**: Use the real-time messaging system to communicate
6. **Share Posts**: Post updates, job opportunities, and achievements

## 🏗 API Endpoints

### Authentication
- `POST /api/v1/students/register` - Student registration
- `POST /api/v1/alumni/register` - Alumni registration
- `POST /api/v1/students/login` - Student login
- `POST /api/v1/alumni/login` - Alumni login

### Alumni Management
- `GET /api/v1/alumni` - Get all alumni
- `GET /api/v1/alumni/{id}` - Get alumni by ID
- `PUT /api/v1/alumni/{id}` - Update alumni profile

### Student Management
- `GET /api/v1/students` - Get all students
- `GET /api/v1/students/{id}` - Get student by ID
- `PUT /api/v1/students/{id}` - Update student profile

### Chat System
- `GET /api/v1/conversations` - Get user conversations
- `POST /api/v1/messages` - Send message
- WebSocket endpoint: `/ws-chat`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email [support@alumniplatform.com](mailto:support@alumniplatform.com) or create an issue in the repository.

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)
1. Update `application.properties` for production database
2. Set environment variables for sensitive data
3. Build: `mvn clean package`
4. Deploy the JAR file

### Frontend Deployment (Netlify/Vercel/Firebase)
1. Build the web app: `flutter build web`
2. Deploy the `build/web` directory
3. Configure API base URL for production

---

**Made with ❤️ for connecting alumni and students**