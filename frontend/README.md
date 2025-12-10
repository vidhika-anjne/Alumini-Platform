# Alumni Platform Frontend

A Flutter frontend application for the Alumni Platform that connects with the Java Spring Boot backend.

## Features

- User Authentication (Login/Register)
- Alumni Directory with Search
- User Profile Management
- Dashboard with Quick Actions
- Responsive Material Design UI

## Project Structure

```
lib/
├── main.dart                 # Application entry point
├── models/                   # Data models
│   ├── alumni.dart          # Alumni model
│   └── user.dart            # User model
├── screens/                  # UI screens
│   ├── auth/                # Authentication screens
│   ├── home/                # Dashboard and home screens
│   ├── profile/             # Profile management
│   └── alumni/              # Alumni directory
├── services/                # API and business logic
│   ├── auth_service.dart    # Authentication service
│   └── alumni_service.dart  # Alumni management service
└── widgets/                 # Reusable UI components
```

## Getting Started

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Dart SDK
- Android Studio / VS Code with Flutter extensions
- Java Spring Boot backend running on localhost:8080

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run the application:
   ```bash
   flutter run
   ```

### Configuration

The app is configured to connect to the backend at `http://localhost:8080/api`. 

To change the backend URL, update the `baseUrl` constant in:
- `lib/services/auth_service.dart`
- `lib/services/alumni_service.dart`

## API Integration

The app integrates with the following backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/alumni` - Fetch all alumni
- `GET /api/alumni/{id}` - Fetch specific alumni
- `POST /api/alumni` - Create new alumni
- `PUT /api/alumni/{id}` - Update alumni
- `DELETE /api/alumni/{id}` - Delete alumni
- `GET /api/alumni/search?q={query}` - Search alumni

## Building for Production

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

### Web
```bash
flutter build web --release
```

## Dependencies

- `flutter` - UI framework
- `http` - HTTP client for API calls
- `provider` - State management
- `shared_preferences` - Local storage
- `flutter_secure_storage` - Secure token storage

## Screenshots

[Add screenshots of the app here]

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request