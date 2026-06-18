package com.uom.lostfound.matching.dto;

import java.util.List;
import java.util.UUID;

public class MatchingResultDto {
    private UUID lostItemId;
    private UUID foundItemId;
    private int totalCandidatesEvaluated;
    private int matchesCreated;
    private List<MatchDto> matches;

    public MatchingResultDto() {
    }

    public MatchingResultDto(UUID lostItemId, UUID foundItemId, int totalCandidatesEvaluated, int matchesCreated,
            List<MatchDto> matches) {
        this.lostItemId = lostItemId;
        this.foundItemId = foundItemId;
        this.totalCandidatesEvaluated = totalCandidatesEvaluated;
        this.matchesCreated = matchesCreated;
        this.matches = matches;
    }

    public UUID getLostItemId() {
        return lostItemId;
    }

    public void setLostItemId(UUID lostItemId) {
        this.lostItemId = lostItemId;
    }

    public UUID getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(UUID foundItemId) {
        this.foundItemId = foundItemId;
    }

    public int getTotalCandidatesEvaluated() {
        return totalCandidatesEvaluated;
    }

    public void setTotalCandidatesEvaluated(int totalCandidatesEvaluated) {
        this.totalCandidatesEvaluated = totalCandidatesEvaluated;
    }

    public int getMatchesCreated() {
        return matchesCreated;
    }

    public void setMatchesCreated(int matchesCreated) {
        this.matchesCreated = matchesCreated;
    }

    public List<MatchDto> getMatches() {
        return matches;
    }

    public void setMatches(List<MatchDto> matches) {
        this.matches = matches;
    }

    public static MatchingResultDtoBuilder builder() {
        return new MatchingResultDtoBuilder();
    }

    public static class MatchingResultDtoBuilder {
        private UUID lostItemId;
        private UUID foundItemId;
        private int totalCandidatesEvaluated;
        private int matchesCreated;
        private List<MatchDto> matches;

        public MatchingResultDtoBuilder lostItemId(UUID lostItemId) {
            this.lostItemId = lostItemId;
            return this;
        }

        public MatchingResultDtoBuilder foundItemId(UUID foundItemId) {
            this.foundItemId = foundItemId;
            return this;
        }

        public MatchingResultDtoBuilder totalCandidatesEvaluated(int totalCandidatesEvaluated) {
            this.totalCandidatesEvaluated = totalCandidatesEvaluated;
            return this;
        }

        public MatchingResultDtoBuilder matchesCreated(int matchesCreated) {
            this.matchesCreated = matchesCreated;
            return this;
        }

        public MatchingResultDtoBuilder matches(List<MatchDto> matches) {
            this.matches = matches;
            return this;
        }

        public MatchingResultDto build() {
            return new MatchingResultDto(lostItemId, foundItemId, totalCandidatesEvaluated, matchesCreated, matches);
        }
    }
}
