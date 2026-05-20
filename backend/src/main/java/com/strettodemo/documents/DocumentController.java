package com.strettodemo.documents;

import com.strettodemo.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cases/{caseId}/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public List<Document> list(@PathVariable Long caseId) {
        return documentService.listByCaseId(caseId);
    }

    @PostMapping
    public ResponseEntity<Document> upload(
            @PathVariable Long caseId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) throws IOException {
        Document doc = documentService.upload(caseId, file, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @GetMapping("/{documentId}/download-url")
    public Map<String, String> downloadUrl(@PathVariable Long caseId,
                                           @PathVariable Long documentId) {
        return Map.of("url", documentService.generatePresignedUrl(documentId));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> delete(@PathVariable Long caseId,
                                       @PathVariable Long documentId) {
        documentService.delete(documentId);
        return ResponseEntity.noContent().build();
    }
}
