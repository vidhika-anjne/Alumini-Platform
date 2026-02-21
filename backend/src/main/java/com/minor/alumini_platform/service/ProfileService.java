package com.minor.alumini_platform.service;

import com.minor.alumini_platform.dto.ProfileDTO;
import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service for unified profile viewing across Alumni and Students
 */
@Service
public class ProfileService {

    private final AlumniRepository alumniRepository;
    private final StudentRepository studentRepository;

    public ProfileService(AlumniRepository alumniRepository, StudentRepository studentRepository) {
        this.alumniRepository = alumniRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Get profile by enrollment number - searches both Alumni and Student tables
     * @param enrollmentNumber The enrollment number to search for
     * @return ProfileDTO with unified profile data
     */
    public ProfileDTO getProfileByEnrollmentNumber(String enrollmentNumber) {
        // First try to find in Alumni table
        Optional<Alumni> alumniOpt = alumniRepository.findByEnrollmentNumber(enrollmentNumber);
        if (alumniOpt.isPresent()) {
            return convertAlumniToProfileDTO(alumniOpt.get());
        }

        // If not found in Alumni, try Student table
        Optional<Student> studentOpt = studentRepository.findByEnrollmentNumber(enrollmentNumber);
        if (studentOpt.isPresent()) {
            return convertStudentToProfileDTO(studentOpt.get());
        }

        // Not found in either table
        return null;
    }

    /**
     * Get alumni profile specifically
     * @param enrollmentNumber The enrollment number
     * @return ProfileDTO or null if not found
     */
    public ProfileDTO getAlumniProfile(String enrollmentNumber) {
        Optional<Alumni> alumniOpt = alumniRepository.findByEnrollmentNumber(enrollmentNumber);
        return alumniOpt.map(this::convertAlumniToProfileDTO).orElse(null);
    }

    /**
     * Get student profile specifically
     * @param enrollmentNumber The enrollment number
     * @return ProfileDTO or null if not found
     */
    public ProfileDTO getStudentProfile(String enrollmentNumber) {
        Optional<Student> studentOpt = studentRepository.findByEnrollmentNumber(enrollmentNumber);
        return studentOpt.map(this::convertStudentToProfileDTO).orElse(null);
    }

    /**
     * Convert Alumni entity to ProfileDTO
     */
    private ProfileDTO convertAlumniToProfileDTO(Alumni alumni) {
        ProfileDTO dto = new ProfileDTO();
        dto.setId(alumni.getId());
        dto.setEnrollmentNumber(alumni.getEnrollmentNumber());
        dto.setName(alumni.getName());
        dto.setEmail(alumni.getEmail());
        dto.setDepartment(alumni.getDepartment());
        dto.setBio(alumni.getBio());
        dto.setGithubUrl(alumni.getGithubUrl());
        dto.setLinkedinUrl(alumni.getLinkedinUrl());
        dto.setAvatarUrl(alumni.getAvatarUrl());
        dto.setUserType("ALUMNI");
        
        // Alumni-specific fields
        dto.setPassingYear(alumni.getPassingYear());
        dto.setEmploymentStatus(alumni.getEmploymentStatus());
        dto.setExperiences(alumni.getExperiences());
        
        return dto;
    }

    /**
     * Convert Student entity to ProfileDTO
     */
    private ProfileDTO convertStudentToProfileDTO(Student student) {
        ProfileDTO dto = new ProfileDTO();
        dto.setId(student.getId());
        dto.setEnrollmentNumber(student.getEnrollmentNumber());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setDepartment(student.getDepartment());
        dto.setBio(student.getBio());
        dto.setGithubUrl(student.getGithubUrl());
        dto.setLinkedinUrl(student.getLinkedinUrl());
        dto.setAvatarUrl(student.getAvatarUrl());
        dto.setUserType("STUDENT");
        
        // Student-specific fields
        dto.setExpectedPassingYear(student.getPassingYear());
        dto.setSkills(student.getSkills());
        dto.setStatus(student.getStatus() != null ? student.getStatus().toString() : null);
        
        return dto;
    }

    /**
     * Check if a user exists by enrollment number
     */
    public boolean userExists(String enrollmentNumber) {
        return alumniRepository.findByEnrollmentNumber(enrollmentNumber).isPresent() ||
               studentRepository.findByEnrollmentNumber(enrollmentNumber).isPresent();
    }

    /**
     * Get user type (ALUMNI, STUDENT, or null if not found)
     */
    public String getUserType(String enrollmentNumber) {
        if (alumniRepository.findByEnrollmentNumber(enrollmentNumber).isPresent()) {
            return "ALUMNI";
        }
        if (studentRepository.findByEnrollmentNumber(enrollmentNumber).isPresent()) {
            return "STUDENT";
        }
        return null;
    }
}
