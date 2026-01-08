package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.service.StudentService;
import com.minor.alumini_platform.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/students")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class StudentController {

    private final StudentService studentService;
    private final JwtUtil jwtUtil;

    public StudentController(StudentService studentService, JwtUtil jwtUtil) {
        this.studentService = studentService;
        this.jwtUtil = jwtUtil;
    }

    // Student registration
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerStudent(@RequestBody Student student) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Validate required fields
            if (student.getEnrollmentNumber() == null || student.getEnrollmentNumber().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Enrollment number is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (student.getName() == null || student.getName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Name is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (student.getEmail() == null || student.getEmail().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (student.getPassword() == null || student.getPassword().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check if student already exists
            if (studentService.getStudentByEnrollmentNumber(student.getEnrollmentNumber()) != null) {
                response.put("success", false);
                response.put("message", "Student with this enrollment number already exists");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Set default values for optional fields
            if (student.getPassingYear() == null) {
                student.setPassingYear(2024); // Default year
            }
            
            Student savedStudent = studentService.registerStudent(student);
            response.put("success", true);
            response.put("message", "Student registered successfully");
            response.put("student", savedStudent);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Student login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginStudent(@RequestBody Map<String, String> loginRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String enrollmentNumber = loginRequest.get("enrollmentNumber");
            String password = loginRequest.get("password");
            
            if (enrollmentNumber == null || password == null) {
                response.put("success", false);
                response.put("message", "Enrollment number and password are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Student student = studentService.loginStudent(enrollmentNumber, password);
            if (student != null) {
                String token = jwtUtil.generateToken(student.getEnrollmentNumber(), "STUDENT");
                response.put("success", true);
                response.put("message", "Login successful! Welcome " + student.getName());
                response.put("token", token);
                response.put("student", student);
                response.put("userType", "student");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Invalid enrollment number or password");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // View all students
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllStudents() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Student> students = studentService.getAllStudents();
            response.put("success", true);
            response.put("students", students);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch students: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Find student by enrollment number
    @GetMapping("/{enrollmentNumber}")
    public ResponseEntity<Map<String, Object>> getStudentByEnrollmentNumber(@PathVariable String enrollmentNumber) {
        Map<String, Object> response = new HashMap<>();
        try {
            Student student = studentService.getStudentByEnrollmentNumber(enrollmentNumber);
            if (student != null) {
                response.put("success", true);
                response.put("student", student);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Student not found with enrollment number: " + enrollmentNumber);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch student: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Get student skills
    @GetMapping("/{enrollmentNumber}/skills")
    public ResponseEntity<Map<String, Object>> getStudentSkills(@PathVariable String enrollmentNumber) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<String> skills = studentService.getStudentSkills(enrollmentNumber);
            response.put("success", true);
            response.put("skills", skills);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch student skills: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Update student profile
    @PatchMapping("/{enrollmentNumber}")
    public ResponseEntity<Map<String, Object>> updateStudent(@PathVariable String enrollmentNumber, @RequestBody Student student) {
        Map<String, Object> response = new HashMap<>();
        try {
            Student existingStudent = studentService.getStudentByEnrollmentNumber(enrollmentNumber);
            if (existingStudent == null) {
                response.put("success", false);
                response.put("message", "Student not found");
                return ResponseEntity.notFound().build();
            }
            
            // Merge updates
            if (student.getName() != null) existingStudent.setName(student.getName());
            if (student.getEmail() != null) existingStudent.setEmail(student.getEmail());
            if (student.getBio() != null) existingStudent.setBio(student.getBio());
            if (student.getSkills() != null) existingStudent.setSkills(student.getSkills());
            if (student.getPassingYear() != null) existingStudent.setPassingYear(student.getPassingYear());
            if (student.getPassword() != null) existingStudent.setPassword(student.getPassword());

            Student updated = studentService.updateStudent(existingStudent);
            response.put("success", true);
            response.put("student", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
