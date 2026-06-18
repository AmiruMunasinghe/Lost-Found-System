package uom.msd.lostfound.dto;

import java.util.*;

/**
 * DTO for analytics dashboard - comprehensive claims analytics
 */
public class AnalyticsResponseDTO {
    private SummaryDTO summary;
    private List<TrendSeriesDTO> trendSeries;
    private List<StatusBreakdownDTO> statusBreakdown;
    private List<CategoryBreakdownDTO> categoryBreakdown;
    private List<LocationBreakdownDTO> locationBreakdown;

    public AnalyticsResponseDTO() {
        this.trendSeries = new ArrayList<>();
        this.statusBreakdown = new ArrayList<>();
        this.categoryBreakdown = new ArrayList<>();
        this.locationBreakdown = new ArrayList<>();
    }

    public AnalyticsResponseDTO(SummaryDTO summary, List<TrendSeriesDTO> trendSeries,
                                List<StatusBreakdownDTO> statusBreakdown,
                                List<CategoryBreakdownDTO> categoryBreakdown,
                                List<LocationBreakdownDTO> locationBreakdown) {
        this.summary = summary;
        this.trendSeries = trendSeries;
        this.statusBreakdown = statusBreakdown;
        this.categoryBreakdown = categoryBreakdown;
        this.locationBreakdown = locationBreakdown;
    }

    public SummaryDTO getSummary() {
        return summary;
    }

    public void setSummary(SummaryDTO summary) {
        this.summary = summary;
    }

    public List<TrendSeriesDTO> getTrendSeries() {
        return trendSeries;
    }

    public void setTrendSeries(List<TrendSeriesDTO> trendSeries) {
        this.trendSeries = trendSeries;
    }

    public List<StatusBreakdownDTO> getStatusBreakdown() {
        return statusBreakdown;
    }

    public void setStatusBreakdown(List<StatusBreakdownDTO> statusBreakdown) {
        this.statusBreakdown = statusBreakdown;
    }

    public List<CategoryBreakdownDTO> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(List<CategoryBreakdownDTO> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public List<LocationBreakdownDTO> getLocationBreakdown() {
        return locationBreakdown;
    }

    public void setLocationBreakdown(List<LocationBreakdownDTO> locationBreakdown) {
        this.locationBreakdown = locationBreakdown;
    }

    /**
     * Summary statistics for the analytics period
     */
    public static class SummaryDTO {
        private Long totalClaims;
        private Long approvedClaims;
        private Long rejectedClaims;
        private Long pendingClaims;
        private Double approvalRate;
        private Double avgProcessingTimeHours;

        public SummaryDTO() {
        }

        public SummaryDTO(Long totalClaims, Long approvedClaims, Long rejectedClaims, Long pendingClaims,
                          Double approvalRate, Double avgProcessingTimeHours) {
            this.totalClaims = totalClaims;
            this.approvedClaims = approvedClaims;
            this.rejectedClaims = rejectedClaims;
            this.pendingClaims = pendingClaims;
            this.approvalRate = approvalRate;
            this.avgProcessingTimeHours = avgProcessingTimeHours;
        }

        public Long getTotalClaims() {
            return totalClaims;
        }

        public void setTotalClaims(Long totalClaims) {
            this.totalClaims = totalClaims;
        }

        public Long getApprovedClaims() {
            return approvedClaims;
        }

        public void setApprovedClaims(Long approvedClaims) {
            this.approvedClaims = approvedClaims;
        }

        public Long getRejectedClaims() {
            return rejectedClaims;
        }

        public void setRejectedClaims(Long rejectedClaims) {
            this.rejectedClaims = rejectedClaims;
        }

        public Long getPendingClaims() {
            return pendingClaims;
        }

        public void setPendingClaims(Long pendingClaims) {
            this.pendingClaims = pendingClaims;
        }

        public Double getApprovalRate() {
            return approvalRate;
        }

        public void setApprovalRate(Double approvalRate) {
            this.approvalRate = approvalRate;
        }

        public Double getAvgProcessingTimeHours() {
            return avgProcessingTimeHours;
        }

        public void setAvgProcessingTimeHours(Double avgProcessingTimeHours) {
            this.avgProcessingTimeHours = avgProcessingTimeHours;
        }
    }

    /**
     * Daily claim trends
     */
    public static class TrendSeriesDTO {
        private String date;
        private Long claimsSubmitted;
        private Long claimsApproved;
        private Long claimsRejected;

        public TrendSeriesDTO() {
        }

        public TrendSeriesDTO(String date, Long claimsSubmitted, Long claimsApproved, Long claimsRejected) {
            this.date = date;
            this.claimsSubmitted = claimsSubmitted;
            this.claimsApproved = claimsApproved;
            this.claimsRejected = claimsRejected;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public Long getClaimsSubmitted() {
            return claimsSubmitted;
        }

        public void setClaimsSubmitted(Long claimsSubmitted) {
            this.claimsSubmitted = claimsSubmitted;
        }

        public Long getClaimsApproved() {
            return claimsApproved;
        }

        public void setClaimsApproved(Long claimsApproved) {
            this.claimsApproved = claimsApproved;
        }

        public Long getClaimsRejected() {
            return claimsRejected;
        }

        public void setClaimsRejected(Long claimsRejected) {
            this.claimsRejected = claimsRejected;
        }
    }

    /**
     * Claims breakdown by status
     */
    public static class StatusBreakdownDTO {
        private String status;
        private Long count;

        public StatusBreakdownDTO() {
        }

        public StatusBreakdownDTO(String status, Long count) {
            this.status = status;
            this.count = count;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Long getCount() {
            return count;
        }

        public void setCount(Long count) {
            this.count = count;
        }
    }

    /**
     * Claims breakdown by item category
     */
    public static class CategoryBreakdownDTO {
        private String category;
        private Long count;

        public CategoryBreakdownDTO() {
        }

        public CategoryBreakdownDTO(String category, Long count) {
            this.category = category;
            this.count = count;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public Long getCount() {
            return count;
        }

        public void setCount(Long count) {
            this.count = count;
        }
    }

    /**
     * Claims breakdown by location
     */
    public static class LocationBreakdownDTO {
        private String location;
        private Long count;

        public LocationBreakdownDTO() {
        }

        public LocationBreakdownDTO(String location, Long count) {
            this.location = location;
            this.count = count;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public Long getCount() {
            return count;
        }

        public void setCount(Long count) {
            this.count = count;
        }
    }
}
