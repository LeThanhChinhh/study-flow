package com.studyflow.core.controllers;

import com.studyflow.core.dtos.materials.MaterialStatusResponse;
import com.studyflow.core.dtos.materials.MaterialUploadResponse;
import com.studyflow.core.services.MaterialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/materials")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.ACCEPTED)
    public MaterialUploadResponse uploadMaterial(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "goalId", required = false) UUID goalId,
            Authentication authentication
    ) {
        return materialService.uploadMaterial(file, goalId, authentication);
    }

    @GetMapping("/status/{jobId}")
    public MaterialStatusResponse getMaterialStatus(
            @PathVariable String jobId,
            Authentication authentication
    ) {
        return materialService.getMaterialStatus(jobId, authentication);
    }
}
