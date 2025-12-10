import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/alumni.dart';
import 'auth_service.dart';

class AlumniService {
  static const String baseUrl = 'http://localhost:8080/api/v1';
  final AuthService _authService;

  AlumniService(this._authService);

  Future<List<Alumni>> getAllAlumni() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/alumni'),
        headers: _authService.getAuthHeaders(),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Alumni.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load alumni: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to load alumni: $e');
    }
  }

  Future<Alumni?> getAlumniById(int id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/alumni/$id'),
        headers: _authService.getAuthHeaders(),
      );

      if (response.statusCode == 200) {
        return Alumni.fromJson(json.decode(response.body));
      } else if (response.statusCode == 404) {
        return null;
      } else {
        throw Exception('Failed to load alumni: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to load alumni: $e');
    }
  }

  Future<Alumni> createAlumni(Alumni alumni) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/alumni'),
        headers: _authService.getAuthHeaders(),
        body: json.encode(alumni.toJson()),
      );

      if (response.statusCode == 201) {
        return Alumni.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to create alumni: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to create alumni: $e');
    }
  }

  Future<Alumni> updateAlumni(int id, Alumni alumni) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/alumni/$id'),
        headers: _authService.getAuthHeaders(),
        body: json.encode(alumni.toJson()),
      );

      if (response.statusCode == 200) {
        return Alumni.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to update alumni: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to update alumni: $e');
    }
  }

  Future<void> deleteAlumni(int id) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/alumni/$id'),
        headers: _authService.getAuthHeaders(),
      );

      if (response.statusCode != 204) {
        throw Exception('Failed to delete alumni: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to delete alumni: $e');
    }
  }

  Future<List<Alumni>> searchAlumni(String query) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/alumni/search?q=${Uri.encodeComponent(query)}'),
        headers: _authService.getAuthHeaders(),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Alumni.fromJson(json)).toList();
      } else {
        throw Exception('Failed to search alumni: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to search alumni: $e');
    }
  }
}
