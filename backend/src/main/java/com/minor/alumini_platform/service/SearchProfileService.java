package com.minor.alumini_platform.service;

import com.minor.alumini_platform.enums.UserType;
import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.SearchProfile;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.SearchProfileRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchProfileService {

    private final SearchProfileRepository searchProfileRepository;
    private final AlumniRepository alumniRepository;
    private final StudentRepository studentRepository;
    private final SearchProfileBuilder searchProfileBuilder;

    @Transactional
    public void syncAlumniProfile(String enrollmentNumber) {
        try {
            Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                    .orElseThrow(() -> new RuntimeException("Alumni not found: " + enrollmentNumber));

            SearchProfile profile = searchProfileRepository.findByEnrollmentNumber(enrollmentNumber)
                    .orElse(new SearchProfile());

            profile.setEnrollmentNumber(enrollmentNumber);
            profile.setUserType(UserType.ALUMNI);
            profile.setName(alumni.getName());
            profile.setAvatarUrl(alumni.getAvatarUrl());
            profile.setSearchableText(searchProfileBuilder.buildForAlumni(alumni));
            profile.setDepartment(alumni.getDepartment());
            if (alumni.getPassingYear() != null && !alumni.getPassingYear().isEmpty()) {
                try {
                    profile.setPassingYear(Integer.parseInt(alumni.getPassingYear()));
                } catch (NumberFormatException e) {
                    log.warn("Invalid passing year for alumni {}: {}", enrollmentNumber, alumni.getPassingYear());
                }
            }
            
            if (alumni.getExperiences() != null && !alumni.getExperiences().isEmpty()) {
                profile.setCurrentCompany(alumni.getExperiences().get(alumni.getExperiences().size() - 1).getCompany());
                profile.setJobTitle(alumni.getExperiences().get(alumni.getExperiences().size() - 1).getJobTitle());
            }

            searchProfileRepository.save(profile);
            log.info("Synced search profile for alumni: {}", enrollmentNumber);
        } catch (Exception e) {
            log.error("Failed to sync alumni search profile: {}", e.getMessage());
        }
    }

    @Transactional
    public void syncStudentProfile(String enrollmentNumber) {
        try {
            Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + enrollmentNumber));

            SearchProfile profile = searchProfileRepository.findByEnrollmentNumber(enrollmentNumber)
                    .orElse(new SearchProfile());

            profile.setEnrollmentNumber(enrollmentNumber);
            profile.setUserType(UserType.STUDENT);
            profile.setName(student.getName());
            profile.setAvatarUrl(student.getAvatarUrl());
            profile.setSearchableText(searchProfileBuilder.buildForStudent(student));
            profile.setDepartment(student.getDepartment());
            profile.setPassingYear(student.getPassingYear());

            searchProfileRepository.save(profile);
            log.info("Synced search profile for student: {}", enrollmentNumber);
        } catch (Exception e) {
            log.error("Failed to sync student search profile: {}", e.getMessage());
        }
    }
}
