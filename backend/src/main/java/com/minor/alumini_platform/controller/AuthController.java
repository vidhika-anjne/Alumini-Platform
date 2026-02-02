package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.otp.OtpStorage;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import com.minor.alumini_platform.service.EmailService;
import com.minor.alumini_platform.util.OtpUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class AuthController {

    private final OtpStorage otpStorage;
    private final EmailService emailService;
    private final AlumniRepository alumniRepository;
    private final StudentRepository studentRepository;

    public AuthController(OtpStorage otpStorage, EmailService emailService, 
                          AlumniRepository alumniRepository, StudentRepository studentRepository) {
        this.otpStorage = otpStorage;
        this.emailService = emailService;
        this.alumniRepository = alumniRepository;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, Object> response = new HashMap<>();
        
        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }

        // Check if email already exists in either alumni or student records
        if (alumniRepository.findByEmail(email).isPresent() || studentRepository.findByEmail(email).isPresent()) {
            response.put("success", false);
            response.put("message", "Email is already registered");
            return ResponseEntity.badRequest().body(response);
        }

        String otp = OtpUtil.generateOtp(6);
        otpStorage.saveOtp(email, otp);
        emailService.sendOtpEmail(email, otp);

        response.put("success", true);
        response.put("message", "OTP sent successfully to " + email);
        return ResponseEntity.ok(response);
    }
}
