// package com.minor.alumini_platform.controller;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.multipart.MultipartFile;

// import com.minor.alumini_platform.service.CloudinaryService;

// @RestController
// @RequestMapping("/api/v1/posts")
// public class PostController {

//     private final CloudinaryService cloudinaryService;

//     public PostController(CloudinaryService cloudinaryService) {
//         this.cloudinaryService = cloudinaryService;
//     }

//     @PostMapping("/upload")
//     public ResponseEntity<String> uploadPostMedia(@RequestParam("file") MultipartFile file) {
//         try {
//             String url = cloudinaryService.uploadFile(file);
//             return ResponseEntity.ok(url); // return Cloudinary URL
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
//         }
//     }
// }
package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.model.Post;
import com.minor.alumini_platform.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping("/create/{alumniId}")
    public Post createPost(
            @PathVariable Long alumniId,
            @RequestParam("content") String content,
            @RequestParam(value = "media", required = false) MultipartFile media) throws IOException {
        return postService.createPost(alumniId, content, media);
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/alumni/{alumniId}")
    public List<Post> getPostsByAlumni(@PathVariable Long alumniId) {
        return postService.getPostsByAlumni(alumniId);
    }

    @GetMapping("/user/{enrollmentNumber}")
    public List<Post> getPostsByUser(@PathVariable String enrollmentNumber) {
        return postService.getPostsByEnrollmentNumber(enrollmentNumber);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Post deleted successfully");
        return ResponseEntity.ok(response);
    }
}
