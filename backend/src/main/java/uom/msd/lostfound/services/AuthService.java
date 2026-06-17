package uom.msd.lostfound.services;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uom.msd.lostfound.auth.JwtUtil;
import uom.msd.lostfound.dto.AuthResponse;
import uom.msd.lostfound.dto.LoginRequest;
import uom.msd.lostfound.dto.RegisterRequest;
import uom.msd.lostfound.dto.UserResponse;
import uom.msd.lostfound.exceptions.DuplicateUsernameException;
import uom.msd.lostfound.exceptions.ResourceNotFoundException;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.UserRepository;

@Service
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedUsername = request.getUsername().trim();
        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new DuplicateUsernameException("Username is already taken");
        }

        User user = new User(
                normalizedUsername,
                normalizeEmail(request.getEmail()),
                passwordEncoder.encode(request.getPassword())
        );

        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        return toUserResponse(findUserById(userId));
    }

    @Transactional(readOnly = true)
    public User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AuthResponse buildAuthResponse(User user) {
        return new AuthResponse(
                jwtUtil.generateToken(user),
                toUserResponse(user)
        );
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim();
    }
}
