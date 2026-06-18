package uom.msd.lostfound.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import uom.msd.lostfound.dto.UpdateProfileRequest;
import uom.msd.lostfound.dto.UserResponse;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.UserRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    // Define the upload directory
    @Value("${app.upload.dir:uploads/profile_photos}")
    private String uploadDir;

    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = authService.findUserById(userId);

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getStudentId() != null) user.setStudentId(request.getStudentId());
        if (request.getFaculty() != null) user.setFaculty(request.getFaculty());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getYearOfStudy() != null) user.setYearOfStudy(request.getYearOfStudy());

        userRepository.save(user);

        return authService.getCurrentUser(userId);
    }

    public UserResponse uploadProfilePhoto(Long userId, MultipartFile file) throws IOException {
        User user = authService.findUserById(userId);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(fileName);

        // Copy file to the target location (Replacing existing file with the same name)
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Save URL in database
        String fileUrl = "/uploads/profile_photos/" + fileName;
        user.setProfileImageUrl(fileUrl);
        userRepository.save(user);

        return authService.getCurrentUser(userId);
    }
    public UserResponse getUserById(Long userId) {
        User user = authService.findUserById(userId);
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getFullName(),
                user.getPhone(),
                user.getStudentId(),
                user.getFaculty(),
                user.getDepartment(),
                user.getYearOfStudy(),
                user.getProfileImageUrl()
        );
    }
}
}
