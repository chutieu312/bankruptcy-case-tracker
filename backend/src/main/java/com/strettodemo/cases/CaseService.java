package com.strettodemo.cases;

import com.strettodemo.aws.NotificationService;
import com.strettodemo.cases.Case.CaseStatus;
import com.strettodemo.cases.CaseRepository.StatusCount;
import com.strettodemo.users.User;
import com.strettodemo.users.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<Case> search(CaseStatus status, Short chapter, String debtorName,
                             LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        return caseRepository.searchCases(status, chapter, debtorName, fromDate, toDate, pageable);
    }

    @Transactional(readOnly = true)
    public Case getById(Long id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Case not found: " + id));
    }

    @Transactional
    public Case create(CaseRequest req, User createdBy) {
        Case c = Case.builder()
                .caseNumber(req.caseNumber())
                .debtorName(req.debtorName())
                .chapter(req.chapter())
                .status(CaseStatus.OPEN)
                .filingDate(req.filingDate())
                .courtDistrict(req.courtDistrict())
                .judgeName(req.judgeName())
                .trusteeName(req.trusteeName())
                .notes(req.notes())
                .createdBy(createdBy)
                .assignedTo(resolveUser(req.assignedToId()))
                .build();
        return caseRepository.save(c);
    }

    @Transactional
    public Case update(Long id, CaseRequest req) {
        Case c = getById(id);
        c.setDebtorName(req.debtorName());
        c.setChapter(req.chapter());
        c.setCourtDistrict(req.courtDistrict());
        c.setJudgeName(req.judgeName());
        c.setTrusteeName(req.trusteeName());
        c.setNotes(req.notes());
        c.setAssignedTo(resolveUser(req.assignedToId()));
        return caseRepository.save(c);
    }

    @Transactional
    public Case updateStatus(Long id, CaseStatus newStatus) {
        Case c = getById(id);
        String oldStatus = c.getStatus().name();
        c.setStatus(newStatus);
        Case saved = caseRepository.save(c);
        notificationService.sendCaseStatusChangeNotification(
                saved.getId(), saved.getCaseNumber(), oldStatus, newStatus.name());
        return saved;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getStatusSummary() {
        List<StatusCount> counts = caseRepository.countByStatus();
        return counts.stream().collect(
                Collectors.toMap(sc -> sc.getStatus().name(), StatusCount::getTotal));
    }

    private User resolveUser(Long userId) {
        if (userId == null) return null;
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
    }
}
