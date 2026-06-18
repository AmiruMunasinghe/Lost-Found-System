package uom.msd.lostfound.services;

import uom.msd.lostfound.dto.AnalyticsResponseDTO;

/**
 * Service interface for admin analytics and reporting
 */
public interface AdminAnalyticsService {
    /**
     * Get comprehensive claim analytics for a given range (in days)
     * @param days number of days to look back (e.g., 7, 30, 90)
     */
    AnalyticsResponseDTO getClaimAnalytics(int days);

    /**
     * Get summary statistics for claims in the given range
     */
    AnalyticsResponseDTO.SummaryDTO getSummary(int days);

    /**
     * Get trending data for claims (daily aggregation)
     */
    java.util.List<AnalyticsResponseDTO.TrendSeriesDTO> getTrendSeries(int days);

    /**
     * Get claim count breakdown by status
     */
    java.util.List<AnalyticsResponseDTO.StatusBreakdownDTO> getStatusBreakdown(int days);

    /**
     * Get claim count breakdown by item category
     */
    java.util.List<AnalyticsResponseDTO.CategoryBreakdownDTO> getCategoryBreakdown(int days);

    /**
     * Get claim count breakdown by location
     */
    java.util.List<AnalyticsResponseDTO.LocationBreakdownDTO> getLocationBreakdown(int days);
}
