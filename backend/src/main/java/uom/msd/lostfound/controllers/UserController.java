package uom.msd.lostfound.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uom.msd.lostfound.auth.AuthenticatedUser;
import uom.msd.lostfound.dto.UpdateProfileRequest;
import uom.msd.lostfound.dto.UserResponse;
import uom.msd.lostfound.services.UserService;

import java.io.IOException;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateProfile(authenticatedUser.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/photo")
    public ResponseEntity<UserResponse> uploadProfilePhoto(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam("file") MultipartFile file) {
        try {
            UserResponse response = userService.uploadProfilePhoto(authenticatedUser.getId(), file);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
