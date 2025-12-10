class Alumni {
  final int id;
  final String enrollmentNumber;
  final String name;
  final String email;
  final String password;
  final String passingYear;
  final String department;
  final String? employmentStatus;
  final List<Experience>? experiences;

  Alumni({
    required this.id,
    required this.enrollmentNumber,
    required this.name,
    required this.email,
    required this.password,
    required this.passingYear,
    required this.department,
    this.employmentStatus,
    this.experiences,
  });

  String get fullName => name;

  factory Alumni.fromJson(Map<String, dynamic> json) {
    return Alumni(
      id: json['id'] ?? 0,
      enrollmentNumber: json['enrollmentNumber'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      password: json['password'] ?? '',
      passingYear: json['passingYear'] ?? '',
      department: json['department'] ?? '',
      employmentStatus: json['employmentStatus'],
      experiences: json['experiences'] != null
          ? (json['experiences'] as List)
              .map((e) => Experience.fromJson(e))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'enrollmentNumber': enrollmentNumber,
      'name': name,
      'email': email,
      'password': password,
      'passingYear': passingYear,
      'department': department,
      'employmentStatus': employmentStatus,
      'experiences': experiences?.map((e) => e.toJson()).toList(),
    };
  }
}

class Experience {
  final int? id;
  final String companyName;
  final String position;
  final String startDate;
  final String? endDate;
  final String? description;

  Experience({
    this.id,
    required this.companyName,
    required this.position,
    required this.startDate,
    this.endDate,
    this.description,
  });

  factory Experience.fromJson(Map<String, dynamic> json) {
    return Experience(
      id: json['id'],
      companyName: json['companyName'] ?? '',
      position: json['position'] ?? '',
      startDate: json['startDate'] ?? '',
      endDate: json['endDate'],
      description: json['description'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'companyName': companyName,
      'position': position,
      'startDate': startDate,
      'endDate': endDate,
      'description': description,
    };
  }
}
