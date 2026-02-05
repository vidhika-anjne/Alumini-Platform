package com.minor.alumini_platform.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final AlumniRepository alumniRepository;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (studentRepository.count() == 0) {
            loadStudents();
        }

        if (alumniRepository.count() == 0) {
            loadAlumni();
        }
    }

    private void loadStudents() throws Exception {
        InputStream inputStream = new ClassPathResource("data/students.json").getInputStream();
        List<Student> students = objectMapper.readValue(inputStream, new TypeReference<List<Student>>() {});

        for (Student student : students) {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
            if (student.getStatus() == null) {
                student.setStatus(com.minor.alumini_platform.enums.Status.APPROVED);
            }
        }

        studentRepository.saveAll(students);
        System.out.println("✅ Students seed data loaded");
    }

    private void loadAlumni() throws Exception {
        InputStream inputStream = new ClassPathResource("data/alumni.json").getInputStream();
        List<Alumni> alumniList = objectMapper.readValue(inputStream, new TypeReference<List<Alumni>>() {});

        for (Alumni alumni : alumniList) {
            alumni.setPassword(passwordEncoder.encode(alumni.getPassword()));
        }

        alumniRepository.saveAll(alumniList);
        System.out.println("✅ Alumni seed data loaded");
    }
}
