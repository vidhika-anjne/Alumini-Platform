package com.minor.alumini_platform.service;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.StudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentService(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Student registerStudent(Student student) {
        try {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
            return studentRepository.save(student);
        } catch (Exception e) {
            if (e.getMessage().contains("Duplicate entry") || e.getMessage().contains("ConstraintViolationException")) {
                if (e.getMessage().contains("enrollment_number")) {
                    throw new RuntimeException("Enrollment number already exists");
                } else if (e.getMessage().contains("email")) {
                    throw new RuntimeException("Email address already exists");
                } else {
                    throw new RuntimeException("Duplicate data found");
                }
            }
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentByEnrollmentNumber(String enrollmentNumber) {
        return studentRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
    }

    public Student updateStudent(Student student) {
        if (student.getPassword() != null && !student.getPassword().startsWith("$2a$")) {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
        }
        return studentRepository.save(student);
    }
    public Student loginStudent(String enrollmentNumber, String password) {
        Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
        if (student != null && passwordEncoder.matches(password, student.getPassword())) {
            return student;
        }
        return null;
    }

    public List<String> getStudentSkills(String enrollmentNumber) {
        Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
        if (student != null) {
            return student.getSkills();
        }
        return null;
    }
}

