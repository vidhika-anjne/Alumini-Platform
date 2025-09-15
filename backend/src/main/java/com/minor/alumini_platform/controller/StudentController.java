package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.service.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    } 

    // Student registration
    @PostMapping("/register")
    public Student registerStudent(@RequestBody Student student) {
        return studentService.registerStudent(student);
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
}
