package com.minor.alumini_platform.security;

import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Student;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AlumniRepository alumniRepository;
    private final StudentRepository studentRepository;

    public CustomUserDetailsService(AlumniRepository alumniRepository, StudentRepository studentRepository) {
        this.alumniRepository = alumniRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String enrollmentNumber) throws UsernameNotFoundException {
        // Try to find in alumni
        Optional<Alumni> alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber);
        if (alumni.isPresent()) {
            return new User(alumni.get().getEnrollmentNumber(), alumni.get().getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ALUMNI")));
        }

        // Try to find in student
        Optional<Student> student = studentRepository.findByEnrollmentNumber(enrollmentNumber);
        if (student.isPresent()) {
            return new User(student.get().getEnrollmentNumber(), student.get().getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")));
        }

        throw new UsernameNotFoundException("User not found with enrollment number: " + enrollmentNumber);
    }
}
