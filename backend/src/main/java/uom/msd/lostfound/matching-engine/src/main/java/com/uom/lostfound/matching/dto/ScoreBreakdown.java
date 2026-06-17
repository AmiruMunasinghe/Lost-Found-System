package com.uom.lostfound.matching.dto;

import java.util.Map;

public class ScoreBreakdown {
    private double textScore;
    private double locationScore;
    private double temporalScore;
    private double categoryScore;
    private double compositeScore;

    public ScoreBreakdown() {
    }

    public ScoreBreakdown(double textScore, double locationScore, double temporalScore, double categoryScore,
            double compositeScore) {
        this.textScore = textScore;
        this.locationScore = locationScore;
        this.temporalScore = temporalScore;
        this.categoryScore = categoryScore;
        this.compositeScore = compositeScore;
    }

    public double getTextScore() {
        return textScore;
    }

    public void setTextScore(double textScore) {
        this.textScore = textScore;
    }

    public double getLocationScore() {
        return locationScore;
    }

    public void setLocationScore(double locationScore) {
        this.locationScore = locationScore;
    }

    public double getTemporalScore() {
        return temporalScore;
    }

    public void setTemporalScore(double temporalScore) {
        this.temporalScore = temporalScore;
    }

    public double getCategoryScore() {
        return categoryScore;
    }

    public void setCategoryScore(double categoryScore) {
        this.categoryScore = categoryScore;
    }

    public double getCompositeScore() {
        return compositeScore;
    }

    public void setCompositeScore(double compositeScore) {
        this.compositeScore = compositeScore;
    }

    public Map<String, Double> toMap() {
        return Map.of(
                "textScore", textScore,
                "locationScore", locationScore,
                "temporalScore", temporalScore,
                "categoryScore", categoryScore,
                "compositeScore", compositeScore);
    }

    public static ScoreBreakdownBuilder builder() {
        return new ScoreBreakdownBuilder();
    }

    public static class ScoreBreakdownBuilder {
        private double textScore;
        private double locationScore;
        private double temporalScore;
        private double categoryScore;
        private double compositeScore;

        public ScoreBreakdownBuilder textScore(double textScore) {
            this.textScore = textScore;
            return this;
        }

        public ScoreBreakdownBuilder locationScore(double locationScore) {
            this.locationScore = locationScore;
            return this;
        }

        public ScoreBreakdownBuilder temporalScore(double temporalScore) {
            this.temporalScore = temporalScore;
            return this;
        }

        public ScoreBreakdownBuilder categoryScore(double categoryScore) {
            this.categoryScore = categoryScore;
            return this;
        }

        public ScoreBreakdownBuilder compositeScore(double compositeScore) {
            this.compositeScore = compositeScore;
            return this;
        }

        public ScoreBreakdown build() {
            return new ScoreBreakdown(textScore, locationScore, temporalScore, categoryScore, compositeScore);
        }
    }
}
