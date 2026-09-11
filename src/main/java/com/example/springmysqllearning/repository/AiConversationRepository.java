package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiConversationRepository
        extends JpaRepository<AiConversation, Long> {

    // Get only conversations belonging to a particular user
    List<AiConversation> findByUserIdOrderByUpdatedAtDesc(
            Long userId
    );

    // Find a specific conversation only if it belongs
    // to the authenticated user
    Optional<AiConversation> findByIdAndUserId(
            Long conversationId,
            Long userId
    );
}