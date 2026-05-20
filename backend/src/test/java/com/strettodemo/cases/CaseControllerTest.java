package com.strettodemo.cases;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.strettodemo.auth.JwtService;
import com.strettodemo.users.User;
import com.strettodemo.users.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CaseController.class)
class CaseControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean CaseService caseService;
    @MockBean JwtService jwtService;
    @MockBean UserRepository userRepository;

    @Test
    @WithMockUser
    void GET_cases_shouldReturnPage() throws Exception {
        Case c = Case.builder().id(1L).caseNumber("2024-BK-00001")
                .debtorName("Acme Corp").chapter((short) 11)
                .status(Case.CaseStatus.OPEN).filingDate(LocalDate.now()).build();
        when(caseService.search(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(c)));

        mockMvc.perform(get("/cases").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].caseNumber").value("2024-BK-00001"));
    }

    @Test
    @WithMockUser
    void GET_summary_shouldReturnStatusCounts() throws Exception {
        when(caseService.getStatusSummary()).thenReturn(Map.of("OPEN", 3L, "CLOSED", 1L));

        mockMvc.perform(get("/cases/summary").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.OPEN").value(3));
    }

    @Test
    @WithMockUser
    void GET_caseById_notFound_shouldReturn404() throws Exception {
        when(caseService.getById(999L)).thenThrow(new jakarta.persistence.EntityNotFoundException("Case not found: 999"));

        mockMvc.perform(get("/cases/999").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void GET_cases_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(get("/cases").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
