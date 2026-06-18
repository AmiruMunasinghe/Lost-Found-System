package uom.msd.lostfound.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for paginated list of claims
 */
public class ClaimListResponseDTO {
    private List<ClaimResponseDTO> claims;
    private Long totalCount;
    private Integer page;
    private Integer size;
    private Integer totalPages;
    private Boolean hasNext;
    private Boolean hasPrevious;

    public ClaimListResponseDTO() {
        this.claims = new ArrayList<>();
    }

    public ClaimListResponseDTO(List<ClaimResponseDTO> claims, Long totalCount, Integer page,
                               Integer size, Integer totalPages, Boolean hasNext, Boolean hasPrevious) {
        this.claims = claims;
        this.totalCount = totalCount;
        this.page = page;
        this.size = size;
        this.totalPages = totalPages;
        this.hasNext = hasNext;
        this.hasPrevious = hasPrevious;
    }

    public List<ClaimResponseDTO> getClaims() {
        return claims;
    }

    public void setClaims(List<ClaimResponseDTO> claims) {
        this.claims = claims;
    }

    public Long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Long totalCount) {
        this.totalCount = totalCount;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }

    public Boolean getHasNext() {
        return hasNext;
    }

    public void setHasNext(Boolean hasNext) {
        this.hasNext = hasNext;
    }

    public Boolean getHasPrevious() {
        return hasPrevious;
    }

    public void setHasPrevious(Boolean hasPrevious) {
        this.hasPrevious = hasPrevious;
    }
}
