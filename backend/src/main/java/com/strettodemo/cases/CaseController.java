package com.strettodemo.cases;

import com.strettodemo.cases.Case.CaseStatus;
import com.strettodemo.users.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @GetMapping
    public Page<Case> search(
            @RequestParam(required = false) CaseStatus status,
            @RequestParam(required = false) Short chapter,
            @RequestParam(required = false) String debtorName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @PageableDefault(size = 20, sort = "filingDate") Pageable pageable) {
        return caseService.search(status, chapter, debtorName, fromDate, toDate, pageable);
    }

    @GetMapping("/summary")
    public Map<String, Long> summary() {
        return caseService.getStatusSummary();
    }

    @GetMapping("/{id}")
    public Case getById(@PathVariable Long id) {
        return caseService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Case> create(@Valid @RequestBody CaseRequest req,
                                       @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(caseService.create(req, currentUser));
    }

    @PutMapping("/{id}")
    public Case update(@PathVariable Long id, @Valid @RequestBody CaseRequest req) {
        return caseService.update(id, req);
    }

    @PatchMapping("/{id}/status")
    public Case updateStatus(@PathVariable Long id, @RequestParam CaseStatus status) {
        return caseService.updateStatus(id, status);
    }
}
