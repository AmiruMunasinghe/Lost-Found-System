package uom.msd.lostfound.dto;

import uom.msd.lostfound.enums.ReportType;
import java.util.List;

public class ItemRequestDTO {
    private String title;
    private String description;
    private String category;
    private String location;
    private ReportType reportType;
    private List<String> imageUrls;

    public ItemRequestDTO() {
    }

    public ItemRequestDTO(String title, String description, String category, String location, ReportType reportType) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.location = location;
        this.reportType = reportType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
