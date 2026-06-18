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

    public String getDepartment() {
        return department;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getFaculty() {
        return faculty;
    }

    public String getPhone() {
        return phone;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }

    public String getYearOfStudy() {
        return yearOfStudy;
    }
}
