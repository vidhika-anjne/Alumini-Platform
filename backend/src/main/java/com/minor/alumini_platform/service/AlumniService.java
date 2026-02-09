package com.minor.alumini_platform.service;

import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Experience;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.AlumniRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class AlumniService {

    private final AlumniRepository alumniRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;
    private final SearchProfileService searchProfileService;

    public AlumniService(AlumniRepository alumniRepository, PasswordEncoder passwordEncoder, 
                         CloudinaryService cloudinaryService, SearchProfileService searchProfileService) {
        this.alumniRepository = alumniRepository;
        this.passwordEncoder = passwordEncoder;
        this.cloudinaryService = cloudinaryService;
        this.searchProfileService = searchProfileService;
    }

    public Alumni registerAlumni(Alumni alumni) {
        try {
            alumni.setPassword(passwordEncoder.encode(alumni.getPassword()));
            Alumni saved = alumniRepository.save(alumni);
            searchProfileService.syncAlumniProfile(saved.getEnrollmentNumber());
            return saved;
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

    public List<Alumni> getAllAlumni() {
        return alumniRepository.findAll();
    }

    public Alumni getAlumniByEnrollmentNumber(String enrollmentNumber) {
        return alumniRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
    }

    public Alumni loginAlumni(String enrollmentNumber, String password) {
        Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
        if (alumni != null && passwordEncoder.matches(password, alumni.getPassword())) {
            return alumni;
        }
        return null;
    }

    public Alumni updateAlumniProfile(String enrollmentNumber, Alumni updates) {
        Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        // Only allow updating specific, necessary fields
        if (updates.getName() != null) {
            alumni.setName(updates.getName());
        }
        if (updates.getEmail() != null) {
            alumni.setEmail(updates.getEmail());
        }
        if (updates.getDepartment() != null) {
            alumni.setDepartment(updates.getDepartment());
        }
        if (updates.getPassingYear() != null) {
            alumni.setPassingYear(updates.getPassingYear());
        }
        if (updates.getBio() != null) {
            alumni.setBio(updates.getBio());
        }
        if (updates.getEmploymentStatus() != null) {
            alumni.setEmploymentStatus(updates.getEmploymentStatus());
        }
        if (updates.getGithubUrl() != null) {
            alumni.setGithubUrl(updates.getGithubUrl());
        }
        if (updates.getLinkedinUrl() != null) {
            alumni.setLinkedinUrl(updates.getLinkedinUrl());
        }
        if (updates.getAvatarUrl() != null) {
            alumni.setAvatarUrl(updates.getAvatarUrl());
        }

        // Handle password update securely
        if (updates.getPassword() != null && !updates.getPassword().trim().isEmpty() && !updates.getPassword().startsWith("$2a$")) {
            alumni.setPassword(passwordEncoder.encode(updates.getPassword()));
        }

        // Handle collection update correctly to avoid "all-delete-orphan" error
        if (updates.getExperiences() != null) {
            alumni.getExperiences().clear();
            for (Experience exp : updates.getExperiences()) {
                exp.setAlumni(alumni); // Set the back-reference
                alumni.getExperiences().add(exp);
            }
        }

        Alumni saved = alumniRepository.save(alumni);
        searchProfileService.syncAlumniProfile(saved.getEnrollmentNumber());
        return saved;
    }

    public Alumni addExperience(String enrollmentNumber, Experience experience) {
        Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        experience.setAlumni(alumni); // link to alumni
        alumni.getExperiences().add(experience);

        Alumni saved = alumniRepository.save(alumni);
        searchProfileService.syncAlumniProfile(saved.getEnrollmentNumber());
        return saved;
    }

    @Transactional
    public void deleteAlumniAccount(String enrollmentNumber) {
        Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));
        // CascadeType.ALL on experiences and posts will handle those
        alumniRepository.delete(alumni);
    }

    public Alumni uploadAvatar(String enrollmentNumber, MultipartFile file) throws Exception {
        Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        String url = cloudinaryService.uploadFile(file);
        alumni.setAvatarUrl(url);
        return alumniRepository.save(alumni);
    }

    public Alumni setAvatarUrl(String enrollmentNumber, String imageUrl) {
        Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        alumni.setAvatarUrl(imageUrl);
        return alumniRepository.save(alumni);
    }

    

}
