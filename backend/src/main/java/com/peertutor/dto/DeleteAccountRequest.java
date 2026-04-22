package com.peertutor.dto;

import jakarta.validation.constraints.NotNull;

public class DeleteAccountRequest {
    
    @NotNull(message = "Delete type is required")
    private String deleteType; // "STUDENT", "TUTOR", or "BOTH"

    public DeleteAccountRequest() {}

    public String getDeleteType() { return deleteType; }
    public void setDeleteType(String deleteType) { this.deleteType = deleteType; }
}