package com.strettodemo.cases;

import com.strettodemo.cases.Case.CaseStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CaseRequest(
        @NotBlank String caseNumber,
        @NotBlank String debtorName,
        @NotNull @Min(7) @Max(13) Short chapter,
        @NotNull LocalDate filingDate,
        String courtDistrict,
        String judgeName,
        String trusteeName,
        String notes,
        Long assignedToId
) {}
