package com.minor.alumini_platform.service;

import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Experience;
import com.minor.alumini_platform.model.Student;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class SearchProfileBuilder {

    /**
     * Builds a descriptive text string for an Alumni to be used for semantic search embeddings.
     */
    public String buildForAlumni(Alumni alumni) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("%s is an alumni from the %s department, class of %s. ", 
            alumni.getName(), 
            alumni.getDepartment(), 
            alumni.getPassingYear()));

        if (alumni.getEmploymentStatus() != null) {
            sb.append(String.format("Current professional status is %s. ", alumni.getEmploymentStatus()));
        }

        // Add latest experience info
        if (alumni.getExperiences() != null && !alumni.getExperiences().isEmpty()) {
            Experience latest = alumni.getExperiences().get(alumni.getExperiences().size() - 1);
            sb.append(String.format("Currently or most recently working as %s at %s. ", 
                latest.getJobTitle(), 
                latest.getCompany()));
        }

        if (alumni.getBio() != null && !alumni.getBio().trim().isEmpty()) {
            sb.append("Profile Bio: ").append(alumni.getBio());
        }

        return sb.toString();
    }

    /**
     * Builds a descriptive text string for a Student to be used for semantic search embeddings.
     */
    public String buildForStudent(Student student) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("%s is a student in the %s department, expected to graduate in %s. ", 
            student.getName(), 
            student.getDepartment(), 
            student.getPassingYear()));

        if (student.getSkills() != null && !student.getSkills().isEmpty()) {
            sb.append("Skills include: ").append(String.join(", ", student.getSkills())).append(". ");
        }

        if (student.getBio() != null && !student.getBio().trim().isEmpty()) {
            sb.append("Student Bio: ").append(student.getBio());
        }

        return sb.toString();
    }
}
