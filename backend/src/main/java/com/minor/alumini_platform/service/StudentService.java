package com.minor.alumini_platform.service;
import com.minor.alumini_platform.dto.StudentStatusCheckResult;
import com.minor.alumini_platform.enums.AlumniDecisionStatus;
import com.minor.alumini_platform.enums.Status;
import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final AlumniRepository alumniRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;
    private final SearchProfileService searchProfileService;

    public StudentService(StudentRepository studentRepository, AlumniRepository alumniRepository, 
                          PasswordEncoder passwordEncoder, CloudinaryService cloudinaryService,
                          SearchProfileService searchProfileService) {
        this.studentRepository = studentRepository;
        this.alumniRepository = alumniRepository;
        this.passwordEncoder = passwordEncoder;
        this.cloudinaryService = cloudinaryService;
        this.searchProfileService = searchProfileService;
    }

    public Student registerStudent(Student student) {
        try {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
            Student saved = studentRepository.save(student);
            searchProfileService.syncStudentProfile(saved.getEnrollmentNumber());
            return saved;
        } catch (Exception e) {
            if (e.getMessage().contains("Duplicate entry") || e.getMessage().contains("ConstraintViolationException")) {
                if (e.getMessage().contains("enrollment_number")) {
                    throw new RuntimeException("Enrollment number already exists");
                } else if (e.getMessage().contains("email")) {
                    throw new RuntimeException("Email address already exists");
                } else {
                    throw new RuntimeException("Duplicate data found");
                }
            }
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentByEnrollmentNumber(String enrollmentNumber) {
        return studentRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
    }

    public Student updateStudent(Student student) {
        if (student.getPassword() != null && !student.getPassword().startsWith("$2a$")) {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
        }
        Student saved = studentRepository.save(student);
        searchProfileService.syncStudentProfile(saved.getEnrollmentNumber());
        return saved;
    }
    public Student loginStudent(String enrollmentNumber, String password) {
        Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
        if (student != null && passwordEncoder.matches(password, student.getPassword())) {
            return student;
        }
        return null;
    }

    public List<String> getStudentSkills(String enrollmentNumber) {
        Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber).orElse(null);
        if (student != null) {
            return student.getSkills();
        }
        return null;
    }

    public void validateStudentAccess(String enrollmentNumber) {
        Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (student.getAlumniDecisionStatus() == AlumniDecisionStatus.CONFIRMED_ALUMNI) {
            throw new RuntimeException("This account has been converted to Alumni. Please log in as Alumni.");
        }
    }

    public StudentStatusCheckResult checkStudentStatus(Student student, LocalDate today) {
        boolean isPastExpectedEndDate = student.getExpectedEndDate() != null && (today.isEqual(student.getExpectedEndDate()) || today.isAfter(student.getExpectedEndDate()));
        boolean shouldPromptForAlumni = student.needsAlumniPrompt(today);
        boolean isStudentStillAllowed = student.getAlumniDecisionStatus() != AlumniDecisionStatus.CONFIRMED_ALUMNI;

        return StudentStatusCheckResult.builder()
                .isPastExpectedEndDate(isPastExpectedEndDate)
                .shouldPromptForAlumni(shouldPromptForAlumni)
                .isStudentStillAllowed(isStudentStillAllowed)
                .expectedEndDate(student.getExpectedEndDate())
                .nextPromptDate(student.getNextPromptDate())
                .alumniDecisionStatus(student.getAlumniDecisionStatus())
                .build();
    }

    @Transactional
    public void deleteStudentAccount(String enrollmentNumber) {
        Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        studentRepository.delete(student);
    }

    public Student uploadAvatar(String enrollmentNumber, MultipartFile file) throws Exception {
        Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String url = cloudinaryService.uploadFile(file);
        student.setAvatarUrl(url);
        return studentRepository.save(student);
    }

    public Student setAvatarUrl(String enrollmentNumber, String imageUrl) {
        Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setAvatarUrl(imageUrl);
        return studentRepository.save(student);
    }

    @Transactional
    public Alumni convertToAlumni(Student student, LocalDate effectiveDate) {
        // 1. Create new Alumni entity
        Alumni alumni = new Alumni();
        alumni.setEnrollmentNumber(student.getEnrollmentNumber());
        alumni.setName(student.getName());
        alumni.setEmail(student.getEmail());
        
        // Use effectiveDate year or expectedEndDate year for passingYear
        int year = (effectiveDate != null) ? effectiveDate.getYear() : (student.getExpectedEndDate() != null ? student.getExpectedEndDate().getYear() : LocalDate.now().getYear());
        alumni.setPassingYear(String.valueOf(year));
        
        // Copy password (already encoded)
        alumni.setPassword(student.getPassword());
        
        // Copy department
        alumni.setDepartment(student.getDepartment());
        
        // 2. Save Alumni
        Alumni savedAlumni = alumniRepository.save(alumni);
        
        // 3. Update Student
        student.setAlumniDecisionStatus(AlumniDecisionStatus.CONFIRMED_ALUMNI);
        student.setActualAlumniDate(effectiveDate != null ? effectiveDate : LocalDate.now());
        student.setStatus(Status.ALUMNI);
        
        studentRepository.save(student);
        
        return savedAlumni;
    }
}

