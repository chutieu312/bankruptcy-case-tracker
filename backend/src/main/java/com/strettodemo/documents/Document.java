package com.strettodemo.documents;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.strettodemo.cases.Case;
import com.strettodemo.users.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    @JsonIgnore
    private Case caseEntity;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "s3_key", nullable = false, unique = true)
    private String s3Key;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id")
    private User uploadedBy;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    void prePersist() {
        uploadedAt = LocalDateTime.now();
    }
}
