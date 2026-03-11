package com.supportiq.tickets.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCommentRequest {
    @NotBlank(message = "Content is required")
    private String content;

    private boolean isInternal = false;
    private boolean isAiGenerated = false;
    private String customerId;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isInternal() {
        return isInternal;
    }

    public void setInternal(boolean internal) {
        isInternal = internal;
    }

    public boolean isAiGenerated() {
        return isAiGenerated;
    }

    public void setAiGenerated(boolean aiGenerated) {
        isAiGenerated = aiGenerated;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }
}
