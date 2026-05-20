package com.strettodemo.documents;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCaseEntityId(Long caseId);
}
