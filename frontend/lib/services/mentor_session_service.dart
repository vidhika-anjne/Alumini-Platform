import 'package:http/http.dart' as http;
import 'dart:convert';
import 'auth_service.dart';

class MentorSessionService {
  static const String baseUrl = 'http://localhost:8080/api/v1';
  final AuthService _authService;

  MentorSessionService(this._authService);

  Future<Map<String, dynamic>> bookSession({
    required String studentEnrollment,
    required String alumniEnrollment,
    required DateTime sessionDateTime,
    required int durationMinutes,
    required String topic,
    required String description,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/mentor-sessions/book'),
        headers: _authService.getAuthHeaders(),
        body: json.encode({
          'studentEnrollment': studentEnrollment,
          'alumniEnrollment': alumniEnrollment,
          'sessionDateTime': sessionDateTime.toIso8601String(),
          'durationMinutes': durationMinutes,
          'topic': topic,
          'description': description,
        }),
      );

      final data = json.decode(response.body);
      return data;
    } catch (e) {
      throw Exception('Failed to book session: $e');
    }
  }

  Future<List<dynamic>> getStudentSessions(String enrollmentNumber) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/mentor-sessions/student/$enrollmentNumber'),
        headers: _authService.getAuthHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['sessions'] ?? [];
      } else {
        throw Exception('Failed to load sessions');
      }
    } catch (e) {
      throw Exception('Failed to load sessions: $e');
    }
  }

  Future<List<dynamic>> getAlumniSessions(String enrollmentNumber) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/mentor-sessions/alumni/$enrollmentNumber'),
        headers: _authService.getAuthHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['sessions'] ?? [];
      } else {
        throw Exception('Failed to load sessions');
      }
    } catch (e) {
      throw Exception('Failed to load sessions: $e');
    }
  }

  Future<Map<String, dynamic>> updateSessionStatus(
      int sessionId, String status) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/mentor-sessions/$sessionId/status'),
        headers: _authService.getAuthHeaders(),
        body: json.encode({'status': status}),
      );

      final data = json.decode(response.body);
      return data;
    } catch (e) {
      throw Exception('Failed to update session status: $e');
    }
  }

  Future<Map<String, dynamic>> addMeetingLink(
      int sessionId, String meetingLink) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/mentor-sessions/$sessionId/meeting-link'),
        headers: _authService.getAuthHeaders(),
        body: json.encode({'meetingLink': meetingLink}),
      );

      final data = json.decode(response.body);
      return data;
    } catch (e) {
      throw Exception('Failed to add meeting link: $e');
    }
  }
}
