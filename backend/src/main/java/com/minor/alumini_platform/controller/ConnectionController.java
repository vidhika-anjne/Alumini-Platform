package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.model.Connection;
import com.minor.alumini_platform.service.ConnectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/connections")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<Map<String, Object>> sendRequest(Principal principal, @PathVariable String receiverId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Connection connection = connectionService.sendRequest(principal.getName(), receiverId);
            response.put("success", true);
            response.put("message", "Connection request sent");
            response.put("connection", connection);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/accept/{requesterId}")
    public ResponseEntity<Map<String, Object>> acceptRequest(Principal principal, @PathVariable String requesterId) {
        Map<String, Object> response = new HashMap<>();
        try {
            connectionService.acceptRequest(principal.getName(), requesterId);
            response.put("success", true);
            response.put("message", "Connection request accepted");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/reject/{requesterId}")
    public ResponseEntity<Map<String, Object>> rejectRequest(Principal principal, @PathVariable String requesterId) {
        Map<String, Object> response = new HashMap<>();
        try {
            connectionService.rejectRequest(principal.getName(), requesterId);
            response.put("success", true);
            response.put("message", "Connection request rejected");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Connection>> getPendingRequests(Principal principal) {
        return ResponseEntity.ok(connectionService.getPendingRequests(principal.getName()));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Connection>> getMyConnections(Principal principal) {
        return ResponseEntity.ok(connectionService.getMyConnections(principal.getName()));
    }
    
    @GetMapping("/status/{otherUserId}")
    public ResponseEntity<Map<String, Object>> getStatus(Principal principal, @PathVariable String otherUserId) {
        Map<String, Object> response = new HashMap<>();
        boolean connected = connectionService.areConnected(principal.getName(), otherUserId);
        response.put("connected", connected);
        return ResponseEntity.ok(response);
    }
}
