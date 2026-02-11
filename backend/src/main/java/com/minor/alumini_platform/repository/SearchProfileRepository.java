package com.minor.alumini_platform.repository;

import com.minor.alumini_platform.model.SearchProfile;
import com.minor.alumini_platform.enums.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface SearchProfileRepository extends JpaRepository<SearchProfile, Long> {
    Optional<SearchProfile> findByEnrollmentNumber(String enrollmentNumber);
    List<SearchProfile> findByUserType(UserType userType);
    List<SearchProfile> findByActiveTrue();
    
    @org.springframework.data.jpa.repository.Query("SELECT p FROM SearchProfile p WHERE " +
            "p.active = true AND (" +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(p.department) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(p.searchableText) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<SearchProfile> searchAllFields(@org.springframework.data.repository.query.Param("q") String q);
}
