package com.minor.alumini_platform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minor.alumini_platform.dto.AlumniSearchResult;
import com.minor.alumini_platform.dto.EmbeddingRequest;
import com.minor.alumini_platform.dto.EmbeddingResponse;
import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.model.Experience;
import com.minor.alumini_platform.repository.AlumniRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmbeddingService {

    private final RestTemplate restTemplate;
    private final AlumniRepository alumniRepository;
    private final ObjectMapper objectMapper;

    @Value("${embedding.service.url:http://127.0.0.1:5001}")
    private String embeddingServiceUrl;

    public EmbeddingService(RestTemplate restTemplate, AlumniRepository alumniRepository) {
        this.restTemplate = restTemplate;
        this.alumniRepository = alumniRepository;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get embedding for a text string by calling the Python embedding service
     */
    public List<Double> getEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new ArrayList<>();
        }

        try {
            EmbeddingRequest request = new EmbeddingRequest(text);
            EmbeddingResponse response = restTemplate.postForObject(
                    embeddingServiceUrl + "/embed",
                    request,
                    EmbeddingResponse.class
            );

            return response != null ? response.getEmbedding() : new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Error getting embedding: " + e.getMessage());
            throw new RuntimeException("Failed to generate embedding. Make sure the embedding service is running.", e);
        }
    }

    /**
     * Generate a descriptive text from alumni profile for embedding
     */
    public String generateAlumniDescription(Alumni alumni) {
        StringBuilder description = new StringBuilder();

        // Add basic info
        if (alumni.getName() != null) {
            description.append("Name: ").append(alumni.getName()).append(". ");
        }

        if (alumni.getDepartment() != null) {
            description.append("Department: ").append(alumni.getDepartment()).append(". ");
        }

        if (alumni.getPassingYear() != null) {
            description.append("Passing Year: ").append(alumni.getPassingYear()).append(". ");
        }

        if (alumni.getEmploymentStatus() != null) {
            description.append("Employment Status: ").append(alumni.getEmploymentStatus()).append(". ");
        }

        // Add bio
        if (alumni.getBio() != null && !alumni.getBio().trim().isEmpty()) {
            description.append("Bio: ").append(alumni.getBio()).append(". ");
        }

        // Add experience information
        if (alumni.getExperiences() != null && !alumni.getExperiences().isEmpty()) {
            description.append("Experience: ");
            for (Experience exp : alumni.getExperiences()) {
                if (exp.getJobTitle() != null) {
                    description.append(exp.getJobTitle());
                }
                if (exp.getCompany() != null) {
                    description.append(" at ").append(exp.getCompany());
                }
                if (exp.getLocation() != null) {
                    description.append(" in ").append(exp.getLocation());
                }
                description.append(". ");
            }
        }

        return description.toString().trim();
    }

    /**
     * Get embedding for an alumni profile
     */
    public List<Double> getAlumniEmbedding(Alumni alumni) {
        String description = generateAlumniDescription(alumni);
        return getEmbedding(description);
    }

    /**
     * Save embedding vector to alumni record
     */
    @Transactional
    public void saveAlumniEmbedding(String enrollmentNumber, List<Double> embedding) {
        Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));
        
        try {
            String embeddingJson = objectMapper.writeValueAsString(embedding);
            alumni.setEmbeddingVector(embeddingJson);
            alumniRepository.save(alumni);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save embedding", e);
        }
    }

    /**
     * Get stored embedding from alumni record
     */
    public List<Double> getStoredAlumniEmbedding(Alumni alumni) {
        if (alumni.getEmbeddingVector() == null || alumni.getEmbeddingVector().isEmpty()) {
            return null;
        }
        
        try {
            return objectMapper.readValue(alumni.getEmbeddingVector(), new TypeReference<List<Double>>() {});
        } catch (Exception e) {
            System.err.println("Failed to parse stored embedding: " + e.getMessage());
            return null;
        }
    }

    /**
     * Get or compute alumni embedding (checks stored first)
     */
    public List<Double> getOrComputeAlumniEmbedding(Alumni alumni) {
        List<Double> storedEmbedding = getStoredAlumniEmbedding(alumni);
        if (storedEmbedding != null) {
            return storedEmbedding;
        }
        
        // Compute fresh if not stored
        List<Double> embedding = getAlumniEmbedding(alumni);
        
        // Save for future use
        try {
            saveAlumniEmbedding(alumni.getEnrollmentNumber(), embedding);
        } catch (Exception e) {
            System.err.println("Warning: Failed to save computed embedding: " + e.getMessage());
        }
        
        return embedding;
    }

    /**
     * Refresh embedding for a specific alumni
     */
    @Transactional
    public List<Double> refreshAlumniEmbedding(String enrollmentNumber) {
        Alumni alumni = alumniRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));
        
        List<Double> embedding = getAlumniEmbedding(alumni);
        saveAlumniEmbedding(enrollmentNumber, embedding);
        
        return embedding;
    }

    /**
     * Calculate cosine similarity between two embedding vectors
     */
    public double cosineSimilarity(List<Double> vec1, List<Double> vec2) {
        if (vec1 == null || vec2 == null || vec1.isEmpty() || vec2.isEmpty()) {
            return 0.0;
        }

        if (vec1.size() != vec2.size()) {
            throw new IllegalArgumentException("Vectors must have the same dimension");
        }

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (int i = 0; i < vec1.size(); i++) {
            dotProduct += vec1.get(i) * vec2.get(i);
            norm1 += vec1.get(i) * vec1.get(i);
            norm2 += vec2.get(i) * vec2.get(i);
        }

        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * Search for similar alumni based on a query string
     * Uses stored embeddings when available for better performance
     */
    public List<AlumniSearchResult> searchSimilarAlumni(String query, int topK) {
        // Get embedding for the query
        List<Double> queryEmbedding = getEmbedding(query);

        if (queryEmbedding.isEmpty()) {
            return new ArrayList<>();
        }

        // Get all alumni
        List<Alumni> allAlumni = alumniRepository.findAll();

        // Calculate similarity for each alumni
        List<AlumniSearchResult> results = new ArrayList<>();
        for (Alumni alumni : allAlumni) {
            try {
                // Use stored embedding if available, otherwise compute
                List<Double> alumniEmbedding = getOrComputeAlumniEmbedding(alumni);
                if (alumniEmbedding != null && !alumniEmbedding.isEmpty()) {
                    double similarity = cosineSimilarity(queryEmbedding, alumniEmbedding);
                    results.add(new AlumniSearchResult(alumni, similarity));
                }
            } catch (Exception e) {
                System.err.println("Error processing alumni " + alumni.getEnrollmentNumber() + ": " + e.getMessage());
            }
        }

        // Sort by similarity (descending) and return top K
        return results.stream()
                .sorted((a, b) -> Double.compare(b.getSimilarity(), a.getSimilarity()))
                .limit(topK)
                .collect(Collectors.toList());
    }

    /**
     * Generate and store embeddings for all alumni (batch operation)
     * This can be used for initialization or periodic updates
     */
    @Transactional
    public Map<String, List<Double>> generateAllAlumniEmbeddings() {
        List<Alumni> allAlumni = alumniRepository.findAll();
        Map<String, List<Double>> embeddings = new HashMap<>();

        for (Alumni alumni : allAlumni) {
            try {
                List<Double> embedding = getAlumniEmbedding(alumni);
                saveAlumniEmbedding(alumni.getEnrollmentNumber(), embedding);
                embeddings.put(alumni.getEnrollmentNumber(), embedding);
            } catch (Exception e) {
                System.err.println("Error generating embedding for " + alumni.getEnrollmentNumber() + ": " + e.getMessage());
            }
        }

        return embeddings;
    }

    /**
     * Check if embedding service is available
     */
    public boolean isEmbeddingServiceAvailable() {
        try {
            System.out.println("Checking embedding service health at: " + embeddingServiceUrl + "/health");
            Map<?, ?> health = restTemplate.getForObject(embeddingServiceUrl + "/health", Map.class);
            boolean available = health != null && "ok".equalsIgnoreCase(String.valueOf(health.get("status")));
            if (!available) {
                System.err.println("Embedding service health check failed: Unexpected status " + (health != null ? health.get("status") : "null"));
            }
            return available;
        } catch (Exception e) {
            System.err.println("Embedding service health check failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Clear all embeddings from database
     */
    @Transactional
    public int clearAllEmbeddings() {
        List<Alumni> allAlumni = alumniRepository.findAll();
        int count = 0;
        
        for (Alumni alumni : allAlumni) {
            if (alumni.getEmbeddingVector() != null && !alumni.getEmbeddingVector().isEmpty()) {
                alumni.setEmbeddingVector(null);
                alumniRepository.save(alumni);
                count++;
            }
        }
        
        return count;
    }

    /**
     * Clear all embeddings and regenerate them
     */
    @Transactional
    public Map<String, Object> clearAndRegenerateAllEmbeddings() {
        Map<String, Object> result = new HashMap<>();
        
        // Step 1: Clear old embeddings
        int clearedCount = clearAllEmbeddings();
        result.put("clearedCount", clearedCount);
        
        // Step 2: Regenerate all embeddings
        Map<String, List<Double>> newEmbeddings = generateAllAlumniEmbeddings();
        result.put("generatedCount", newEmbeddings.size());
        result.put("embeddings", newEmbeddings);
        
        return result;
    }
}
