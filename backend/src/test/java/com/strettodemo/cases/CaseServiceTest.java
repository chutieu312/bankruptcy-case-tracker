package com.strettodemo.cases;

import com.strettodemo.aws.NotificationService;
import com.strettodemo.users.User;
import com.strettodemo.users.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CaseServiceTest {

    @Mock CaseRepository caseRepository;
    @Mock UserRepository userRepository;
    @Mock NotificationService notificationService;
    @InjectMocks CaseService caseService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).email("a@test.com").fullName("Test User")
                .role(User.Role.ATTORNEY).build();
    }

    @Test
    void create_shouldSaveCaseWithOpenStatus() {
        CaseRequest req = new CaseRequest("2024-BK-99999", "Debtor Inc", (short) 11,
                LocalDate.now(), "D. Del.", null, null, null, null);
        Case saved = Case.builder().id(1L).caseNumber(req.caseNumber())
                .debtorName(req.debtorName()).chapter(req.chapter())
                .status(Case.CaseStatus.OPEN).filingDate(req.filingDate()).build();
        when(caseRepository.save(any())).thenReturn(saved);

        Case result = caseService.create(req, mockUser);

        assertThat(result.getStatus()).isEqualTo(Case.CaseStatus.OPEN);
        assertThat(result.getCaseNumber()).isEqualTo("2024-BK-99999");
        verify(caseRepository).save(any(Case.class));
    }

    @Test
    void getById_whenNotFound_shouldThrow() {
        when(caseRepository.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> caseService.getById(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void updateStatus_shouldPublishSqsNotification() {
        Case existing = Case.builder().id(1L).caseNumber("2024-BK-00001")
                .status(Case.CaseStatus.OPEN).build();
        when(caseRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(caseRepository.save(any())).thenReturn(existing);

        caseService.updateStatus(1L, Case.CaseStatus.CLOSED);

        verify(notificationService).sendCaseStatusChangeNotification(
                eq(1L), eq("2024-BK-00001"), eq("OPEN"), eq("CLOSED"));
    }

    @Test
    void updateStatus_toSameStatus_shouldStillSaveAndNotify() {
        Case existing = Case.builder().id(1L).caseNumber("2024-BK-00001")
                .status(Case.CaseStatus.OPEN).build();
        when(caseRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(caseRepository.save(any())).thenReturn(existing);

        caseService.updateStatus(1L, Case.CaseStatus.OPEN);

        verify(caseRepository).save(any());
    }
}
