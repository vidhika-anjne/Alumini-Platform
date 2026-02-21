package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.dto.AlumniSearchRequest;
import com.minor.alumini_platform.dto.AlumniSearchResult;
import com.minor.alumini_platform.dto.EmbeddingRequest;
import com.minor.alumini_platform.dto.EmbeddingResponse;
import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.service.EmbeddingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/embedding")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class EmbeddingController {

    private final EmbeddingService embeddingService;
    private final AlumniRepository alumniRepository;

    public EmbeddingController(EmbeddingService embeddingService, AlumniRepository alumniRepository) {
        this.embeddingService = embeddingService;
        this.alumniRepository = alumniRepository;
    }

    /**
     * Generate embedding for any text
     * POST /api/v1/embedding/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateEmbedding(@RequestBody EmbeddingRequest request) {
        try {
            if (request.getText() == null || request.getText().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Text cannot be empty"));
            }

            List<Double> embedding = embeddingService.getEmbedding(request.getText());
            return ResponseEntity.ok(new EmbeddingResponse(embedding));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Generate embedding for a specific alumni profile
     * GET /api/v1/embedding/alumni/{enrollmentNumber}
     */
    @GetMapping("/alumni/{enrollmentNumber}")
    public ResponseEntity<?> getAlumniEmbedding(@PathVariable String enrollmentNumber) {
        try {
            Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                    .orElseThrow(() -> new RuntimeException("Alumni not found"));

            List<Double> embedding = embeddingService.getAlumniEmbedding(alumni);
            
            Map<String, Object> response = new HashMap<>();
            response.put("enrollmentNumber", enrollmentNumber);
            response.put("name", alumni.getName());
            response.put("description", embeddingService.generateAlumniDescription(alumni));
            response.put("embedding", embedding);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Search for similar alumni based on a query
     * POST /api/v1/embedding/search
     */
    @PostMapping("/search")
    public ResponseEntity<?> searchSimilarAlumni(@RequestBody AlumniSearchRequest request) {
        try {
            if (request.getQuery() == null || request.getQuery().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Query cannot be empty"));
            }

            int topK = request.getTopK() > 0 ? request.getTopK() : 10;
            List<AlumniSearchResult> results = embeddingService.searchSimilarAlumni(request.getQuery(), topK);
            
            Map<String, Object> response = new HashMap<>();
            response.put("query", request.getQuery());
            response.put("resultsCount", results.size());
            response.put("results", results);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Generate embeddings for all alumni (batch operation)
     * POST /api/v1/embedding/batch-generate
     */
    @PostMapping("/batch-generate")
    public ResponseEntity<?> batchGenerateEmbeddings() {
        try {
            Map<String, List<Double>> embeddings = embeddingService.generateAllAlumniEmbeddings();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully generated embeddings for all alumni");
            response.put("count", embeddings.size());
            response.put("embeddings", embeddings);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if embedding service is available
     * GET /api/v1/embedding/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> checkHealth() {
        boolean isAvailable = embeddingService.isEmbeddingServiceAvailable();
        
        Map<String, Object> response = new HashMap<>();
        response.put("embeddingServiceAvailable", isAvailable);
        response.put("status", isAvailable ? "OK" : "UNAVAILABLE");
        
        if (!isAvailable) {
            response.put("message", "Embedding service is not available. Please ensure it's running on port 5001.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get alumni description (for debugging/testing)
     * GET /api/v1/embedding/alumni/{enrollmentNumber}/description
     */
    @GetMapping("/alumni/{enrollmentNumber}/description")
    public ResponseEntity<?> getAlumniDescription(@PathVariable String enrollmentNumber) {
        try {
            Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                    .orElseThrow(() -> new RuntimeException("Alumni not found"));

            String description = embeddingService.generateAlumniDescription(alumni);
            
            Map<String, Object> response = new HashMap<>();
            response.put("enrollmentNumber", enrollmentNumber);
            response.put("name", alumni.getName());
            response.put("description", description);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Refresh embedding for a specific alumni
     * POST /api/v1/embedding/alumni/{enrollmentNumber}/refresh
     */
    @PostMapping("/alumni/{enrollmentNumber}/refresh")
    public ResponseEntity<?> refreshAlumniEmbedding(@PathVariable String enrollmentNumber) {
        try {
            List<Double> embedding = embeddingService.refreshAlumniEmbedding(enrollmentNumber);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Embedding refreshed successfully");
            response.put("enrollmentNumber", enrollmentNumber);
            response.put("embedding", embedding);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Clear all embeddings from database
     * DELETE /api/v1/embedding/clear-all
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<?> clearAllEmbeddings() {
        try {
            int clearedCount = embeddingService.clearAllEmbeddings();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "All embeddings cleared successfully");
            response.put("clearedCount", clearedCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Clear and regenerate all embeddings
     * POST /api/v1/embedding/regenerate-all
     */
    @PostMapping("/regenerate-all")
    public ResponseEntity<?> regenerateAllEmbeddings() {
        try {
            Map<String, Object> result = embeddingService.clearAndRegenerateAllEmbeddings();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "All embeddings cleared and regenerated successfully");
            response.put("clearedCount", result.get("clearedCount"));
            response.put("generatedCount", result.get("generatedCount"));
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
