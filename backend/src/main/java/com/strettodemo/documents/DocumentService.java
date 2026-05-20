package com.strettodemo.documents;

import com.strettodemo.cases.Case;
import com.strettodemo.cases.CaseRepository;
import com.strettodemo.users.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CaseRepository caseRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}") private String bucket;

    @Transactional
    public Document upload(Long caseId, MultipartFile file, User uploader) throws IOException {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new EntityNotFoundException("Case not found: " + caseId));

        String s3Key = "cases/" + caseId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(s3Key)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes()));

        Document doc = Document.builder()
                .caseEntity(caseEntity)
                .fileName(file.getOriginalFilename())
                .s3Key(s3Key)
                .contentType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .uploadedBy(uploader)
                .build();
        return documentRepository.save(doc);
    }

    public String generatePresignedUrl(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + documentId));

        PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(15))
                        .getObjectRequest(r -> r.bucket(bucket).key(doc.getS3Key()))
                        .build());
        return presigned.url().toString();
    }

    @Transactional
    public void delete(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + documentId));
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(doc.getS3Key()).build());
        documentRepository.delete(doc);
    }

    @Transactional(readOnly = true)
    public List<Document> listByCaseId(Long caseId) {
        return documentRepository.findByCaseEntityId(caseId);
    }
}
