package com.minor.alumini_platform.dto;

/**
 * Wrapper DTO for profile API responses
 */
public class ProfileResponse {
    private boolean success;
    private String message;
    private ProfileDTO profile;

    // Constructors
    public ProfileResponse() {}

    public ProfileResponse(boolean success, String message, ProfileDTO profile) {
        this.success = success;
        this.message = message;
        this.profile = profile;
    }

    // Static factory methods
    public static ProfileResponse success(ProfileDTO profile) {
        return new ProfileResponse(true, "Profile retrieved successfully", profile);
    }

    public static ProfileResponse error(String message) {
        return new ProfileResponse(false, message, null);
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public ProfileDTO getProfile() {
        return profile;
    }

    public void setProfile(ProfileDTO profile) {
        this.profile = profile;
    }
}
