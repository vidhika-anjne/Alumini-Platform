package com.minor.alumini_platform.dto;

public class EmbeddingRequest {
    private String text;

    public EmbeddingRequest() {
    }

    public EmbeddingRequest(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
