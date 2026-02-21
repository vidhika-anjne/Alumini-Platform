package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.dto.ProfileDTO;
import com.minor.alumini_platform.dto.ProfileResponse;
import com.minor.alumini_platform.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for unified profile viewing
 * Provides consistent API for viewing both Alumni and Student profiles
 */
@RestController
@RequestMapping("/api/v1/profiles")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * Get any user's profile by enrollment number
     * Searches both Alumni and Student tables
     * 
     * @param enrollmentNumber The enrollment number to search for
     * @return ProfileResponse with unified profile data
     * 
     * Example: GET /api/v1/profiles/0901CS211050
     */
    @GetMapping("/{enrollmentNumber}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable String enrollmentNumber) {
        try {
            ProfileDTO profile = profileService.getProfileByEnrollmentNumber(enrollmentNumber);
            
            if (profile == null) {
                return ResponseEntity.status(404)
                    .body(ProfileResponse.error("Profile not found for enrollment number: " + enrollmentNumber));
            }
            
            return ResponseEntity.ok(ProfileResponse.success(profile));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ProfileResponse.error("Failed to retrieve profile: " + e.getMessage()));
        }
    }

    /**
     * Get alumni profile specifically
     * 
     * @param enrollmentNumber The enrollment number
     * @return ProfileResponse with alumni profile data
     * 
     * Example: GET /api/v1/profiles/alumni/0901CS211050
     */
    @GetMapping("/alumni/{enrollmentNumber}")
    public ResponseEntity<ProfileResponse> getAlumniProfile(@PathVariable String enrollmentNumber) {
        try {
            ProfileDTO profile = profileService.getAlumniProfile(enrollmentNumber);
            
            if (profile == null) {
                return ResponseEntity.status(404)
                    .body(ProfileResponse.error("Alumni profile not found for enrollment number: " + enrollmentNumber));
            }
            
            return ResponseEntity.ok(ProfileResponse.success(profile));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ProfileResponse.error("Failed to retrieve alumni profile: " + e.getMessage()));
        }
    }

    /**
     * Get student profile specifically
     * 
     * @param enrollmentNumber The enrollment number
     * @return ProfileResponse with student profile data
     * 
     * Example: GET /api/v1/profiles/student/0901CS221099
     */
    @GetMapping("/student/{enrollmentNumber}")
    public ResponseEntity<ProfileResponse> getStudentProfile(@PathVariable String enrollmentNumber) {
        try {
            ProfileDTO profile = profileService.getStudentProfile(enrollmentNumber);
            
            if (profile == null) {
                return ResponseEntity.status(404)
                    .body(ProfileResponse.error("Student profile not found for enrollment number: " + enrollmentNumber));
            }
            
            return ResponseEntity.ok(ProfileResponse.success(profile));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ProfileResponse.error("Failed to retrieve student profile: " + e.getMessage()));
        }
    }

    /**
     * Check if a user exists
     * 
     * @param enrollmentNumber The enrollment number to check
     * @return Response indicating existence and user type
     * 
     * Example: GET /api/v1/profiles/check/0901CS211050
     */
    @GetMapping("/check/{enrollmentNumber}")
    public ResponseEntity<ProfileResponse> checkUserExists(@PathVariable String enrollmentNumber) {
        try {
            String userType = profileService.getUserType(enrollmentNumber);
            
            if (userType == null) {
                return ResponseEntity.status(404)
                    .body(ProfileResponse.error("User not found"));
            }
            
            ProfileResponse response = new ProfileResponse();
            response.setSuccess(true);
            response.setMessage("User exists as " + userType);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ProfileResponse.error("Failed to check user existence: " + e.getMessage()));
        }
    }
}
