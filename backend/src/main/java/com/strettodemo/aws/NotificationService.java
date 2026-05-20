package com.strettodemo.aws;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SqsClient sqsClient;
    private final ObjectMapper objectMapper;

    @Value("${aws.sqs.notification-queue-url}") private String queueUrl;

    @Async
    public void sendCaseStatusChangeNotification(Long caseId, String caseNumber,
                                                  String oldStatus, String newStatus) {
        try {
            Map<String, Object> payload = Map.of(
                    "eventType",   "CASE_STATUS_CHANGED",
                    "caseId",      caseId,
                    "caseNumber",  caseNumber,
                    "oldStatus",   oldStatus,
                    "newStatus",   newStatus,
                    "timestamp",   java.time.Instant.now().toString()
            );
            String body = objectMapper.writeValueAsString(payload);
            sqsClient.sendMessage(SendMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .messageBody(body)
                    .build());
            log.info("SQS notification sent for case {}: {} -> {}", caseNumber, oldStatus, newStatus);
        } catch (Exception e) {
            log.error("Failed to send SQS notification for case {}", caseId, e);
        }
    }
}
