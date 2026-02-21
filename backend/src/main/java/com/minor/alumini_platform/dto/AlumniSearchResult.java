package com.minor.alumini_platform.dto;

import com.minor.alumini_platform.model.Alumni;

public class AlumniSearchResult {
    private Alumni alumni;
    private double similarity;

    public AlumniSearchResult() {
    }

    public AlumniSearchResult(Alumni alumni, double similarity) {
        this.alumni = alumni;
        this.similarity = similarity;
    }

    public Alumni getAlumni() {
        return alumni;
    }

    public void setAlumni(Alumni alumni) {
        this.alumni = alumni;
    }

    public double getSimilarity() {
        return similarity;
    }

    public void setSimilarity(double similarity) {
        this.similarity = similarity;
    }
}
