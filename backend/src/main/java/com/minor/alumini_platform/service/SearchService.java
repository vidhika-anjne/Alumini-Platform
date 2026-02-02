package com.minor.alumini_platform.service;

import com.minor.alumini_platform.dto.UserSearchResultDTO;
import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final StudentRepository studentRepository;
    private final AlumniRepository alumniRepository;

    public List<UserSearchResultDTO> searchUsers(String query) {
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }

        String trimmedQuery = query.trim();
        List<UserSearchResultDTO> results = new ArrayList<>();

        // Search Students
        List<Student> students = studentRepository.findByNameContainingIgnoreCase(trimmedQuery);
        results.addAll(students.stream().map(s -> UserSearchResultDTO.builder()
                .name(s.getName())
                .enrollmentNumber(s.getEnrollmentNumber())
                .type("STUDENT")
                .department(s.getDepartment())
                .email(s.getEmail())
                .build()).collect(Collectors.toList()));

        // Search Alumni
        List<Alumni> alumni = alumniRepository.findByNameContainingIgnoreCase(trimmedQuery);
        results.addAll(alumni.stream().map(a -> UserSearchResultDTO.builder()
                .name(a.getName())
                .enrollmentNumber(a.getEnrollmentNumber())
                .type("ALUMNI")
                .department(a.getDepartment())
                .email(a.getEmail())
                .build()).collect(Collectors.toList()));

        // Limit total results to 10 for better recommendation feel
        return results.stream().limit(10).collect(Collectors.toList());
    }
}
