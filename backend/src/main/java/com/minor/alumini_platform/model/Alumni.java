package com.minor.alumini_platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "alumni")
public class Alumni {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Enrollment number stays unique for alumni too
    @Column(nullable = false, unique = true)
    private String enrollmentNumber;

    private String name;
    private String email;
    private String password;
    private String passingYear;
    private String department;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPassingYear() { return passingYear; }
    public void setPassingYear(String passingYear) { this.passingYear = passingYear; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}

