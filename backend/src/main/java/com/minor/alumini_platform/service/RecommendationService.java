package com.minor.alumini_platform.service;

import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Experience;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final StudentRepository studentRepository;
    private final AlumniRepository alumniRepository;

    public RecommendationService(StudentRepository studentRepository, AlumniRepository alumniRepository) {
        this.studentRepository = studentRepository;
        this.alumniRepository = alumniRepository;
    }

    public List<Alumni> recommendAlumniForStudent(String enrollmentNumber, int limit) {
        Optional<Student> optionalStudent = studentRepository.findByEnrollmentNumber(enrollmentNumber);
        if (!optionalStudent.isPresent()) {
            throw new RuntimeException("Student not found");
        }

        Student student = optionalStudent.get();
        List<String> studentSkills = student.getSkills();
        int studentYear = student.getPassingYear() != null ? student.getPassingYear() : 0;

        List<Alumni> allAlumni = alumniRepository.findAll();
        List<ScoredAlumni> scored = new ArrayList<>();

        for (Alumni alumni : allAlumni) {
            double score = computeScore(studentSkills, studentYear, alumni);
            if (score > 0) {
                scored.add(new ScoredAlumni(alumni, score));
            }
        }

        return scored.stream()
                .sorted(Comparator.comparingDouble(ScoredAlumni::getScore).reversed())
                .limit(limit)
                .map(ScoredAlumni::getAlumni)
                .collect(Collectors.toList());
    }

    private double computeScore(List<String> studentSkills, int studentYear, Alumni alumni) {
        double score = 0.0;

        List<String> normalizedSkills = new ArrayList<>();
        if (studentSkills != null) {
            for (String s : studentSkills) {
                if (s != null) {
                    String trimmed = s.trim();
                    if (!trimmed.isEmpty()) {
                        normalizedSkills.add(trimmed.toLowerCase());
                    }
                }
            }
        }

        StringBuilder textBuilder = new StringBuilder();
        if (alumni.getDepartment() != null) {
            textBuilder.append(alumni.getDepartment().toLowerCase()).append(" ");
        }
        if (alumni.getExperiences() != null) {
            for (Experience exp : alumni.getExperiences()) {
                if (exp.getJobTitle() != null) {
                    textBuilder.append(exp.getJobTitle().toLowerCase()).append(" ");
                }
                if (exp.getCompany() != null) {
                    textBuilder.append(exp.getCompany().toLowerCase()).append(" ");
                }
            }
        }
        String text = textBuilder.toString();

        int skillMatches = 0;
        for (String skill : normalizedSkills) {
            if (!skill.isEmpty() && text.contains(skill)) {
                skillMatches++;
            }
        }
        if (skillMatches > 0) {
            score += skillMatches * 5.0;
        }

        if (studentYear > 0 && alumni.getPassingYear() != null) {
            try {
                int alumniYear = Integer.parseInt(alumni.getPassingYear());
                int diff = Math.abs(studentYear - alumniYear);
                if (diff <= 1) {
                    score += 3.0;
                } else if (diff <= 3) {
                    score += 2.0;
                } else if (diff <= 5) {
                    score += 1.0;
                }
            } catch (NumberFormatException ignored) {
            }
        }

        if (alumni.getEmploymentStatus() != null) {
            switch (alumni.getEmploymentStatus()) {
                case EMPLOYED:
                case ENTREPRENEUR:
                case HIGHER_STUDIES:
                    score += 1.0;
                    break;
                default:
                    break;
            }
        }

        return score;
    }

    private static class ScoredAlumni {
        private final Alumni alumni;
        private final double score;

        private ScoredAlumni(Alumni alumni, double score) {
            this.alumni = alumni;
            this.score = score;
        }

        private Alumni getAlumni() {
            return alumni;
        }

        private double getScore() {
            return score;
        }
    }
}
