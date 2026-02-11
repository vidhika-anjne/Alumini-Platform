package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.dto.UserSearchResultDTO;
import com.minor.alumini_platform.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "Search endpoint is working");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> searchUsers(@RequestParam String query) {
        Map<String, Object> response = new HashMap<>();
        System.out.println("🔍 SEARCH REQUEST RECEIVED: query=" + query);
        try {
            List<UserSearchResultDTO> results = searchService.searchUsers(query);
            System.out.println("✅ SEARCH RESULTS: Found " + results.size() + " matches");
            response.put("success", true);
            response.put("results", results);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ SEARCH ERROR: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Search failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}