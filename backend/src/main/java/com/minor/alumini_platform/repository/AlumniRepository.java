package com.minor.alumini_platform.repository;

import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlumniRepository extends JpaRepository<Alumni, Long> {
    Optional<Alumni> findByEnrollmentNumber(String enrollmentNumber);
    Optional<Alumni> findByEnrollmentNumberAndPassword(String enrollmentNumber, String password);
    Optional<Alumni> findByEmail(String email);
    Optional<Alumni> findById(Long id);
    List<Alumni> findByNameContainingIgnoreCase(String name);
}

