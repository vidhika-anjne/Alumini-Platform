package com.minor.alumini_platform.service;

import com.minor.alumini_platform.dto.ConnectedUserDTO;
import com.minor.alumini_platform.enums.ConnectionStatus;
import com.minor.alumini_platform.model.Connection;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.ConnectionRepository;
import com.minor.alumini_platform.repository.SearchProfileRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final AlumniRepository alumniRepository;
    private final StudentRepository studentRepository;
    private final SearchProfileRepository searchProfileRepository;

    public ConnectionService(ConnectionRepository connectionRepository,
                             AlumniRepository alumniRepository,
                             StudentRepository studentRepository,
                             SearchProfileRepository searchProfileRepository) {
        this.connectionRepository = connectionRepository;
        this.alumniRepository = alumniRepository;
        this.studentRepository = studentRepository;
        this.searchProfileRepository = searchProfileRepository;
    }

    @Transactional
    public Connection sendRequest(String requesterId, String receiverId) {
        if (requesterId.equals(receiverId)) {
            throw new RuntimeException("You cannot connect with yourself");
        }

        // Validate "Only between alumni and student"
        boolean isRequesterAlumni = alumniRepository.findByEnrollmentNumber(requesterId).isPresent();
        boolean isRequesterStudent = studentRepository.findByEnrollmentNumber(requesterId).isPresent();
        boolean isReceiverAlumni = alumniRepository.findByEnrollmentNumber(receiverId).isPresent();
        boolean isReceiverStudent = studentRepository.findByEnrollmentNumber(receiverId).isPresent();

        // New Logic: Allow Alumni-to-Alumni and Alumni-Student. Still block Student-to-Student.
        if (isRequesterStudent && isReceiverStudent) {
            throw new RuntimeException("Students cannot connect with other students. They can only connect with Alumni.");
        }

        // Ensure both users exist
        if (!((isRequesterAlumni || isRequesterStudent) && (isReceiverAlumni || isReceiverStudent))) {
            throw new RuntimeException("One or both users do not exist");
        }

        Optional<Connection> existing = connectionRepository.findConnectionBetween(requesterId, receiverId);
        if (existing.isPresent()) {
            throw new RuntimeException("Connection request already exists or you are already connected");
        }

        Connection connection = new Connection(requesterId, receiverId, ConnectionStatus.PENDING);
        return connectionRepository.save(connection);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "connectionStatus", key = "#requesterId < #receiverId ? #requesterId + '-' + #receiverId : #receiverId + '-' + #requesterId"),
        @CacheEvict(value = "userConnections", key = "#requesterId"),
        @CacheEvict(value = "userConnections", key = "#receiverId")
    })
    public void acceptRequest(String receiverId, String requesterId) {
        Connection connection = connectionRepository.findByRequesterIdAndReceiverId(requesterId, receiverId)
                .orElseThrow(() -> new RuntimeException("Connection request not found"));

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new RuntimeException("Request is not in PENDING state");
        }

        connection.setStatus(ConnectionStatus.ACCEPTED);
        connection.setUpdatedAt(LocalDateTime.now());
        connectionRepository.save(connection);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "connectionStatus", key = "#requesterId < #receiverId ? #requesterId + '-' + #receiverId : #receiverId + '-' + #requesterId"),
        @CacheEvict(value = "userConnections", key = "#requesterId"),
        @CacheEvict(value = "userConnections", key = "#receiverId")
    })
    public void rejectRequest(String receiverId, String requesterId) {
        Connection connection = connectionRepository.findByRequesterIdAndReceiverId(requesterId, receiverId)
                .orElseThrow(() -> new RuntimeException("Connection request not found"));

        connectionRepository.delete(connection);
    }

    @Cacheable(value = "connectionStatus", key = "#userId1 < #userId2 ? #userId1 + '-' + #userId2 : #userId2 + '-' + #userId1")
    public boolean areConnected(String userId1, String userId2) {
        return connectionRepository.findConnectionBetween(userId1, userId2)
                .map(c -> c.getStatus() == ConnectionStatus.ACCEPTED)
                .orElse(false);
    }

    public boolean isRequestPending(String userId1, String userId2) {
        return connectionRepository.findConnectionBetween(userId1, userId2)
                .map(c -> c.getStatus() == ConnectionStatus.PENDING)
                .orElse(false);
    }

    public List<Connection> getPendingRequests(String userId) {
        return connectionRepository.findByReceiverIdAndStatus(userId, ConnectionStatus.PENDING);
    }

    @Cacheable(value = "userConnections", key = "#userId")
    public List<Connection> getMyConnections(String userId) {
        return connectionRepository.findAllAcceptedForUser(userId);
    }

    public List<ConnectedUserDTO> getConnectedUsers(String userId) {
        List<Connection> connections = connectionRepository.findAllAcceptedForUser(userId);
        return connections.stream().map(c -> {
            String otherId = c.getRequesterId().equals(userId) ? c.getReceiverId() : c.getRequesterId();
            return searchProfileRepository.findByEnrollmentNumber(otherId)
                    .map(p -> new ConnectedUserDTO(p.getEnrollmentNumber(), p.getName(), p.getUserType(), p.getAvatarUrl()))
                    .orElse(new ConnectedUserDTO(otherId, "Unknown User", null, null));
        }).collect(Collectors.toList());
    }
}
