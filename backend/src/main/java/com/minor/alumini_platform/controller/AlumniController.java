package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.service.AlumniService;
import com.minor.alumini_platform.security.JwtUtil;
import com.minor.alumini_platform.otp.OtpStorage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/alumni")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class AlumniController {

    private final AlumniService alumniService;
    private final JwtUtil jwtUtil;
    private final OtpStorage otpStorage;

    public AlumniController(AlumniService alumniService, JwtUtil jwtUtil, OtpStorage otpStorage) {
        this.alumniService = alumniService;
        this.jwtUtil = jwtUtil;
        this.otpStorage = otpStorage;
    }

    // Alumni registration
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerAlumni(@RequestBody Alumni alumni) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Validate required fields
            if (alumni.getEnrollmentNumber() == null || alumni.getEnrollmentNumber().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Enrollment number is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (alumni.getName() == null || alumni.getName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Name is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (alumni.getEmail() == null || alumni.getEmail().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (alumni.getPassword() == null || alumni.getPassword().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Validate OTP
            if (alumni.getOtp() == null || !otpStorage.validateOtp(alumni.getEmail(), alumni.getOtp())) {
                response.put("success", false);
                response.put("message", "Invalid or missing OTP");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check if alumni already exists
            if (alumniService.getAlumniByEnrollmentNumber(alumni.getEnrollmentNumber()) != null) {
                response.put("success", false);
                response.put("message", "Alumni with this enrollment number already exists");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Set default values for optional fields
            if (alumni.getPassingYear() == null || alumni.getPassingYear().trim().isEmpty()) {
                alumni.setPassingYear("2020"); // Default year
            }
            if (alumni.getDepartment() == null || alumni.getDepartment().trim().isEmpty()) {
                alumni.setDepartment("Computer Science"); // Default department
            }
            
            Alumni savedAlumni = alumniService.registerAlumni(alumni);
            otpStorage.clearOtp(alumni.getEmail()); // Clear OTP after success
            response.put("success", true);
            response.put("message", "Alumni registered successfully");
            response.put("alumni", savedAlumni);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Alumni login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginAlumni(@RequestBody Map<String, String> loginRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String enrollmentNumber = loginRequest.get("enrollmentNumber");
            String password = loginRequest.get("password");
            
            if (enrollmentNumber == null || password == null) {
                response.put("success", false);
                response.put("message", "Enrollment number and password are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Alumni alumni = alumniService.loginAlumni(enrollmentNumber, password);
            if (alumni != null) {
                String token = jwtUtil.generateToken(alumni.getEnrollmentNumber(), "ALUMNI");
                response.put("success", true);
                response.put("message", "Login successful! Welcome " + alumni.getName());
                response.put("token", token);
                response.put("alumni", alumni);
                response.put("userType", "alumni");
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

    // View all alumni
    @GetMapping
    public ResponseEntity<List<Alumni>> getAllAlumni() {
        try {
            List<Alumni> alumni = alumniService.getAllAlumni();
            return ResponseEntity.ok(alumni);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Find alumni by enrollment number
    @GetMapping("/{enrollmentNumber}")
    public Alumni getAlumniByEnrollmentNumber(@PathVariable String enrollmentNumber) {
        return alumniService.getAlumniByEnrollmentNumber(enrollmentNumber);
    }

    // Update optional fields in alumni profile
    @PatchMapping("/{enrollmentNumber}")
    public Alumni updateProfile(@PathVariable String enrollmentNumber, @RequestBody Alumni updates) {
        return alumniService.updateAlumniProfile(enrollmentNumber, updates);
    }

    
}
