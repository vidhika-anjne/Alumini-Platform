package com.minor.alumini_platform.repository;

import com.minor.alumini_platform.model.Connection;
import com.minor.alumini_platform.enums.ConnectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    Optional<Connection> findByRequesterIdAndReceiverId(String requesterId, String receiverId);

    @Query("SELECT c FROM Connection c WHERE (c.requesterId = :u1 AND c.receiverId = :u2) OR (c.requesterId = :u2 AND c.receiverId = :u1)")
    Optional<Connection> findConnectionBetween(@Param("u1") String u1, @Param("u2") String u2);

    List<Connection> findByReceiverIdAndStatus(String receiverId, ConnectionStatus status);

    List<Connection> findByRequesterIdAndStatus(String requesterId, ConnectionStatus status);

    @Query("SELECT c FROM Connection c WHERE (c.requesterId = :userId OR c.receiverId = :userId) AND c.status = 'ACCEPTED'")
    List<Connection> findAllAcceptedForUser(@Param("userId") String userId);
}
