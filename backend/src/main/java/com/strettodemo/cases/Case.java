package com.strettodemo.cases;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.strettodemo.documents.Document;
import com.strettodemo.users.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_number", nullable = false, unique = true)
    private String caseNumber;

    @Column(name = "debtor_name", nullable = false)
    private String debtorName;

    @Column(nullable = false)
    private Short chapter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status;

    @Column(name = "filing_date", nullable = false)
    private LocalDate filingDate;

    @Column(name = "court_district")
    private String courtDistrict;

    @Column(name = "judge_name")
    private String judgeName;

    @Column(name = "trustee_name")
    private String trusteeName;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @OneToMany(mappedBy = "caseEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<Document> documents = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CaseStatus { OPEN, CLOSED, DISMISSED, CONVERTED }
}
