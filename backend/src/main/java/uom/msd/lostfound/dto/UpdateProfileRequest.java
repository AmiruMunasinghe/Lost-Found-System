package uom.msd.lostfound.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String studentId;
    private String faculty;
    private String department;
    private String yearOfStudy;
}
