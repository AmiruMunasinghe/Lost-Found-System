package com.uom.lostfound.matching.dto;

import java.util.Map;

public class ScoredCandidate {
    private Object counterpart;
    private double confidenceScore;
    private ScoreBreakdown scoreBreakdown;
    private Map<String, Double> breakdownMap;

    public ScoredCandidate() {
    }

    public ScoredCandidate(Object counterpart, double confidenceScore, ScoreBreakdown scoreBreakdown,
            Map<String, Double> breakdownMap) {
        this.counterpart = counterpart;
        this.confidenceScore = confidenceScore;
        this.scoreBreakdown = scoreBreakdown;
        this.breakdownMap = breakdownMap;
    }

    public Object getCounterpart() {
        return counterpart;
    }

    public void setCounterpart(Object counterpart) {
        this.counterpart = counterpart;
    }

    public double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public ScoreBreakdown getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(ScoreBreakdown scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown;
    }

    public Map<String, Double> getBreakdownMap() {
        return breakdownMap;
    }

    public void setBreakdownMap(Map<String, Double> breakdownMap) {
        this.breakdownMap = breakdownMap;
    }

    public static ScoredCandidateBuilder builder() {
        return new ScoredCandidateBuilder();
    }

    public static class ScoredCandidateBuilder {
        private Object counterpart;
        private double confidenceScore;
        private ScoreBreakdown scoreBreakdown;
        private Map<String, Double> breakdownMap;

        public ScoredCandidateBuilder counterpart(Object counterpart) {
            this.counterpart = counterpart;
            return this;
        }

        public ScoredCandidateBuilder confidenceScore(double confidenceScore) {
            this.confidenceScore = confidenceScore;
            return this;
        }

        public ScoredCandidateBuilder scoreBreakdown(ScoreBreakdown scoreBreakdown) {
            this.scoreBreakdown = scoreBreakdown;
            return this;
        }

        public ScoredCandidateBuilder breakdownMap(Map<String, Double> breakdownMap) {
            this.breakdownMap = breakdownMap;
            return this;
        }

        public ScoredCandidate build() {
            return new ScoredCandidate(counterpart, confidenceScore, scoreBreakdown, breakdownMap);
        }
    }
}
