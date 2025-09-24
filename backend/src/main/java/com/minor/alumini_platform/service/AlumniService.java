package com.minor.alumini_platform.service;

import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Experience;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.AlumniRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlumniService {

    private final AlumniRepository alumniRepository;

    public AlumniService(AlumniRepository alumniRepository) {
        this.alumniRepository = alumniRepository;
    }

    public Alumni registerAlumni(Alumni alumni) {
        return alumniRepository.save(alumni);
    }

    public List<Alumni> getAllAlumni() {
        return alumniRepository.findAll();
    }

    public Alumni getAlumniByEnrollmentNumber(String enrollmentNumber) {
        return alumniRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
    }

    public Alumni loginAlumni(String enrollmentNumber, String password) {
        return alumniRepository.findByEnrollmentNumberAndPassword(enrollmentNumber, password)
                .orElse(null);
    }

    public Alumni updateAlumniProfile(String enrollmentNumber, Alumni updates) {
        Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        if (updates.getEmploymentStatus() != null) {
            alumni.setEmploymentStatus(updates.getEmploymentStatus());
        }
        if (updates.getDepartment() != null) {
            alumni.setDepartment(updates.getDepartment());
        }
        if (updates.getPassingYear() != null) {
            alumni.setPassingYear(updates.getPassingYear());
        }
        if (updates.getName() != null) {
            alumni.setName(updates.getName());
        }
        if (updates.getEmail() != null) {
            alumni.setEmail(updates.getEmail());
        }
        if (updates.getPassword() != null) {
            alumni.setPassword(updates.getPassword());
        }

        if( updates.getExperiences() != null) {
            alumni.setExperiences(updates.getExperiences());
        }

        return alumniRepository.save(alumni);
    }

    public Alumni addExperience(String enrollmentNumber, Experience experience) {
        Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        experience.setAlumni(alumni); // link to alumni
        alumni.getExperiences().add(experience);

        return alumniRepository.save(alumni);
    }

    

}
