package com.minor.alumini_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResultDTO {
    private String name;
    private String enrollmentNumber;
    private String type; // "STUDENT" or "ALUMNI"
    private String department;
    private String email;
    private String avatarUrl;
    private String currentCompany;
    private String jobTitle;
}
