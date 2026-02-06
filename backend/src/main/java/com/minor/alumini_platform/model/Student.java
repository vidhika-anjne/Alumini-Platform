package com.minor.alumini_platform.model;

import javax.persistence.*;

import java.time.LocalDate;
import java.util.List;
// import com.minor.alumini_platform.enums.EmploymentStatus;
import com.minor.alumini_platform.enums.Status;
import com.minor.alumini_platform.enums.AlumniDecisionStatus;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Enrollment number is unique → works as username
    @Column(nullable = false, unique = true)
    private String enrollmentNumber;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    // public enum Status {
    //     PENDING, APPROVED, REJECTED
    // }
    @Column(nullable = false, unique = true)
    private String email;
    private Integer passingYear;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String avatarUrl;
    private String department;

    @ElementCollection
    private List<String> skills;

    @Transient
    private String otp;

    @Column(nullable = false)
    private LocalDate expectedEndDate;

    @Enumerated(EnumType.STRING)
    private AlumniDecisionStatus alumniDecisionStatus = AlumniDecisionStatus.PENDING;

    private LocalDate nextPromptDate;

    private LocalDate actualAlumniDate;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getPassingYear() { return passingYear; }
    public void setPassingYear(Integer passingYear) { this.passingYear = passingYear; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public LocalDate getExpectedEndDate() { return expectedEndDate; }
    public void setExpectedEndDate(LocalDate expectedEndDate) { this.expectedEndDate = expectedEndDate; }

    public AlumniDecisionStatus getAlumniDecisionStatus() { return alumniDecisionStatus; }
    public void setAlumniDecisionStatus(AlumniDecisionStatus alumniDecisionStatus) { this.alumniDecisionStatus = alumniDecisionStatus; }

    public LocalDate getNextPromptDate() { return nextPromptDate; }
    public void setNextPromptDate(LocalDate nextPromptDate) { this.nextPromptDate = nextPromptDate; }

    public LocalDate getActualAlumniDate() { return actualAlumniDate; }
    public void setActualAlumniDate(LocalDate actualAlumniDate) { this.actualAlumniDate = actualAlumniDate; }

    public boolean needsAlumniPrompt(LocalDate today) {
        if (alumniDecisionStatus == AlumniDecisionStatus.CONFIRMED_ALUMNI) {
            return false;
        }
        if (expectedEndDate == null) {
            return false;
        }
        if (today.isBefore(expectedEndDate)) {
            return false;
        }
        if (alumniDecisionStatus == AlumniDecisionStatus.PENDING) {
            return true;
        }
        if (alumniDecisionStatus == AlumniDecisionStatus.DELAYED) {
            return nextPromptDate == null || today.isAfter(nextPromptDate) || today.isEqual(nextPromptDate);
        }
        return false;
    }

}
