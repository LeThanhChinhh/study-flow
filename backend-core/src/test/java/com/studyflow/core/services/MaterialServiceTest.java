package com.studyflow.core.services;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class MaterialServiceTest {

    @Test
    void acceptsPdfSignature() {
        byte[] bytes = "\u0000\u0000%PDF-1.7\ncontent".getBytes(StandardCharsets.US_ASCII);

        assertThat(MaterialService.hasPdfSignature(bytes)).isTrue();
    }

    @Test
    void rejectsRenamedNonPdfContent() {
        byte[] bytes = "not a real pdf".getBytes(StandardCharsets.US_ASCII);

        assertThat(MaterialService.hasPdfSignature(bytes)).isFalse();
    }
}
