package com.minor.alumini_platform.repository;

import com.minor.alumini_platform.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByAlumniIdOrderByCreatedAtDesc(Long alumniId);
    List<Post> findByAlumniEnrollmentNumberOrderByCreatedAtDesc(String enrollmentNumber);
}
