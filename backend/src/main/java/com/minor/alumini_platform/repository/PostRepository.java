package com.minor.alumini_platform.repository;

import com.minor.alumini_platform.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}
