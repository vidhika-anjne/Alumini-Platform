package com.minor.alumini_platform.service;

import com.minor.alumini_platform.dto.UserSearchResultDTO;
import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final StudentRepository studentRepository;
    private final AlumniRepository alumniRepository;

    public List<UserSearchResultDTO> searchUsers(String query) {
        log.info("Searching for: {}", query);
        System.out.println("\n========== SearchService.searchUsers() ==========");
        System.out.println("Query received: " + query);
        
        if (query == null || query.trim().length() < 2) {
            System.out.println("Query too short, returning empty");
            return new ArrayList<>();
        }

        String trimmedQuery = query.trim();
        System.out.println("Trimmed query: " + trimmedQuery);

        try {
            List<UserSearchResultDTO> results = new ArrayList<>();

            // Search Students
            List<Student> students = studentRepository.findByNameContainingIgnoreCase(trimmedQuery);
            System.out.println("Found " + students.size() + " students");
            results.addAll(students.stream().map(s -> {
                UserSearchResultDTO dto = UserSearchResultDTO.builder()
                        .name(s.getName())
                        .enrollmentNumber(s.getEnrollmentNumber())
                        .type("STUDENT")
                        .department(s.getDepartment())
                        .email(s.getEmail())
                        .avatarUrl(s.getAvatarUrl())
                        .build();
                System.out.println("  Student DTO: " + dto.getName());
                return dto;
            }).collect(Collectors.toList()));

            // Search Alumni
            List<Alumni> alumni = alumniRepository.findByNameContainingIgnoreCase(trimmedQuery);
            System.out.println("Found " + alumni.size() + " alumni");
            results.addAll(alumni.stream().map(a -> {
                UserSearchResultDTO dto = UserSearchResultDTO.builder()
                        .name(a.getName())
                        .enrollmentNumber(a.getEnrollmentNumber())
                        .type("ALUMNI")
                        .department(a.getDepartment())
                        .email(a.getEmail())
                        .avatarUrl(a.getAvatarUrl())
                        .currentCompany(a.getExperiences() != null && !a.getExperiences().isEmpty() 
                            ? a.getExperiences().get(a.getExperiences().size() - 1).getCompany() 
                            : null)
                        .jobTitle(a.getExperiences() != null && !a.getExperiences().isEmpty() 
                            ? a.getExperiences().get(a.getExperiences().size() - 1).getJobTitle() 
                            : null)
                        .build();
                System.out.println("  Alumni DTO: " + dto.getName());
                return dto;
            }).collect(Collectors.toList()));

            // Limit total results to 20
            List<UserSearchResultDTO> finalResults = results.stream().limit(20).collect(Collectors.toList());
            System.out.println("Returning " + finalResults.size() + " total results");
            System.out.println("=============================================\n");
            return finalResults;
        } catch (Exception e) {
            System.out.println("ERROR in search: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=============================================\n");
            throw new RuntimeException("Search failed", e);
        }
    }
}
