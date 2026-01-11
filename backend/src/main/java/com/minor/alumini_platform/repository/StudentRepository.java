package com.minor.alumini_platform.repository;

import com.minor.alumini_platform.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEnrollmentNumber(String enrollmentNumber);
    Optional<Student> findByEnrollmentNumberAndPassword(String enrollmentNumber, String password);
    Optional<Student> findByEmail(String email);
}
