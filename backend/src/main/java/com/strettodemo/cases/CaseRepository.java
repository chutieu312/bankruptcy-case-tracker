package com.strettodemo.cases;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CaseRepository extends JpaRepository<Case, Long> {

    // --- Complex filtered search (demonstrates JD SQL requirement) ---
    @Query("""
            SELECT c FROM Case c
            LEFT JOIN FETCH c.assignedTo
            WHERE (:status IS NULL OR c.status = :status)
              AND (:chapter IS NULL OR c.chapter = :chapter)
              AND (:debtorName IS NULL OR LOWER(c.debtorName) LIKE LOWER(CONCAT('%', CAST(:debtorName AS String), '%')))
              AND (:fromDate IS NULL OR c.filingDate >= :fromDate)
              AND (:toDate   IS NULL OR c.filingDate <= :toDate)
            ORDER BY c.filingDate DESC
            """)
    Page<Case> searchCases(
            @Param("status")     Case.CaseStatus status,
            @Param("chapter")    Short chapter,
            @Param("debtorName") String debtorName,
            @Param("fromDate")   LocalDate fromDate,
            @Param("toDate")     LocalDate toDate,
            Pageable pageable);

    // --- Dashboard aggregation: count per status ---
    @Query("""
            SELECT c.status AS status, COUNT(c) AS total
            FROM Case c
            GROUP BY c.status
            """)
    List<StatusCount> countByStatus();

    // --- Cases assigned to a user ---
    @Query("SELECT c FROM Case c WHERE c.assignedTo.id = :userId ORDER BY c.updatedAt DESC")
    List<Case> findByAssignedToId(@Param("userId") Long userId);

    interface StatusCount {
        Case.CaseStatus getStatus();
        Long getTotal();
    }
}
