package com.minor.alumini_platform.service;

import com.minor.alumini_platform.model.Alumni;
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
}
