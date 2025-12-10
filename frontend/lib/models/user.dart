class User {
  final int id;
  final String username;
  final String email;
  final String? firstName;
  final String? lastName;
  final List<String> roles;
  final bool enabled;
  final DateTime? createdAt;

  User({
    required this.id,
    required this.username,
    required this.email,
    this.firstName,
    this.lastName,
    required this.roles,
    required this.enabled,
    this.createdAt,
  });

  String get fullName {
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    }
    return username;
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      firstName: json['firstName'],
      lastName: json['lastName'],
      roles: List<String>.from(json['roles'] ?? []),
      enabled: json['enabled'] ?? false,
      createdAt:
          json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'roles': roles,
      'enabled': enabled,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
