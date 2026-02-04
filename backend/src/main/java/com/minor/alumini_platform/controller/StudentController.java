package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.dto.StudentStatusCheckResult;
import com.minor.alumini_platform.enums.AlumniDecisionStatus;
import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.service.StudentService;
import com.minor.alumini_platform.security.JwtUtil;
import com.minor.alumini_platform.otp.OtpStorage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/students", "/api/v1/student"})
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class StudentController {

    private final StudentService studentService;
    private final JwtUtil jwtUtil;
    private final OtpStorage otpStorage;

    public StudentController(StudentService studentService, JwtUtil jwtUtil, OtpStorage otpStorage) {
        this.studentService = studentService;
        this.jwtUtil = jwtUtil;
        this.otpStorage = otpStorage;
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
            
            // Validate OTP
            if (student.getOtp() == null || !otpStorage.validateOtp(student.getEmail(), student.getOtp())) {
                response.put("success", false);
                response.put("message", "Invalid or missing OTP");
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
            otpStorage.clearOtp(student.getEmail()); // Clear OTP after success
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
            studentService.validateStudentAccess(enrollmentNumber);
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

    // GET /api/v1/student/status
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStudentStatus(Principal principal) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (principal == null) {
                response.put("success", false);
                response.put("message", "Authentication required");
                return ResponseEntity.status(401).body(response);
            }
            Student student = studentService.getStudentByEnrollmentNumber(principal.getName());
            if (student == null) {
                response.put("success", false);
                response.put("message", "Student not found");
                return ResponseEntity.status(404).body(response);
            }
            StudentStatusCheckResult result = studentService.checkStudentStatus(student, LocalDate.now());
            response.put("success", true);
            response.put("isPastExpectedEndDate", result.isPastExpectedEndDate());
            response.put("shouldPromptForAlumni", result.isShouldPromptForAlumni());
            response.put("expectedEndDate", result.getExpectedEndDate());
            response.put("nextPromptDate", result.getNextPromptDate());
            response.put("alumniDecisionStatus", result.getAlumniDecisionStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error checking status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // POST /api/v1/student/confirm-alumni
    @PostMapping("/confirm-alumni")
    public ResponseEntity<Map<String, Object>> confirmAlumni(Principal principal, @RequestBody(required = false) Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (principal == null) {
                response.put("success", false);
                response.put("message", "Authentication required");
                return ResponseEntity.status(401).body(response);
            }
            Student student = studentService.getStudentByEnrollmentNumber(principal.getName());
            if (student == null) {
                response.put("success", false);
                response.put("message", "Student not found");
                return ResponseEntity.status(404).body(response);
            }

            StudentStatusCheckResult status = studentService.checkStudentStatus(student, LocalDate.now());
            if (!status.isShouldPromptForAlumni()) {
                response.put("success", false);
                response.put("message", "Confirmation not required at this time.");
                return ResponseEntity.badRequest().body(response);
            }

            LocalDate effectiveDate = LocalDate.now();
            if (body != null && body.containsKey("effectiveDate")) {
                effectiveDate = LocalDate.parse(body.get("effectiveDate"));
            }

            Alumni alumni = studentService.convertToAlumni(student, effectiveDate);
            String token = jwtUtil.generateToken(alumni.getEnrollmentNumber(), "ALUMNI");

            response.put("success", true);
            response.put("message", "You are now registered as alumni.");
            response.put("token", token);
            response.put("alumni", alumni);
            response.put("userType", "alumni");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Conversion failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // POST /api/v1/student/delay-alumni
    @PostMapping("/delay-alumni")
    public ResponseEntity<Map<String, Object>> delayAlumni(Principal principal, @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (principal == null) {
                response.put("success", false);
                response.put("message", "Authentication required");
                return ResponseEntity.status(401).body(response);
            }
            Student student = studentService.getStudentByEnrollmentNumber(principal.getName());
            if (student == null) {
                response.put("success", false);
                response.put("message", "Student not found");
                return ResponseEntity.status(404).body(response);
            }

            StudentStatusCheckResult statusCheck = studentService.checkStudentStatus(student, LocalDate.now());
            if (!statusCheck.isPastExpectedEndDate()) {
                response.put("success", false);
                response.put("message", "Delay option is only available after expected end date.");
                return ResponseEntity.badRequest().body(response);
            }

            if (!body.containsKey("nextPromptDate")) {
                response.put("success", false);
                response.put("message", "nextPromptDate is required");
                return ResponseEntity.badRequest().body(response);
            }

            LocalDate nextPromptDate = LocalDate.parse(body.get("nextPromptDate"));
            student.setAlumniDecisionStatus(AlumniDecisionStatus.DELAYED);
            student.setNextPromptDate(nextPromptDate);
            studentService.updateStudent(student);

            response.put("success", true);
            response.put("message", "We will ask you about alumni status again on " + nextPromptDate);
            response.put("nextPromptDate", nextPromptDate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Action failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Delete student account
    @DeleteMapping("/{enrollmentNumber}")
    public ResponseEntity<Map<String, Object>> deleteAccount(@PathVariable String enrollmentNumber) {
        Map<String, Object> response = new HashMap<>();
        try {
            studentService.deleteStudentAccount(enrollmentNumber);
            response.put("success", true);
            response.put("message", "Account deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Deletion failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
