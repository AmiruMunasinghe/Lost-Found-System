package uom.msd.lostfound.services.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uom.msd.lostfound.dto.AnalyticsResponseDTO;
import uom.msd.lostfound.enums.ClaimStatus;
import uom.msd.lostfound.models.Claim;
import uom.msd.lostfound.models.ItemMatch;
import uom.msd.lostfound.repositories.ClaimRepository;
import uom.msd.lostfound.repositories.ItemRepository;
import uom.msd.lostfound.services.AdminAnalyticsService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;

    public AdminAnalyticsServiceImpl(ClaimRepository claimRepository, ItemRepository itemRepository) {
        this.claimRepository = claimRepository;
        this.itemRepository = itemRepository;
    }

    @Override
    public AnalyticsResponseDTO getClaimAnalytics(int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        LocalDateTime to = LocalDateTime.now();

        AnalyticsResponseDTO analytics = new AnalyticsResponseDTO();
        analytics.setSummary(getSummary(days));
        analytics.setTrendSeries(getTrendSeries(days));
        analytics.setStatusBreakdown(getStatusBreakdown(days));
        analytics.setCategoryBreakdown(getCategoryBreakdown(days));
        analytics.setLocationBreakdown(getLocationBreakdown(days));

        log.debug("Generated analytics for {} days", days);
        return analytics;
    }

    @Override
    public AnalyticsResponseDTO.SummaryDTO getSummary(int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        LocalDateTime to = LocalDateTime.now();

        // Get all claims in the date range
        List<Claim> claims = claimRepository.findByCreatedAtBetween(from, to);

        // Calculate statistics
        long totalClaims = claims.size();
        long approvedClaims = claims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.APPROVED || c.getStatus() == ClaimStatus.HANDED_OVER || c.getStatus() == ClaimStatus.CLOSED)
                .count();
        long rejectedClaims = claims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.REJECTED)
                .count();
        long pendingClaims = claims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.PENDING)
                .count();

        // Calculate approval rate
        double approvalRate = totalClaims > 0 ? (double) approvedClaims / totalClaims * 100 : 0;

        // Calculate average processing time in hours
        double avgProcessingTime = 0;
        List<Claim> processedClaims = claims.stream()
                .filter(c -> c.getStatus() != ClaimStatus.PENDING)
                .collect(Collectors.toList());
        
        if (!processedClaims.isEmpty()) {
            double totalHours = processedClaims.stream()
                    .mapToDouble(c -> {
                        long minutes = java.time.temporal.ChronoUnit.MINUTES.between(c.getRequestedAt(), c.getUpdatedAt());
                        return minutes / 60.0;
                    })
                    .sum();
            avgProcessingTime = totalHours / processedClaims.size();
        }

        return new AnalyticsResponseDTO.SummaryDTO(totalClaims, approvedClaims, rejectedClaims, 
                pendingClaims, Math.round(approvalRate * 100.0) / 100.0, 
                Math.round(avgProcessingTime * 100.0) / 100.0);
    }

    @Override
    public List<AnalyticsResponseDTO.TrendSeriesDTO> getTrendSeries(int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        LocalDateTime to = LocalDateTime.now();

        List<Claim> claims = claimRepository.findByCreatedAtBetween(from, to);

        // Group claims by date
        Map<LocalDate, List<Claim>> claimsByDate = claims.stream()
                .collect(Collectors.groupingBy(c -> c.getRequestedAt().toLocalDate()));

        // Generate trend series for each day in the range
        List<AnalyticsResponseDTO.TrendSeriesDTO> trends = new ArrayList<>();
        LocalDate current = from.toLocalDate();
        LocalDate endDate = to.toLocalDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        while (!current.isAfter(endDate)) {
            List<Claim> daysClaims = claimsByDate.getOrDefault(current, new ArrayList<>());
            
            long submitted = daysClaims.size();
            long approved = daysClaims.stream()
                    .filter(c -> c.getStatus() == ClaimStatus.APPROVED || 
                            c.getStatus() == ClaimStatus.HANDED_OVER ||
                            c.getStatus() == ClaimStatus.CLOSED)
                    .count();
            long rejected = daysClaims.stream()
                    .filter(c -> c.getStatus() == ClaimStatus.REJECTED)
                    .count();

            trends.add(new AnalyticsResponseDTO.TrendSeriesDTO(
                    current.format(formatter),
                    submitted,
                    approved,
                    rejected
            ));

            current = current.plusDays(1);
        }

        return trends;
    }

    @Override
    public List<AnalyticsResponseDTO.StatusBreakdownDTO> getStatusBreakdown(int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        LocalDateTime to = LocalDateTime.now();

        List<Claim> claims = claimRepository.findByCreatedAtBetween(from, to);

        // Group by status and count
        Map<ClaimStatus, Long> statusCounts = claims.stream()
                .collect(Collectors.groupingBy(Claim::getStatus, Collectors.counting()));

        return statusCounts.entrySet().stream()
                .map(e -> new AnalyticsResponseDTO.StatusBreakdownDTO(e.getKey().toString(), e.getValue()))
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalyticsResponseDTO.CategoryBreakdownDTO> getCategoryBreakdown(int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        LocalDateTime to = LocalDateTime.now();

        List<Claim> claims = claimRepository.findByCreatedAtBetween(from, to);

        // Get item categories from matched items
        Map<String, Long> categoryCounts = new HashMap<>();
        for (Claim claim : claims) {
            ItemMatch match = claim.getItemMatch();
            if (match != null && match.getLostItem() != null) {
                String category = match.getLostItem().getCategory();
                if (category != null && !category.isEmpty()) {
                    categoryCounts.put(category, categoryCounts.getOrDefault(category, 0L) + 1);
                }
            }
        }

        return categoryCounts.entrySet().stream()
                .map(e -> new AnalyticsResponseDTO.CategoryBreakdownDTO(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalyticsResponseDTO.LocationBreakdownDTO> getLocationBreakdown(int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        LocalDateTime to = LocalDateTime.now();

        List<Claim> claims = claimRepository.findByCreatedAtBetween(from, to);

        // Get item locations from matched items
        Map<String, Long> locationCounts = new HashMap<>();
        for (Claim claim : claims) {
            ItemMatch match = claim.getItemMatch();
            if (match != null && match.getLostItem() != null) {
                String location = match.getLostItem().getLocation();
                if (location != null && !location.isEmpty()) {
                    locationCounts.put(location, locationCounts.getOrDefault(location, 0L) + 1);
                }
            }
        }

        return locationCounts.entrySet().stream()
                .map(e -> new AnalyticsResponseDTO.LocationBreakdownDTO(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());
    }
}
