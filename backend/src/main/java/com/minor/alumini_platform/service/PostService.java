package com.minor.alumini_platform.service;

import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Post;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final AlumniRepository alumniRepository;
    private final CloudinaryService cloudinaryService;

    public PostService(PostRepository postRepository, AlumniRepository alumniRepository, CloudinaryService cloudinaryService) {
        this.postRepository = postRepository;
        this.alumniRepository = alumniRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public Post createPost(Long alumniId, String content, MultipartFile media) throws IOException {
        Alumni alumni = alumniRepository.findById(alumniId)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        Post post = new Post();
        post.setContent(content);
        post.setAlumni(alumni);

        if (media != null && !media.isEmpty()) {
            String mediaUrl = cloudinaryService.uploadFile(media);
            post.setMediaUrl(mediaUrl);
        }

        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Post> getPostsByAlumni(Long alumniId) {
        return postRepository.findByAlumniIdOrderByCreatedAtDesc(alumniId);
    }

    public List<Post> getPostsByEnrollmentNumber(String enrollmentNumber) {
        return postRepository.findByAlumniEnrollmentNumberOrderByCreatedAtDesc(enrollmentNumber);
    }

    public void deletePost(Long postId) {
        postRepository.deleteById(postId);
    }
}
