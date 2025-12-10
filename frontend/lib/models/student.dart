class Student {
  final int id;
  final String enrollmentNumber;
  final String name;
  final String password;
  final String status; // PENDING, APPROVED, REJECTED
  final String email;
  final int? passingYear;
  final String? bio;
  final List<String>? skills;

  Student({
    required this.id,
    required this.enrollmentNumber,
    required this.name,
    required this.password,
    required this.status,
    required this.email,
    this.passingYear,
    this.bio,
    this.skills,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id'] ?? 0,
      enrollmentNumber: json['enrollmentNumber'] ?? '',
      name: json['name'] ?? '',
      password: json['password'] ?? '',
      status: json['status'] ?? 'PENDING',
      email: json['email'] ?? '',
      passingYear: json['passingYear'],
      bio: json['bio'],
      skills: json['skills'] != null ? List<String>.from(json['skills']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'enrollmentNumber': enrollmentNumber,
      'name': name,
      'password': password,
      'status': status,
      'email': email,
      'passingYear': passingYear,
      'bio': bio,
      'skills': skills,
    };
  }
}
