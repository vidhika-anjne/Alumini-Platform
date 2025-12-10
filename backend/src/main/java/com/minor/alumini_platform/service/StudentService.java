package com.minor.alumini_platform.service;

import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student registerStudent(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentByEnrollmentNumber(String enrollmentNumber) {
        return studentRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
    }

    public Student updateStudent(Student student) {
        return studentRepository.save(student);
    }
    public Student loginStudent(String enrollmentNumber, String password) {
        return studentRepository.findByEnrollmentNumberAndPassword(enrollmentNumber, password)
                .orElse(null);
    }

    public List<String> getStudentSkills(String enrollmentNumber) {
        Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
        if (student != null) {
            return student.getSkills();
        }
        return null;
    }
}

