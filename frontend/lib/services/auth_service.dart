import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/alumni.dart';
import '../models/student.dart';

class AuthService extends ChangeNotifier {
  static const String baseUrl = 'http://localhost:8080/api/v1';
  // static const String baseUrl = 'http://10.64.114.74:8080/';

  Alumni? _currentAlumni;
  Student? _currentStudent;
  String? _userType;
  bool _isLoading = false;

  Alumni? get currentAlumni => _currentAlumni;
  Student? get currentStudent => _currentStudent;
  String? get userType => _userType;
  bool get isLoading => _isLoading;
  bool get isAuthenticated =>
      (_currentAlumni != null || _currentStudent != null);

  dynamic get currentUser => _currentAlumni ?? _currentStudent;

  AuthService() {
    _loadStoredAuth();
  }

  Future<void> _loadStoredAuth() async {
    final prefs = await SharedPreferences.getInstance();
    _userType = prefs.getString('user_type');
    final userJson = prefs.getString('current_user');

    if (userJson != null && _userType != null) {
      if (_userType == 'alumni') {
        _currentAlumni = Alumni.fromJson(json.decode(userJson));
      } else if (_userType == 'student') {
        _currentStudent = Student.fromJson(json.decode(userJson));
      }
    }

    notifyListeners();
  }

  Future<bool> login(String enrollmentNumber, String password) async {
    // Try alumni login first
    bool success = await loginAlumni(enrollmentNumber, password);
    if (success) return true;

    // If alumni login fails, try student login
    return await loginStudent(enrollmentNumber, password);
  }

  Future<bool> loginAlumni(String enrollmentNumber, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/alumni/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'enrollmentNumber': enrollmentNumber,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['alumni'] != null) {
          _currentAlumni = Alumni.fromJson(data['alumni']);
          _userType = 'alumni';

          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('user_type', 'alumni');
          await prefs.setString(
              'current_user', json.encode(_currentAlumni!.toJson()));

          _isLoading = false;
          notifyListeners();
          return true;
        }
      }

      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> loginStudent(String enrollmentNumber, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/students/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'enrollmentNumber': enrollmentNumber,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['student'] != null) {
          _currentStudent = Student.fromJson(data['student']);
          _userType = 'student';

          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('user_type', 'student');
          await prefs.setString(
              'current_user', json.encode(_currentStudent!.toJson()));

          _isLoading = false;
          notifyListeners();
          return true;
        }
      }

      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<Map<String, dynamic>> register(
      String name,
      String email,
      String password,
      String enrollmentNumber,
      String passingYear,
      String department,
      {bool isAlumni = false}) async {
    if (isAlumni) {
      return await registerAlumni(Alumni(
        id: 0,
        enrollmentNumber: enrollmentNumber,
        name: name,
        email: email,
        password: password,
        passingYear: passingYear,
        department: department,
      ));
    } else {
      return await registerStudent(Student(
        id: 0,
        enrollmentNumber: enrollmentNumber,
        name: name,
        password: password,
        status: 'PENDING',
        email: email,
        passingYear: int.tryParse(passingYear),
      ));
    }
  }

  Future<Map<String, dynamic>> registerAlumni(Alumni alumni) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/alumni/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(alumni.toJson()),
      );

      _isLoading = false;
      notifyListeners();

      // Handle both success (200) and error (400, etc.) responses
      try {
        final data = json.decode(response.body);
        return {
          'success': data['success'] ?? (response.statusCode == 200),
          'message': data['message'] ??
              (response.statusCode == 200
                  ? 'Alumni registered successfully!'
                  : 'Registration failed'),
          'requiresOtp': false
        };
      } catch (e) {
        return {
          'success': false,
          'message': 'Registration failed: Invalid response from server',
          'requiresOtp': false
        };
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return {
        'success': false,
        'message':
            'Network error: Unable to connect to server. Please check your connection.',
        'requiresOtp': false
      };
    }
  }

  Future<Map<String, dynamic>> registerStudent(Student student) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/students/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(student.toJson()),
      );

      _isLoading = false;
      notifyListeners();

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': data['success'] ?? true,
          'message': data['message'] ?? 'Student registered successfully!',
          'requiresOtp': false // No OTP required in current implementation
        };
      } else {
        final data = json.decode(response.body);
        return {
          'success': false,
          'message': data['message'] ?? 'Registration failed',
          'requiresOtp': false
        };
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return {
        'success': false,
        'message': 'Network error: $e',
        'requiresOtp': false
      };
    }
  }

  Future<void> logout() async {
    _currentAlumni = null;
    _currentStudent = null;
    _userType = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_type');
    await prefs.remove('current_user');

    notifyListeners();
  }

  Future<Map<String, dynamic>> verifyOtp(String email, String otp) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/students/verify-otp'),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body:
            'email=${Uri.encodeComponent(email)}&otp=${Uri.encodeComponent(otp)}',
      );

      _isLoading = false;
      notifyListeners();

      if (response.statusCode == 200 &&
          response.body.contains('Registration complete')) {
        return {'success': true, 'message': response.body};
      } else {
        return {'success': false, 'message': response.body};
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  Map<String, String> getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }
}
