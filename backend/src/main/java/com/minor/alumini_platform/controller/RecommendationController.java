package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.model.Alumni;
import com.minor.alumini_platform.service.RecommendationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/v1/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/students/{enrollmentNumber}")
    public List<Alumni> recommendAlumniForStudent(
            @PathVariable String enrollmentNumber,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return recommendationService.recommendAlumniForStudent(enrollmentNumber, limit);
    }
}
