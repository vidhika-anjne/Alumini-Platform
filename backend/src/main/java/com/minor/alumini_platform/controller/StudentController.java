package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.service.StudentService;
import com.minor.alumini_platform.util.OtpUtil;
import com.minor.alumini_platform.service.EmailService;
import com.minor.alumini_platform.otp.OtpStorage;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@RestController
@RequestMapping("api/v1/students")
public class StudentController {

    private final StudentService studentService;
    private final EmailService emailService;
    private final OtpStorage otpStorage;

    private final Map<String, Student> pendingStudents = new ConcurrentHashMap<>();


    public StudentController(StudentService studentService,  EmailService emailService, OtpStorage otpStorage) {
        this.studentService = studentService;
        this.emailService = emailService;
        this.otpStorage = otpStorage;
    }

    // Student registration
    // @PostMapping("/register")
    // public Student registerStudent(@RequestBody Student student) {
    // return studentService.registerStudent(student);
    // }

    @PostMapping("/register")
    public String registerStudent(@RequestBody Student student) {
        // Generate OTP
        String otp = OtpUtil.generateOtp(6);

        // Save OTP linked with student email
        otpStorage.saveOtp(student.getEmail(), otp);

        // Send OTP to email
        emailService.sendOtpEmail(student.getEmail(), otp);

        // Temporarily store student object (in memory or map) until OTP is verified
        pendingStudents.put(student.getEmail(), student);

        return "📩 OTP sent to " + student.getEmail() + ". Please verify to complete registration.";
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam String email, @RequestParam String otp) {
        if (otpStorage.validateOtp(email, otp)) {
            Student student = pendingStudents.get(email);

            if (student != null) {
                studentService.registerStudent(student); // now persist
                otpStorage.clearOtp(email);
                pendingStudents.remove(email);
                return "✅ Registration complete for " + student.getName();
            } else {
                return "⚠️ No student data found for this email.";
            }
        }
        return "❌ Invalid or expired OTP!";
    }

    // View all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    // Student login
    @PostMapping("/login")
    public String loginStudent(@RequestParam String enrollmentNumber, @RequestParam String password) {
        Student student = studentService.loginStudent(enrollmentNumber, password);
        if (student != null) {
            return "✅ Login successful! Welcome " + student.getName();
        } else {
            return "❌ Invalid username or password";
        }
    }

    // Find student by enrollment number
    @GetMapping("/{enrollmentNumber}")
    public Student getStudentByEnrollmentNumber(@PathVariable String enrollmentNumber) {
        return studentService.getStudentByEnrollmentNumber(enrollmentNumber);
    }

    @GetMapping("/{enrollmentNumber}/skills")
    public List<String> getStudentSkills(@PathVariable String enrollmentNumber) {
        return studentService.getStudentSkills(enrollmentNumber);
    }

}
