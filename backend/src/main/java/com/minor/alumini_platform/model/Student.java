package com.minor.alumini_platform.model;

import javax.persistence.*;

import java.util.List;
// import com.minor.alumini_platform.enums.EmploymentStatus;
import com.minor.alumini_platform.enums.Status;

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

    @ElementCollection
    private List<String> skills;

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

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    
}
