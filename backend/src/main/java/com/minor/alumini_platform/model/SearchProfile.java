package com.minor.alumini_platform.model;

import com.minor.alumini_platform.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "search_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // STUDENT / ALUMNI
    @Enumerated(EnumType.STRING)
    private UserType userType;

    // enrollmentNumber can be used as unique reference or the primary ID
    @Column(nullable = false)
    private String enrollmentNumber;

    // ---- What will be embedded ----
    @Column(length = 3000)
    private String searchableText;

    // ---- Vector (stored as JSON string for simple implementation) ----
    @Lob
    private String embeddingVector;

    // metadata (for filtering alongside semantic search)
    private String department;
    private Integer passingYear;
    private String currentCompany;
    private String jobTitle;

    @Column(columnDefinition = "boolean default true")
    private boolean active = true;
}
