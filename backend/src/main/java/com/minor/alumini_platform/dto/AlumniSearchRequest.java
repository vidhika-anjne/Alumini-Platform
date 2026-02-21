package com.minor.alumini_platform.dto;

public class AlumniSearchRequest {
    private String query;
    private int topK = 10; // Number of top results to return

    public AlumniSearchRequest() {
    }

    public AlumniSearchRequest(String query, int topK) {
        this.query = query;
        this.topK = topK;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public int getTopK() {
        return topK;
    }

    public void setTopK(int topK) {
        this.topK = topK;
    }
}
