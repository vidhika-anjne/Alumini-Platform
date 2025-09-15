package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.service.AlumniService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/alumni")
public class AlumniController {

    private final AlumniService alumniService;

    public AlumniController(AlumniService alumniService) {
        this.alumniService = alumniService;
    }

    // Alumni registration
    @PostMapping("/register")
    public Alumni registerAlumni(@RequestBody Alumni alumni) {
        return alumniService.registerAlumni(alumni);
    }

    // View all alumni
    @GetMapping
    public List<Alumni> getAllAlumni() {
        return alumniService.getAllAlumni();
    }

    @PostMapping("/login")
    public String loginStudent(@RequestParam String enrollmentNumber, @RequestParam String password) {
        Alumni alumni = alumniService.loginAlumni(enrollmentNumber, password);
        if (alumni != null) {
            return "✅ Login successful! Welcome " + alumni.getName();
        } else {
            return "❌ Invalid username or password";
        }
    }

    // Find alumni by enrollment number
    @GetMapping("/{enrollmentNumber}")
    public Alumni getAlumniByEnrollmentNumber(@PathVariable String enrollmentNumber) {
        return alumniService.getAlumniByEnrollmentNumber(enrollmentNumber);
    }
}
