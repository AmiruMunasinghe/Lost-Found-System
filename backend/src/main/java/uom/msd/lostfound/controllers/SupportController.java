package uom.msd.lostfound.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import uom.msd.lostfound.auth.AuthenticatedUser;
import uom.msd.lostfound.dto.SupportRequest;
import uom.msd.lostfound.emails.EmailService;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.UserRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class SupportController {

    private final EmailService emailService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Map<String, String>> submitSupportRequest(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody SupportRequest request) {
            
        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        emailService.sendSupportEmail(user.getEmail(), request.getSubject(), request.getMessage());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Support request sent successfully");
        return ResponseEntity.ok(response);
    }
}
