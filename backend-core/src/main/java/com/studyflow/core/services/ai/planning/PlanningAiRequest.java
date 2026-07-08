package com.studyflow.core.services.ai.planning;

public class PlanningAiRequest {
    private final String fileName;
    private final String contentType;
    private final byte[] fileBytes;

    public PlanningAiRequest(String fileName, String contentType, byte[] fileBytes) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileBytes = fileBytes;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public byte[] getFileBytes() {
        return fileBytes;
    }
}
