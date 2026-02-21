package com.minor.alumini_platform.dto;

import com.minor.alumini_platform.enums.EmploymentStatus;
import com.minor.alumini_platform.model.Experience;

import java.util.List;

/**
 * DTO for unified profile response
 * Works for both Alumni and Student profiles
 */
public class ProfileDTO {
    private Long id;
    private String enrollmentNumber;
    private String name;
    private String email;
    private String department;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String avatarUrl;
    private String userType; // "ALUMNI" or "STUDENT"
    
    // Alumni-specific fields
    private String passingYear;
    private EmploymentStatus employmentStatus;
    private List<Experience> experiences;
    
    // Student-specific fields
    private Integer expectedPassingYear;
    private List<String> skills;
    private String status; // PENDING, APPROVED, REJECTED

    // Constructors
    public ProfileDTO() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEnrollmentNumber() {
        return enrollmentNumber;
    }

    public void setEnrollmentNumber(String enrollmentNumber) {
        this.enrollmentNumber = enrollmentNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getPassingYear() {
        return passingYear;
    }

    public void setPassingYear(String passingYear) {
        this.passingYear = passingYear;
    }

    public EmploymentStatus getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(EmploymentStatus employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    public List<Experience> getExperiences() {
        return experiences;
    }

    public void setExperiences(List<Experience> experiences) {
        this.experiences = experiences;
    }

    public Integer getExpectedPassingYear() {
        return expectedPassingYear;
    }

    public void setExpectedPassingYear(Integer expectedPassingYear) {
        this.expectedPassingYear = expectedPassingYear;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
