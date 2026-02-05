package com.minor.alumini_platform.service;

import com.minor.alumini_platform.enums.ConnectionStatus;
import com.minor.alumini_platform.model.Connection;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.ConnectionRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final AlumniRepository alumniRepository;
    private final StudentRepository studentRepository;

    public ConnectionService(ConnectionRepository connectionRepository,
                             AlumniRepository alumniRepository,
                             StudentRepository studentRepository) {
        this.connectionRepository = connectionRepository;
        this.alumniRepository = alumniRepository;
        this.studentRepository = studentRepository;
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

        if (!((isRequesterAlumni && isReceiverStudent) || (isRequesterStudent && isReceiverAlumni))) {
            throw new RuntimeException("Connections are only allowed between Alumni and Students");
        }

        Optional<Connection> existing = connectionRepository.findConnectionBetween(requesterId, receiverId);
        if (existing.isPresent()) {
            throw new RuntimeException("Connection request already exists or you are already connected");
        }

        Connection connection = new Connection(requesterId, receiverId, ConnectionStatus.PENDING);
        return connectionRepository.save(connection);
    }

    @Transactional
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
    public void rejectRequest(String receiverId, String requesterId) {
        Connection connection = connectionRepository.findByRequesterIdAndReceiverId(requesterId, receiverId)
                .orElseThrow(() -> new RuntimeException("Connection request not found"));

        connectionRepository.delete(connection);
    }

    public boolean areConnected(String userId1, String userId2) {
        return connectionRepository.findConnectionBetween(userId1, userId2)
                .map(c -> c.getStatus() == ConnectionStatus.ACCEPTED)
                .orElse(false);
    }

    public List<Connection> getPendingRequests(String userId) {
        return connectionRepository.findByReceiverIdAndStatus(userId, ConnectionStatus.PENDING);
    }

    public List<Connection> getMyConnections(String userId) {
        return connectionRepository.findAllAcceptedForUser(userId);
    }
}
